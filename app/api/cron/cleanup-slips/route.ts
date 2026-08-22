import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find payments that belong to CANCELLED bookings or groups, and have a slipUrl, updated > 30 days ago
    const oldPayments = await prisma.payment.findMany({
      where: {
        status: "REJECTED",
        updatedAt: { lt: thirtyDaysAgo },
        slipUrl: { not: null }
      },
    });

    let deletedCount = 0;
    const errors: string[] = [];

    for (const payment of oldPayments) {
      if (!payment.slipUrl) continue;

      try {
        let bucketName = "class-media"; // default but usually 'slips'
        let filePath = "";
        
        const matches = payment.slipUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
        if (matches) {
            bucketName = matches[1];
            filePath = decodeURIComponent(matches[2]);
        }
        
        if (bucketName && filePath) {
            const { error: deleteError } = await supabaseAdmin.storage
            .from(bucketName)
            .remove([filePath]);

            if (deleteError) {
                console.error(`Failed to delete ${filePath} from ${bucketName}:`, deleteError);
                errors.push(`Failed to delete ${filePath}: ${deleteError.message}`);
                continue; // don't update db if it failed
            }
        }

        // Remove the slipUrl from the payment record so we don't try again
        await prisma.payment.update({
          where: { id: payment.id },
          data: { slipUrl: null }
        });
        
        deletedCount++;

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        errors.push(`Error processing payment ${payment.id}: ${msg}`);
      }
    }

    return NextResponse.json({
      success: true,
      processed: oldPayments.length,
      deleted: deletedCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error: unknown) {
    console.error("Cleanup slips cron error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { createSlipSignedUrl } from "@/lib/slips";

export const dynamic = "force-dynamic";

// Serves a payment slip to its owner or an admin via a short-lived signed URL
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  const { paymentId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: {
      slipUrl: true,
      booking: { select: { userId: true } },
      bookingGroup: { select: { userId: true } },
    },
  });

  if (!payment?.slipUrl) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ownerId = payment.booking?.userId ?? payment.bookingGroup?.userId;
  if (ownerId !== user.id) {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
    if (dbUser?.role !== "ADMIN") {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  const signedUrl = await createSlipSignedUrl(payment.slipUrl);
  if (!signedUrl) {
    return new NextResponse("Not found", { status: 404 });
  }

  const response = NextResponse.redirect(signedUrl);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

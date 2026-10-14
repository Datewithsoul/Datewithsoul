import { NextResponse } from "next/server";
import { expireStaleBookings } from "@/lib/expire-bookings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn("Unauthorized cron access attempt");
      return new Response("Unauthorized", { status: 401 });
    }

    const result = await expireStaleBookings();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Error expiring bookings:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

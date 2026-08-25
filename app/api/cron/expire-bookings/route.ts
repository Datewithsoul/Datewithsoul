import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTemplatedLineMessage, notifyAdminsTemplated } from "@/lib/line";
import { BookingStatus, PaymentStatus, BookingGroupStatus } from "@/app/generated/prisma";
import { PAYABLE_BOOKING_STATUSES } from "@/lib/booking-status";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn("Unauthorized cron access attempt");
      return new Response("Unauthorized", { status: 401 });
    }

    const now = new Date();
    // Bookings expire after 10 minutes (600,000 ms)
    const expirationThreshold = new Date(now.getTime() - 10 * 60 * 1000);

    // 1. Find expired single bookings
    const expiredBookings = await prisma.booking.findMany({
      where: {
        createdAt: { lt: expirationThreshold },
        status: { in: ["PENDING_PAYMENT"] },
        bookingGroupId: null // single bookings
      },
      include: {
        user: true,
        classEvent: true,
      }
    });

    let expiredCount = 0;

    for (const booking of expiredBookings) {
      await prisma.$transaction(async (tx) => {
        // Double check status inside tx
        const b = await tx.booking.findUnique({ where: { id: booking.id } });
        if (!b || b.status !== "PENDING_PAYMENT") return;

        await tx.booking.update({
          where: { id: booking.id },
          data: { status: BookingStatus.CANCELLED }
        });

        await tx.classEvent.update({
          where: { id: booking.classEventId },
          data: { totalSeats: { increment: booking.seats } }
        });

        await tx.payment.updateMany({
          where: { bookingId: booking.id },
          data: { status: PaymentStatus.REJECTED }
        });
      });

      if (booking.user.lineId) {
        await sendTemplatedLineMessage(
          booking.user.lineId,
          "BOOKING_EXPIRED_USER",
          {
            userName: booking.user.name,
            className: booking.classEvent.name,
          },
          {
            userId: booking.userId,
            bookingId: booking.id,
            type: "BOOKING_EXPIRED",
          }
        );
      }

      await notifyAdminsTemplated("ADMIN_BOOKING_EXPIRED", {
        userName: booking.user.name,
        className: booking.classEvent.name,
      });

      expiredCount++;
    }

    // 2. Find expired group bookings
    const expiredGroups = await prisma.bookingGroup.findMany({
      where: {
        createdAt: { lt: expirationThreshold },
        status: { in: ["PENDING"] }
      },
      include: {
        user: true,
        bookings: { include: { classEvent: true } }
      }
    });

    let expiredGroupCount = 0;

    for (const group of expiredGroups) {
      await prisma.$transaction(async (tx) => {
        const g = await tx.bookingGroup.findUnique({ where: { id: group.id } });
        if (!g || g.status !== "PENDING") return;

        await tx.bookingGroup.update({
          where: { id: group.id },
          data: { status: BookingGroupStatus.CANCELLED }
        });

        for (const b of group.bookings) {
          await tx.booking.update({
            where: { id: b.id },
            data: { status: BookingStatus.CANCELLED }
          });
          
          await tx.classEvent.update({
            where: { id: b.classEventId },
            data: { totalSeats: { increment: b.seats } }
          });
        }

        await tx.payment.updateMany({
          where: { bookingGroupId: group.id },
          data: { status: PaymentStatus.REJECTED }
        });
      });

      if (group.user.lineId) {
        await sendTemplatedLineMessage(
          group.user.lineId,
          "BOOKING_EXPIRED_USER",
          {
            userName: group.user.name,
            className: group.bookings.map(b => b.classEvent.name).join(", "),
          },
          {
            userId: group.userId,
            type: "BOOKING_EXPIRED",
          }
        );
      }

      await notifyAdminsTemplated("ADMIN_BOOKING_EXPIRED", {
        userName: group.user.name,
        className: group.bookings.map(b => b.classEvent.name).join(", "),
      });

      expiredGroupCount++;
    }

    return NextResponse.json({ 
      success: true, 
      expiredSingleBookings: expiredCount,
      expiredGroupBookings: expiredGroupCount 
    });
  } catch (error) {
    console.error("Error expiring bookings:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}


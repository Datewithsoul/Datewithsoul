import { prisma } from "@/lib/prisma";
import { sendTemplatedLineMessage, notifyAdminsTemplated } from "@/lib/line";
import { BookingStatus, PaymentStatus, BookingGroupStatus } from "@/app/generated/prisma";

// Unpaid bookings release their seats after this window
export const PAYMENT_WINDOW_MS = 10 * 60 * 1000;

/**
 * Cancels unpaid bookings older than the payment window and returns their seats.
 * Safe to run concurrently: every status change is a conditional update, so a
 * booking can only be expired (and its seats released) once.
 */
export async function expireStaleBookings() {
  const expirationThreshold = new Date(Date.now() - PAYMENT_WINDOW_MS);

  // 1. Single bookings
  const expiredBookings = await prisma.booking.findMany({
    where: {
      createdAt: { lte: expirationThreshold },
      status: BookingStatus.PENDING_PAYMENT,
      bookingGroupId: null,
    },
    include: { user: true, classEvent: true },
  });

  let expiredCount = 0;

  for (const booking of expiredBookings) {
    const expired = await prisma.$transaction(async (tx) => {
      const updated = await tx.booking.updateMany({
        where: { id: booking.id, status: BookingStatus.PENDING_PAYMENT },
        data: { status: BookingStatus.CANCELLED },
      });
      if (updated.count === 0) return false;

      await tx.classEvent.update({
        where: { id: booking.classEventId },
        data: { totalSeats: { increment: booking.seats } },
      });

      await tx.payment.updateMany({
        where: { bookingId: booking.id },
        data: { status: PaymentStatus.REJECTED },
      });
      return true;
    });

    if (!expired) continue;
    expiredCount++;

    try {
      if (booking.user.lineId) {
        await sendTemplatedLineMessage(
          booking.user.lineId,
          "BOOKING_EXPIRED_USER",
          { userName: booking.user.name, className: booking.classEvent.name },
          { userId: booking.userId, bookingId: booking.id, type: "BOOKING_EXPIRED" }
        );
      }
      await notifyAdminsTemplated("ADMIN_BOOKING_EXPIRED", {
        userName: booking.user.name,
        className: booking.classEvent.name,
      });
    } catch (error) {
      console.error("Failed to send expiry notification", error);
    }
  }

  // 2. Group bookings
  const expiredGroups = await prisma.bookingGroup.findMany({
    where: {
      createdAt: { lte: expirationThreshold },
      status: BookingGroupStatus.PENDING_PAYMENT,
    },
    include: {
      user: true,
      bookings: { include: { classEvent: true } },
    },
  });

  let expiredGroupCount = 0;

  for (const group of expiredGroups) {
    const expired = await prisma.$transaction(async (tx) => {
      const updatedGroup = await tx.bookingGroup.updateMany({
        where: { id: group.id, status: BookingGroupStatus.PENDING_PAYMENT },
        data: { status: BookingGroupStatus.CANCELLED },
      });
      if (updatedGroup.count === 0) return false;

      for (const b of group.bookings) {
        const updated = await tx.booking.updateMany({
          where: { id: b.id, status: BookingStatus.PENDING_PAYMENT },
          data: { status: BookingStatus.CANCELLED },
        });
        if (updated.count === 0) continue;

        await tx.classEvent.update({
          where: { id: b.classEventId },
          data: { totalSeats: { increment: b.seats } },
        });
      }

      await tx.payment.updateMany({
        where: { bookingGroupId: group.id },
        data: { status: PaymentStatus.REJECTED },
      });
      return true;
    });

    if (!expired) continue;
    expiredGroupCount++;

    const classNames = group.bookings.map((b) => b.classEvent.name).join(", ");
    try {
      if (group.user.lineId) {
        await sendTemplatedLineMessage(
          group.user.lineId,
          "BOOKING_EXPIRED_USER",
          { userName: group.user.name, className: classNames },
          { userId: group.userId, type: "BOOKING_EXPIRED" }
        );
      }
      await notifyAdminsTemplated("ADMIN_BOOKING_EXPIRED", {
        userName: group.user.name,
        className: classNames,
      });
    } catch (error) {
      console.error("Failed to send expiry notification", error);
    }
  }

  return { expiredSingleBookings: expiredCount, expiredGroupBookings: expiredGroupCount };
}

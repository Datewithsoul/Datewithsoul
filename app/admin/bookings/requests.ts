import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { BookingStatus, PaymentStatus, RequestStatus, RequestType } from "@/app/generated/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { sendLineMessage, sendTemplatedLineMessage } from "@/lib/line";
import { isBookingStatus, paymentStatusForBooking } from "@/lib/booking-status";

export async function approveRequest(requestId: string) {
  const admin = await requireAdmin();
  const request = await prisma.changeRequest.findUnique({
    where: { id: requestId },
    include: { booking: { include: { payment: true, user: true } }, requestedEvent: true }
  });

  if (!request || request.status !== RequestStatus.PENDING) {
    return { success: false, error: "ไม่พบคำขอ หรือคำขอนี้ไม่ได้อยู่ในสถานะรออนุมัติ" };
  }

  await prisma.$transaction(async (tx) => {
    if (request.type === RequestType.CANCELLATION) {
      // 1. Change the booking status to CANCELLED
      await tx.booking.update({
        where: { id: request.bookingId },
        data: { status: BookingStatus.CANCELLED }
      });
      // 2. Change the payment status to REFUND_PENDING
      if (request.booking.payment) {
        await tx.payment.update({
          where: { id: request.booking.payment.id },
          data: { status: PaymentStatus.REFUND_PENDING }
        });
      }
      // 3. Release the original seat
      await tx.classEvent.update({
        where: { id: request.booking.classEventId },
        data: { totalSeats: { increment: request.booking.seats } }
      });
    } else if (request.type === RequestType.COURSE_CHANGE) {
      if (!request.requestedEventId) throw new Error("Missing requested event ID");
      // Check availability
      const requestedEvent = await tx.classEvent.findUnique({ where: { id: request.requestedEventId } });
      if (!requestedEvent || requestedEvent.totalSeats < request.booking.seats) {
        throw new Error("ที่นั่งในรอบใหม่ไม่เพียงพอ");
      }
      // Lock both the original and requested sessions by updating them
      // Release seat in original
      await tx.classEvent.update({
        where: { id: request.booking.classEventId },
        data: { totalSeats: { increment: request.booking.seats } }
      });
      // Reduce seat in new
      await tx.classEvent.update({
        where: { id: request.requestedEventId },
        data: { totalSeats: { decrement: request.booking.seats } }
      });
      // Update booking session
      await tx.booking.update({
        where: { id: request.bookingId },
        data: {
          classEventId: request.requestedEventId,
          changeCount: { increment: 1 },
          status: BookingStatus.CONFIRMED // reset status if it was CHANGE_REQUESTED
        }
      });
    }

    // Complete request
    await tx.changeRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.APPROVED,
        approvedById: admin.id,
        completedAt: new Date()
      }
    });
  });

  // Notify customer
  if (request.booking.user.lineId) {
    if (request.type === RequestType.CANCELLATION) {
      await sendTemplatedLineMessage(
        request.booking.user.lineId,
        "REQUEST_CANCEL_APPROVED_USER",
        {
          userName: request.booking.user.name,
          className: request.booking.classEventId || "",
        },
        {
          userId: request.booking.userId,
          bookingId: request.bookingId,
          type: "REQUEST_CANCEL_APPROVED",
        }
      );
    } else {
      await sendTemplatedLineMessage(
        request.booking.user.lineId,
        "REQUEST_CHANGE_APPROVED_USER",
        {
          userName: request.booking.user.name,
          className: request.booking.classEventId || "",
          newClassName: request.requestedEvent?.name || "",
        },
        {
          userId: request.booking.userId,
          bookingId: request.bookingId,
          type: "REQUEST_CHANGE_APPROVED",
        }
      );
    }
  }

  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function rejectRequest(requestId: string, reason: string) {
  const admin = await requireAdmin();
  const request = await prisma.changeRequest.findUnique({
    where: { id: requestId },
    include: { booking: { include: { user: true } } }
  });

  if (!request || request.status !== RequestStatus.PENDING) {
    return { success: false, error: "ไม่พบคำขอ หรือคำขอนี้ไม่ได้อยู่ในสถานะรออนุมัติ" };
  }

  await prisma.$transaction(async (tx) => {
    // Revert booking status back to previous valid state (CONFIRMED)
    // In a real app we might store the previous status in the request.
    await tx.booking.update({
      where: { id: request.bookingId },
      data: { status: BookingStatus.CONFIRMED }
    });

    await tx.changeRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.REJECTED,
        adminDecision: "REJECTED",
        adminReason: reason,
        approvedById: admin.id,
        completedAt: new Date()
      }
    });
  });

  // Notify customer
  if (request.booking.user.lineId) {
    await sendTemplatedLineMessage(
      request.booking.user.lineId,
      "REQUEST_REJECTED_USER",
      {
        userName: request.booking.user.name,
        requestType: request.type === RequestType.CANCELLATION ? "ยกเลิกการจอง" : "เปลี่ยนรอบเรียน",
        reason: reason,
      },
      {
        userId: request.booking.userId,
        bookingId: request.bookingId,
        type: "REQUEST_REJECTED",
      }
    );
  }

  revalidatePath("/admin/bookings");
  return { success: true };
}

export async function markRefunded(bookingId: string) {
  const admin = await requireAdmin();
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true, user: true }
  });
  if (!booking || !booking.payment || booking.payment.status !== PaymentStatus.REFUND_PENDING) {
    return { success: false, error: "ไม่พบการจองที่รอการคืนเงิน" };
  }
  await prisma.payment.update({
    where: { id: booking.payment.id },
    data: { status: PaymentStatus.REFUNDED }
  });
  if (booking.user.lineId) {
    await sendTemplatedLineMessage(
      booking.user.lineId,
      "REFUND_COMPLETED_USER",
      {
        userName: booking.user.name,
      },
      {
        userId: booking.userId,
        bookingId: booking.id,
        type: "REFUND_COMPLETED",
      }
    );
  }
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/payments");
  return { success: true };
}


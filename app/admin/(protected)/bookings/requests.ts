"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { BookingStatus, PaymentStatus, Prisma, RequestStatus, RequestType } from "@/app/generated/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { sendTemplatedLineMessage } from "@/lib/line";
import { formatClassEventLabel } from "@/lib/class-event-label";
import { paidAmountForBooking } from "@/lib/revenue";

type RequestActionResult = { success: true } | { success: false; error: string };

const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  COURSE_CHANGE: "เปลี่ยนรอบเรียน",
  CANCELLATION: "ยกเลิกการจอง",
};

const requestWithBooking = {
  include: {
    booking: {
      include: {
        user: true,
        classEvent: true,
        bookingGroup: { select: { totalPrice: true, discountAmount: true } },
      },
    },
  },
} satisfies Prisma.ChangeRequestDefaultArgs;

type RequestWithBooking = Prisma.ChangeRequestGetPayload<typeof requestWithBooking>;

function revalidateRequestPages() {
  // Requests, bookings, dashboard and the sidebar's pending counts
  revalidatePath("/admin/(protected)", "layout");
  revalidatePath("/bookings");
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

/**
 * Moves a request out of `from` inside the transaction. Conditional, so two admins
 * clicking at once can't both act on it (and move seats twice).
 */
async function claimRequest(
  tx: Prisma.TransactionClient,
  requestId: string,
  from: RequestStatus,
  data: Prisma.ChangeRequestUncheckedUpdateManyInput
) {
  const claimed = await tx.changeRequest.updateMany({
    where: { id: requestId, status: from },
    data,
  });
  if (claimed.count !== 1) {
    throw new Error("คำขอนี้ถูกดำเนินการไปแล้ว กรุณารีเฟรชหน้า");
  }
}

/** The payment this booking was paid with: its own, or its cart's. */
function findBookingPayment(tx: Prisma.TransactionClient, booking: RequestWithBooking["booking"]) {
  return booking.bookingGroupId
    ? tx.payment.findUnique({ where: { bookingGroupId: booking.bookingGroupId } })
    : tx.payment.findUnique({ where: { bookingId: booking.id } });
}

/**
 * True when nothing else is paid for by this booking's payment any more
 * (a single booking, or the last uncancelled booking of a cart).
 */
async function paymentCoversOnlyCancelledBookings(tx: Prisma.TransactionClient, booking: RequestWithBooking["booking"]) {
  if (!booking.bookingGroupId) return true;
  const stillActive = await tx.booking.count({
    where: { bookingGroupId: booking.bookingGroupId, status: { not: BookingStatus.CANCELLED } },
  });
  return stillActive === 0;
}

async function setPaymentStatus(
  tx: Prisma.TransactionClient,
  payment: { id: string; status: PaymentStatus },
  status: PaymentStatus,
  reviewerId: string,
  reason?: string
) {
  if (payment.status === status) return;
  await tx.payment.update({ where: { id: payment.id }, data: { status } });
  await tx.paymentReviewLog.create({
    data: { paymentId: payment.id, reviewerId, previousStatus: payment.status, newStatus: status, reason },
  });
}

async function approveCourseChange(request: RequestWithBooking, adminId: string, overrideEventId?: string) {
  const { booking } = request;
  const finalEventId = overrideEventId || request.requestedEventId;
  if (!finalEventId) throw new Error("ไม่พบรอบเรียนที่ลูกค้าขอเปลี่ยน");
  if (finalEventId === booking.classEventId) throw new Error("รอบเรียนที่เลือกเป็นรอบเดิมอยู่แล้ว");

  const newEvent = await prisma.classEvent.findUnique({ where: { id: finalEventId } });
  if (!newEvent || newEvent.deletedAt) throw new Error("ไม่พบรอบเรียนที่เลือก");

  await prisma.$transaction(async (tx) => {
    await claimRequest(tx, request.id, RequestStatus.PENDING, {
      status: RequestStatus.APPROVED,
      adminDecision: "APPROVED",
      approvedById: adminId,
      requestedEventId: finalEventId,
      completedAt: new Date(),
    });

    // Take the seats only if they're still there (same pattern as lib/expire-bookings.ts)
    const reserved = await tx.classEvent.updateMany({
      where: { id: finalEventId, totalSeats: { gte: booking.seats } },
      data: { totalSeats: { decrement: booking.seats } },
    });
    if (reserved.count !== 1) throw new Error("ที่นั่งในรอบที่เลือกไม่เพียงพอ");

    await tx.classEvent.update({
      where: { id: booking.classEventId },
      data: { totalSeats: { increment: booking.seats } },
    });

    await tx.booking.update({
      where: { id: booking.id },
      data: {
        classEventId: finalEventId,
        changeCount: { increment: 1 },
        status: BookingStatus.CONFIRMED,
      },
    });
  });

  await sendTemplatedLineMessage(
    booking.user.lineId,
    "REQUEST_CHANGE_APPROVED_USER",
    {
      userName: booking.user.name,
      className: formatClassEventLabel(booking.classEvent),
      newClassName: formatClassEventLabel(newEvent),
    },
    { userId: booking.userId, bookingId: booking.id, type: "REQUEST_CHANGE_APPROVED" }
  );
}

async function approveCancellation(request: RequestWithBooking, adminId: string) {
  const { booking } = request;
  const refundAmount = paidAmountForBooking(booking);

  await prisma.$transaction(async (tx) => {
    // APPROVED = cancelled, refund still to be transferred; markRefunded completes it
    await claimRequest(tx, request.id, RequestStatus.PENDING, {
      status: RequestStatus.APPROVED,
      adminDecision: "APPROVED",
      approvedById: adminId,
      newPrice: refundAmount,
    });

    const cancelled = await tx.booking.updateMany({
      where: { id: booking.id, status: BookingStatus.CANCELLATION_REQUESTED },
      data: { status: BookingStatus.CANCELLED },
    });
    if (cancelled.count !== 1) throw new Error("สถานะการจองเปลี่ยนไปแล้ว กรุณารีเฟรชหน้า");

    await tx.classEvent.update({
      where: { id: booking.classEventId },
      data: { totalSeats: { increment: booking.seats } },
    });

    // A cart's payment still covers its other classes until every one of them is cancelled
    if (!(await paymentCoversOnlyCancelledBookings(tx, booking))) return;

    if (booking.bookingGroupId) {
      await tx.bookingGroup.update({
        where: { id: booking.bookingGroupId },
        data: { status: "CANCELLED" },
      });
    }
    const payment = await findBookingPayment(tx, booking);
    if (payment) {
      await setPaymentStatus(tx, payment, PaymentStatus.REFUND_PENDING, adminId, request.customerReason ?? undefined);
    }
  });

  await sendTemplatedLineMessage(
    booking.user.lineId,
    "REQUEST_CANCEL_APPROVED_USER",
    {
      userName: booking.user.name,
      className: formatClassEventLabel(booking.classEvent),
      refundAmount: refundAmount.toLocaleString("th-TH"),
    },
    { userId: booking.userId, bookingId: booking.id, type: "REQUEST_CANCEL_APPROVED" }
  );
}

export async function approveRequest(requestId: string, overrideEventId?: string): Promise<RequestActionResult> {
  const admin = await requireAdmin();
  const request = await prisma.changeRequest.findUnique({ where: { id: requestId }, ...requestWithBooking });

  if (!request || request.status !== RequestStatus.PENDING) {
    return { success: false, error: "ไม่พบคำขอ หรือคำขอนี้ไม่ได้อยู่ในสถานะรออนุมัติ" };
  }

  try {
    if (request.type === RequestType.CANCELLATION) {
      await approveCancellation(request, admin.id);
    } else {
      await approveCourseChange(request, admin.id, overrideEventId);
    }
  } catch (error) {
    return { success: false, error: errorMessage(error, "เกิดข้อผิดพลาดในการอนุมัติคำขอ") };
  }

  revalidateRequestPages();
  return { success: true };
}

export async function rejectRequest(requestId: string, reason: string): Promise<RequestActionResult> {
  const admin = await requireAdmin();
  const request = await prisma.changeRequest.findUnique({ where: { id: requestId }, ...requestWithBooking });

  if (!request || request.status !== RequestStatus.PENDING) {
    return { success: false, error: "ไม่พบคำขอ หรือคำขอนี้ไม่ได้อยู่ในสถานะรออนุมัติ" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await claimRequest(tx, requestId, RequestStatus.PENDING, {
        status: RequestStatus.REJECTED,
        adminDecision: "REJECTED",
        adminReason: reason,
        approvedById: admin.id,
        completedAt: new Date(),
      });

      // Only a booking still waiting on this request goes back to CONFIRMED
      await tx.booking.updateMany({
        where: {
          id: request.bookingId,
          status: { in: [BookingStatus.CHANGE_REQUESTED, BookingStatus.CANCELLATION_REQUESTED] },
        },
        data: { status: BookingStatus.CONFIRMED },
      });
    });
  } catch (error) {
    return { success: false, error: errorMessage(error, "เกิดข้อผิดพลาดในการปฏิเสธคำขอ") };
  }

  await sendTemplatedLineMessage(
    request.booking.user.lineId,
    "REQUEST_REJECTED_USER",
    {
      userName: request.booking.user.name,
      className: formatClassEventLabel(request.booking.classEvent),
      requestType: REQUEST_TYPE_LABELS[request.type],
      reason,
    },
    { userId: request.booking.userId, bookingId: request.bookingId, type: "REQUEST_REJECTED" }
  );

  revalidateRequestPages();
  return { success: true };
}

/** Admin confirms the refund for an approved cancellation was transferred to the customer. */
export async function markRefunded(requestId: string): Promise<RequestActionResult> {
  const admin = await requireAdmin();
  const request = await prisma.changeRequest.findUnique({ where: { id: requestId }, ...requestWithBooking });

  if (!request || request.type !== RequestType.CANCELLATION || request.status !== RequestStatus.APPROVED) {
    return { success: false, error: "ไม่พบรายการที่รอคืนเงิน" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await claimRequest(tx, requestId, RequestStatus.APPROVED, {
        status: RequestStatus.COMPLETED,
        completedAt: new Date(),
      });

      const payment = await findBookingPayment(tx, request.booking);
      if (payment?.status === PaymentStatus.REFUND_PENDING) {
        await setPaymentStatus(tx, payment, PaymentStatus.REFUNDED, admin.id);
      }
    });
  } catch (error) {
    return { success: false, error: errorMessage(error, "บันทึกการคืนเงินไม่สำเร็จ") };
  }

  await sendTemplatedLineMessage(
    request.booking.user.lineId,
    "REFUND_COMPLETED_USER",
    {
      userName: request.booking.user.name,
      className: formatClassEventLabel(request.booking.classEvent),
      refundAmount: (request.newPrice ?? 0).toLocaleString("th-TH"),
    },
    { userId: request.booking.userId, bookingId: request.bookingId, type: "REFUND_COMPLETED" }
  );

  revalidateRequestPages();
  return { success: true };
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { RequestType, BookingStatus, RequestStatus } from "@/app/generated/prisma";
import { notifyAdminsTemplated, sendTemplatedLineMessage } from "@/lib/line";
import { createClient } from "@/utils/supabase/server";
import { CANCELLATION_DEADLINE_DAYS, canRequestCancellation } from "@/lib/booking-status";
import { formatClassEventLabel } from "@/lib/class-event-label";

// Booking status while a request of each type waits for an admin
const REQUESTED_BOOKING_STATUS: Record<RequestType, BookingStatus> = {
  COURSE_CHANGE: BookingStatus.CHANGE_REQUESTED,
  CANCELLATION: BookingStatus.CANCELLATION_REQUESTED,
};

export async function createChangeRequest(
  bookingId: string,
  type: RequestType,
  reason: string,
  requestedEventId?: string
) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return { success: false, error: "Unauthorized" };
    }

    const dbUser = await prisma.user.findUnique({ where: { id: authUser.id } });
    if (!dbUser) {
      return { success: false, error: "User not found" };
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { classEvent: true, user: true },
    });

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    if (booking.userId !== dbUser.id) {
      return { success: false, error: "Forbidden" };
    }

    if (!(type in REQUESTED_BOOKING_STATUS)) {
      return { success: false, error: "ไม่รองรับคำขอประเภทนี้" };
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      return { success: false, error: "เฉพาะการจองที่ยืนยันแล้วเท่านั้นที่สามารถส่งคำขอได้" };
    }

    if (type === RequestType.CANCELLATION && !canRequestCancellation(booking.classEvent.date)) {
      return {
        success: false,
        error: `ขอยกเลิกได้ล่วงหน้าอย่างน้อย ${CANCELLATION_DEADLINE_DAYS} วันก่อนวันเรียน กรุณาติดต่อแอดมินทาง LINE`,
      };
    }

    const requestedEvent =
      type === RequestType.COURSE_CHANGE && requestedEventId
        ? await prisma.classEvent.findUnique({ where: { id: requestedEventId } })
        : null;
    if (type === RequestType.COURSE_CHANGE && (!requestedEvent || requestedEvent.deletedAt)) {
      return { success: false, error: "ไม่พบรอบเรียนที่เลือก" };
    }

    const created = await prisma.$transaction(async (tx) => {
      // Conditional: a double-submit can't create two requests for one booking
      const moved = await tx.booking.updateMany({
        where: { id: booking.id, status: BookingStatus.CONFIRMED },
        data: { status: REQUESTED_BOOKING_STATUS[type] },
      });
      if (moved.count !== 1) return false;

      await tx.changeRequest.create({
        data: {
          bookingId: booking.id,
          userId: dbUser.id,
          type,
          originalEventId: booking.classEventId,
          requestedEventId: requestedEvent?.id ?? null,
          customerReason: reason,
          status: RequestStatus.PENDING,
          originalPrice: booking.totalPrice,
        }
      });
      return true;
    });

    if (!created) {
      return { success: false, error: "การจองนี้มีคำขอที่รอตรวจสอบอยู่แล้ว" };
    }

    const className = formatClassEventLabel(booking.classEvent);
    if (type === RequestType.CANCELLATION) {
      await notifyAdminsTemplated("ADMIN_REQUEST_CANCEL", { userName: dbUser.name, className, reason });
      await sendTemplatedLineMessage(
        dbUser.lineId,
        "REQUEST_CANCEL_SUBMITTED_USER",
        { userName: dbUser.name, className },
        { userId: dbUser.id, bookingId: booking.id, type: "REQUEST_CANCEL_SUBMITTED" }
      );
    } else {
      const newClassName = requestedEvent ? formatClassEventLabel(requestedEvent) : "";
      await notifyAdminsTemplated("ADMIN_REQUEST_CHANGE", { userName: dbUser.name, className, newClassName, reason });
      await sendTemplatedLineMessage(
        dbUser.lineId,
        "REQUEST_CHANGE_SUBMITTED_USER",
        { userName: dbUser.name, className, newClassName },
        { userId: dbUser.id, bookingId: booking.id, type: "REQUEST_CHANGE_SUBMITTED" }
      );
    }

    revalidatePath("/bookings");
    revalidatePath("/admin/(protected)", "layout");

    return { success: true };
  } catch (error) {
    console.error("Error creating change request:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

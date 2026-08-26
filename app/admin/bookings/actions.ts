"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@/app/generated/prisma";
import {
  isBookingStatus,
  paymentStatusForBooking,
  type AppBookingStatus,
} from "@/lib/booking-status";
import { requireAdmin } from "@/lib/require-admin";
import { sendLineMessage, sendTemplatedLineMessage } from "@/lib/line";

async function applyBookingStatus(bookingId: string, status: AppBookingStatus, reviewerId?: string, reason?: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, classEvent: true, payment: true },
  });

  if (!booking) {
    throw new Error("ไม่พบรายการจอง");
  }

  const previousStatus = booking.status;
  if (previousStatus === status) {
    return booking;
  }

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    const paymentStatus = paymentStatusForBooking(status);
    let paymentId = booking.payment?.id;

    if (booking.payment) {
      const prevPaymentStatus = booking.payment.status;
      await tx.payment.update({
        where: { bookingId },
        data: { status: paymentStatus },
      });
      if (reviewerId && prevPaymentStatus !== paymentStatus) {
        await tx.paymentReviewLog.create({
          data: {
            paymentId,
            reviewerId,
            previousStatus: prevPaymentStatus,
            newStatus: paymentStatus,
            reason
          }
        });
      }
    } else {
      const newPayment = await tx.payment.create({
        data: { bookingId, status: paymentStatus },
      });
      paymentId = newPayment.id;
      if (reviewerId) {
        await tx.paymentReviewLog.create({
          data: {
            paymentId,
            reviewerId,
            previousStatus: "PENDING",
            newStatus: paymentStatus,
            reason
          }
        });
      }
    }

    if (previousStatus !== BookingStatus.CANCELLED && status === BookingStatus.CANCELLED) {
      await tx.classEvent.update({
        where: { id: booking.classEventId },
        data: { totalSeats: { increment: booking.seats } },
      });
    }

    if (previousStatus === BookingStatus.CANCELLED && status !== BookingStatus.CANCELLED) {
      await tx.classEvent.update({
        where: { id: booking.classEventId },
        data: { totalSeats: { decrement: booking.seats } },
      });
    }
  });

  if (booking.user.lineId) {
    const formattedDate = booking.classEvent.date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    if (status === BookingStatus.CONFIRMED) {
      await sendTemplatedLineMessage(
        booking.user.lineId,
        "PAYMENT_VERIFIED_USER",
        {
          userName: booking.user.name,
          className: booking.classEvent.name,
          date: formattedDate,
          time: `${booking.classEvent.startTime} - ${booking.classEvent.endTime}`,
          location: booking.classEvent.locationName || "Date with Soul Love",
          mapUrl: booking.classEvent.googleMapUrl ? `แผนที่: ${booking.classEvent.googleMapUrl}` : "",
          seats: booking.seats,
        },
        {
          userId: booking.userId,
          bookingId: booking.id,
          type: "PAYMENT_VERIFIED",
        }
      );
    } else if (status === BookingStatus.PENDING_PAYMENT && reason) {
      await sendTemplatedLineMessage(
        booking.user.lineId,
        "PAYMENT_REJECTED_USER",
        {
          userName: booking.user.name,
          className: booking.classEvent.name,
          reason: reason,
        },
        {
          userId: booking.userId,
          bookingId: booking.id,
          type: "PAYMENT_REJECTED",
        }
      );
    } else if (status === BookingStatus.CANCELLED) {
      await sendTemplatedLineMessage(
        booking.user.lineId,
        "BOOKING_CANCELLED_USER",
        {
          userName: booking.user.name,
          className: booking.classEvent.name,
        },
        {
          userId: booking.userId,
          bookingId: booking.id,
          type: "BOOKING_CANCELLED",
        }
      );
    }
  }

  return booking;
}

export async function updateBookingStatus(bookingId: string, status: string, reason?: string) {
  const admin = await requireAdmin();

  if (!isBookingStatus(status)) {
    return { success: false, error: "สถานะไม่ถูกต้อง" };
  }

  await applyBookingStatus(bookingId, status, admin.id, reason);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { success: true };
}

export async function confirmPayment(bookingId: string) {
  const admin = await requireAdmin();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  });

  if (!booking) {
    return { success: false, error: "ไม่พบรายการจอง" };
  }

  if (!booking.payment?.slipUrl) {
    return { success: false, error: "ยังไม่มีสลิปจากลูกค้า" };
  }

  await applyBookingStatus(bookingId, BookingStatus.CONFIRMED, admin.id);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { success: true };
}

export async function changeBookingClass(bookingId: string, newClassEventId: string) {
  await requireAdmin();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, classEvent: true },
  });

  if (!booking) {
    return { success: false, error: "ไม่พบรายการจอง" };
  }

  if (booking.status === BookingStatus.CANCELLED) {
    return { success: false, error: "ไม่สามารถเปลี่ยนรอบของการจองที่ยกเลิกแล้วได้" };
  }

  if (booking.classEventId === newClassEventId) {
    return { success: false, error: "รอบเรียนที่เลือกเป็นรอบเดิมอยู่แล้ว" };
  }

  if (booking.changeCount >= 1) {
    return { success: false, error: "สามารถเปลี่ยนรอบเรียนได้เพียง 1 ครั้งเท่านั้น" };
  }

  const newClassEvent = await prisma.classEvent.findUnique({
    where: { id: newClassEventId },
  });

  if (!newClassEvent) {
    return { success: false, error: "ไม่พบรอบเรียนที่เลือก" };
  }

  if (newClassEvent.totalSeats < booking.seats) {
    return {
      success: false,
      error: `ที่นั่งในรอบที่เลือกไม่เพียงพอ (ว่าง ${newClassEvent.totalSeats} ที่ / ต้องการ ${booking.seats} ที่)`,
    };
  }

  await prisma.$transaction(async (tx) => {
    // คืนที่นั่งให้รอบเดิม
    await tx.classEvent.update({
      where: { id: booking.classEventId },
      data: { totalSeats: { increment: booking.seats } },
    });

    // ลดที่นั่งในรอบใหม่
    await tx.classEvent.update({
      where: { id: newClassEventId },
      data: { totalSeats: { decrement: booking.seats } },
    });

    // อัปเดต booking ให้ชี้ไปรอบใหม่
    await tx.booking.update({
      where: { id: bookingId },
      data: { 
        classEventId: newClassEventId,
        changeCount: { increment: 1 }
      },
    });
  });

  // แจ้งลูกค้าทาง LINE
  if (booking.user.lineId) {
    const dateStr = newClassEvent.date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const message = `ทีมงานได้ยืนยันการเปลี่ยนรอบเรียนของคุณเป็น "${newClassEvent.name}" วันที่ ${dateStr} เวลา ${newClassEvent.startTime}–${newClassEvent.endTime} น.\n(หมายเหตุ: สามารถเปลี่ยนวันเรียนได้เพียง 1 ครั้งเท่านั้น) หากมีข้อสงสัยกรุณาติดต่อเจ้าหน้าที่ค่ะ`;
    await sendLineMessage(booking.user.lineId, message);
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { success: true };
}

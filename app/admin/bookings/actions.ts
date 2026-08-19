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
import { sendLineMessage } from "@/lib/line";

async function applyBookingStatus(bookingId: string, status: AppBookingStatus) {
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
    if (booking.payment) {
      await tx.payment.update({
        where: { bookingId },
        data: { status: paymentStatus },
      });
    } else {
      await tx.payment.create({
        data: { bookingId, status: paymentStatus },
      });
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
    const messages: Partial<Record<AppBookingStatus, string>> = {
      [BookingStatus.PAID]: `ยืนยันการชำระเงินสำหรับคลาส "${booking.classEvent.name}" เรียบร้อยแล้ว (สถานะ: ชำระเงินแล้ว) ขอบคุณที่ใช้บริการค่ะ`,
      [BookingStatus.PAYMENT_REVIEW]: `สลิปการชำระเงินของคลาส "${booking.classEvent.name}" อยู่ระหว่างการตรวจสอบค่ะ`,
      [BookingStatus.AWAITING_PAYMENT]: `กรุณาชำระเงินสำหรับคลาส "${booking.classEvent.name}" เพื่อยืนยันที่นั่งค่ะ (สถานะ: กำลังชำระเงิน)`,
      [BookingStatus.BOOKING]: `การจองคลาส "${booking.classEvent.name}" ของคุณอยู่ในสถานะกำลังจองค่ะ`,
      [BookingStatus.CANCELLED]: `การจองคลาส "${booking.classEvent.name}" ของคุณถูกยกเลิกแล้วค่ะ`,
    };
    const message = messages[status];
    if (message) {
      await sendLineMessage(booking.user.lineId, message);
    }
  }

  return booking;
}

export async function updateBookingStatus(bookingId: string, status: string) {
  await requireAdmin();

  if (!isBookingStatus(status)) {
    return { success: false, error: "สถานะไม่ถูกต้อง" };
  }

  await applyBookingStatus(bookingId, status);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { success: true };
}

export async function confirmPayment(bookingId: string) {
  await requireAdmin();

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

  await applyBookingStatus(bookingId, BookingStatus.PAID);
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  return { success: true };
}

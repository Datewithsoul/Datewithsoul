import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { BookingStatus, RequestStatus, RequestType } from "@/app/generated/prisma";
import { notifyAdmins, sendLineMessage } from "@/lib/line";

export async function createCancellationRequest(bookingId: string, reason: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { classEvent: true, user: true }
  });

  if (!booking || booking.userId !== user.id) return { success: false, error: "Invalid booking" };

  if (booking.status !== BookingStatus.CONFIRMED) {
    return { success: false, error: "สามารถขอยกเลิกได้เฉพาะการจองที่ยืนยันแล้วเท่านั้น" };
  }

  await prisma.$transaction(async (tx) => {
    // 1. Create a cancellation request
    await tx.changeRequest.create({
      data: {
        bookingId,
        userId: user.id,
        type: RequestType.CANCELLATION,
        originalEventId: booking.classEventId,
        customerReason: reason,
        status: RequestStatus.PENDING,
      }
    });

    // 2. Change the booking status to CANCELLATION_REQUESTED
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLATION_REQUESTED }
    });
  });

  // Notify customer
  if (booking.user.lineId) {
    await sendLineMessage(
      booking.user.lineId,
      `คำขอยกเลิกการจองคลาส "${booking.classEvent.name}" ของคุณถูกส่งไปยังผู้ดูแลแล้ว กรุณารอการติดต่อกลับเรื่องการคืนเงินค่ะ`
    );
  }

  // Notify admin
  await notifyAdmins(`มีคำขอยกเลิกการจองจากคุณ ${booking.user.name} สำหรับคลาส "${booking.classEvent.name}"`);

  return { success: true };
}

export async function createCourseChangeRequest(bookingId: string, newEventId: string, reason: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { classEvent: true, user: true }
  });

  if (!booking || booking.userId !== user.id) return { success: false, error: "Invalid booking" };
  if (booking.status !== BookingStatus.CONFIRMED) {
    return { success: false, error: "สามารถขอเปลี่ยนรอบได้เฉพาะการจองที่ยืนยันแล้วเท่านั้น" };
  }

  const newEvent = await prisma.classEvent.findUnique({ where: { id: newEventId } });
  if (!newEvent) return { success: false, error: "ไม่พบรอบเรียนใหม่" };
  
  if (newEvent.totalSeats < booking.seats) {
    return { success: false, error: "ที่นั่งในรอบใหม่ไม่เพียงพอ" };
  }

  await prisma.$transaction(async (tx) => {
    // 1. Create course change request
    await tx.changeRequest.create({
      data: {
        bookingId,
        userId: user.id,
        type: RequestType.COURSE_CHANGE,
        originalEventId: booking.classEventId,
        requestedEventId: newEventId,
        customerReason: reason,
        status: RequestStatus.PENDING,
      }
    });

    // 2. Change the booking status to CHANGE_REQUESTED
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CHANGE_REQUESTED }
    });
  });

  // Notify customer
  if (booking.user.lineId) {
    await sendLineMessage(
      booking.user.lineId,
      `คำขอเปลี่ยนรอบเรียนเป็น "${newEvent.name}" ของคุณถูกส่งไปยังผู้ดูแลแล้ว กรุณารอการยืนยันค่ะ`
    );
  }

  // Notify admin
  await notifyAdmins(`มีคำขอเปลี่ยนรอบเรียนจากคุณ ${booking.user.name} เป็นคลาส "${newEvent.name}"`);

  return { success: true };
}


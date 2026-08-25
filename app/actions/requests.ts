"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { RequestType, BookingStatus, RequestStatus } from "@/app/generated/prisma";
import { notifyAdmins, sendLineMessage } from "@/lib/line";
import { createClient } from "@/utils/supabase/server";

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

    if (booking.status !== BookingStatus.CONFIRMED) {
      return { success: false, error: "เฉพาะการจองที่ยืนยันแล้วเท่านั้นที่สามารถขอคืนเงินหรือเปลี่ยนรอบได้" };
    }

    // Determine new status based on request type
    const newBookingStatus = type === RequestType.CANCELLATION
      ? BookingStatus.CANCELLATION_REQUESTED
      : BookingStatus.CHANGE_REQUESTED;

    // Create the request and update booking
    const [changeRequest, updatedBooking] = await prisma.$transaction([
      prisma.changeRequest.create({
        data: {
          bookingId: booking.id,
          userId: dbUser.id,
          type,
          originalEventId: booking.classEventId,
          requestedEventId: requestedEventId || null,
          customerReason: reason,
          status: RequestStatus.PENDING,
          originalPrice: booking.totalPrice,
        }
      }),
      prisma.booking.update({
        where: { id: booking.id },
        data: { status: newBookingStatus }
      })
    ]);

    // Send LINE Notification to Admin
    const typeText = type === RequestType.CANCELLATION ? "ขอยกเลิกและคืนเงิน" : "ขอเปลี่ยนรอบเรียน";
    const adminMessage = `🔔 มีคำ${typeText}ใหม่\nจากคุณ: ${dbUser.name}\nคอร์ส: ${booking.classEvent.name}\nเหตุผล: ${reason}\n\nกรุณาตรวจสอบในระบบ Admin`;
    await notifyAdmins(adminMessage);

    // Send LINE Notification to User (if lineId exists)
    if (dbUser.lineId) {
      const userMessage = `เราได้รับคำ${typeText}สำหรับคอร์ส ${booking.classEvent.name} ของคุณแล้ว ระบบกำลังดำเนินการตรวจสอบและจะแจ้งผลให้ทราบเร็วๆ นี้ค่ะ`;
      await sendLineMessage(dbUser.lineId, userMessage);
    }

    revalidatePath("/bookings");
    revalidatePath("/admin/requests");
    revalidatePath("/admin/bookings");

    return { success: true };
  } catch (error) {
    console.error("Error creating change request:", error);
    return { success: false, error: "Internal Server Error" };
  }
}

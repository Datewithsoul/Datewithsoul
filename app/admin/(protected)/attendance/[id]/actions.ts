"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { sendTemplatedLineMessage } from "@/lib/line";
import { BookingStatus } from "@/app/generated/prisma";

export async function toggleAttendance(bookingId: string, status: boolean) {
  await requireAdmin();
  await prisma.booking.update({
    where: { id: bookingId },
    data: { attended: status }
  });
  
  revalidatePath("/admin/attendance", "page");
  revalidatePath("/admin/attendance/[id]", "page");
  return { success: true };
}

export async function sendClassReminder(classEventId: string) {
  await requireAdmin();
  
  const classEvent = await prisma.classEvent.findUnique({
    where: { id: classEventId },
    include: {
      bookings: {
        where: { status: BookingStatus.CONFIRMED },
        include: { user: true }
      }
    }
  });

  if (!classEvent) return { error: "ไม่พบคอร์สเรียน" };

  let sentCount = 0;
  
  await Promise.all(
    classEvent.bookings.map(async (booking) => {
      if (booking.user.lineId) {
        const success = await sendTemplatedLineMessage(
          booking.user.lineId,
          "REMINDER_1_DAY",
          {
            className: classEvent.name,
            date: classEvent.date.toLocaleDateString("th-TH"),
            time: `${classEvent.startTime}-${classEvent.endTime}`,
            location: classEvent.locationName || "Date with Soul Love",
            mapUrl: classEvent.googleMapUrl ? `แผนที่: ${classEvent.googleMapUrl}` : ""
          },
          {
            userId: booking.user.id,
            bookingId: booking.id,
            type: "MANUAL_REMINDER"
          }
        );
        if (success) sentCount++;
      }
    })
  );

  return { success: true, sentCount };
}

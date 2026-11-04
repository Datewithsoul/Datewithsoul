import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTemplatedLineMessage } from "@/lib/line";
import { BookingStatus } from "@/app/generated/prisma";
import { TIME_ZONE, addDays, bangkokToday } from "@/lib/bangkok-date";

export const dynamic = "force-dynamic";

// Class dates are stored as date-only values at UTC midnight. Convert the
// Bangkok calendar day to the matching UTC range for Vercel's UTC runtime.
function getBangkokDayBounds(offsetDays: number, now: Date) {
  const start = addDays(bangkokToday(now), offsetDays);
  return { gte: start, lt: addDays(start, 1) };
}

function formatClassDate(date: Date) {
  return date.toLocaleDateString("th-TH", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function sendReminderForOffset(
  offsetDays: number,
  templateKey: "REMINDER_3_DAYS" | "REMINDER_1_DAY" | "REMINDER_SAME_DAY",
  logType: "REMINDER_3_DAYS" | "REMINDER_1_DAY" | "REMINDER_SAME_DAY",
  now: Date
) {
  const bounds = getBangkokDayBounds(offsetDays, now);
  const classes = await prisma.classEvent.findMany({
    where: { date: bounds },
    include: {
      bookings: {
        where: {
          status: BookingStatus.CONFIRMED,
          notifications: { none: { type: logType } },
        },
        include: { user: true },
      },
    },
  });

  let sent = 0;
  for (const cls of classes) {
    for (const booking of cls.bookings) {
      if (!booking.user.lineId) continue;

      const success = await sendTemplatedLineMessage(
        booking.user.lineId,
        templateKey,
        {
          userName: booking.user.name,
          className: cls.name,
          date: formatClassDate(cls.date),
          time: `${cls.startTime} - ${cls.endTime}`,
          location: cls.locationName || "Date with Soul Love",
          mapUrl: cls.googleMapUrl ? `แผนที่: ${cls.googleMapUrl}` : "",
          details: cls.description || "",
        },
        {
          bookingId: booking.id,
          userId: booking.userId,
          type: logType,
        }
      );

      if (success) sent++;
    }
  }

  return sent;
}

// Thank-you message for classes that ended yesterday (this cron runs at 06:00 Bangkok time)
async function sendAfterClassMessages(now: Date) {
  const yesterday = getBangkokDayBounds(-1, now);
  const bookings = await prisma.booking.findMany({
    where: {
      status: BookingStatus.CONFIRMED,
      notifications: { none: { type: "REMINDER_AFTER_CLASS" } },
      classEvent: {
        OR: [{ endDate: yesterday }, { endDate: null, date: yesterday }],
      },
    },
    include: { user: true, classEvent: true },
  });

  const results = await Promise.all(
    bookings
      .filter((booking) => booking.user.lineId)
      .map((booking) =>
        sendTemplatedLineMessage(
          booking.user.lineId,
          "REMINDER_AFTER_CLASS",
          { userName: booking.user.name, className: booking.classEvent.name },
          { bookingId: booking.id, userId: booking.userId, type: "REMINDER_AFTER_CLASS" }
        )
      )
  );

  return results.filter(Boolean).length;
}

// Paid bookings whose class has ended become "เรียนแล้ว"
async function completeFinishedBookings(now: Date) {
  const today = bangkokToday(now);
  const { count } = await prisma.booking.updateMany({
    where: {
      status: BookingStatus.CONFIRMED,
      classEvent: {
        OR: [{ endDate: { lt: today } }, { endDate: null, date: { lt: today } }],
      },
    },
    data: { status: BookingStatus.COMPLETED },
  });
  return count;
}

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const now = new Date();
    const [threeDays, oneDay, sameDay, afterClass] = await Promise.all([
      sendReminderForOffset(3, "REMINDER_3_DAYS", "REMINDER_3_DAYS", now),
      sendReminderForOffset(1, "REMINDER_1_DAY", "REMINDER_1_DAY", now),
      sendReminderForOffset(0, "REMINDER_SAME_DAY", "REMINDER_SAME_DAY", now),
      sendAfterClassMessages(now),
    ]);
    // After the thank-you messages, which look for CONFIRMED bookings
    const completed = await completeFinishedBookings(now);

    return NextResponse.json({
      success: true,
      timezone: TIME_ZONE,
      scheduledTime: "06:00",
      sent: { threeDays, oneDay, sameDay, afterClass },
      completed,
    });
  } catch (error) {
    console.error("Error in reminder cron job:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

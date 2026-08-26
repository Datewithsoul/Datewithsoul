import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTemplatedLineMessage } from "@/lib/line";
import { BookingStatus } from "@/app/generated/prisma";

export const dynamic = "force-dynamic";

const TIME_ZONE = "Asia/Bangkok";
const DAY_MS = 24 * 60 * 60 * 1000;

function getBangkokDateParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

// Class dates are stored as date-only values at UTC midnight. Convert the
// Bangkok calendar day to the matching UTC range for Vercel's UTC runtime.
function getBangkokDayBounds(offsetDays: number, now: Date) {
  const { year, month, day } = getBangkokDateParts(now);
  const start = new Date(Date.UTC(year, month - 1, day + offsetDays));
  return { gte: start, lt: new Date(start.getTime() + DAY_MS) };
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

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const now = new Date();
    const [threeDays, oneDay, sameDay] = await Promise.all([
      sendReminderForOffset(3, "REMINDER_3_DAYS", "REMINDER_3_DAYS", now),
      sendReminderForOffset(1, "REMINDER_1_DAY", "REMINDER_1_DAY", now),
      sendReminderForOffset(0, "REMINDER_SAME_DAY", "REMINDER_SAME_DAY", now),
    ]);

    return NextResponse.json({
      success: true,
      timezone: TIME_ZONE,
      scheduledTime: "06:00",
      sent: { threeDays, oneDay, sameDay },
    });
  } catch (error) {
    console.error("Error in reminder cron job:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

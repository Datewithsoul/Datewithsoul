import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendTemplatedLineMessage } from '@/lib/line';
import { BookingStatus } from '@/app/generated/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn("Unauthorized cron access attempt");
      return new Response('Unauthorized', { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // 0. "แจ้งเตือนก่อนวันเรียนล่วงหน้า 2 วัน" (Reminder 2 days before)
    const inTwoDaysClasses = await prisma.classEvent.findMany({
      where: {
        date: {
          gte: dayAfterTomorrow,
          lt: new Date(dayAfterTomorrow.getTime() + 24 * 60 * 60 * 1000), // less than 3 days from now
        },
      },
      include: {
        bookings: {
          where: { 
             status: BookingStatus.CONFIRMED,
            notifications: { none: { type: 'REMINDER_2_DAYS' } }
          },
          include: { user: true },
        },
      },
    });

    let countTwoDays = 0;
    for (const cls of inTwoDaysClasses) {
      for (const booking of cls.bookings) {
        if (booking.user.lineId) {
          const dateStr = cls.date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' });
          await sendTemplatedLineMessage(
            booking.user.lineId,
            "REMINDER_1_DAY",
            {
              userName: booking.user.name,
              className: cls.name,
              date: dateStr,
              time: `${cls.startTime} - ${cls.endTime}`,
              location: cls.locationName || "Date with Soul Love",
              mapUrl: cls.googleMapUrl ? `แผนที่: ${cls.googleMapUrl}` : "",
            },
            {
              bookingId: booking.id,
              userId: booking.userId,
              type: 'REMINDER_2_DAYS',
            }
          );
          countTwoDays++;
        }
      }
    }

    // 1. "ใกล้กำหนดการก่อน 1 วัน" (Reminder 1 day before)
    // Find classes happening tomorrow
    const tomorrowClasses = await prisma.classEvent.findMany({
      where: {
        date: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
      },
      include: {
        bookings: {
          where: { 
             status: BookingStatus.CONFIRMED,
            notifications: { none: { type: 'REMINDER_1_DAY' } }
          },
          include: { user: true },
        },
      },
    });

    let countTomorrow = 0;
    for (const cls of tomorrowClasses) {
      for (const booking of cls.bookings) {
        if (booking.user.lineId) {
          const dateStr = cls.date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' });
          await sendTemplatedLineMessage(
            booking.user.lineId,
            "REMINDER_1_DAY",
            {
              userName: booking.user.name,
              className: cls.name,
              date: dateStr,
              time: `${cls.startTime} - ${cls.endTime}`,
              location: cls.locationName || "Date with Soul Love",
              mapUrl: cls.googleMapUrl ? `แผนที่: ${cls.googleMapUrl}` : "",
            },
            {
              bookingId: booking.id,
              userId: booking.userId,
              type: 'REMINDER_1_DAY',
            }
          );
          countTomorrow++;
        }
      }
    }

    // 2. "กำหนดเรียนวันนี้" (Reminder today)
    // Find classes happening today
    const todayClasses = await prisma.classEvent.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      include: {
        bookings: {
          where: { 
             status: BookingStatus.CONFIRMED,
            notifications: { none: { type: 'REMINDER_SAME_DAY' } }
          },
          include: { user: true },
        },
      },
    });

    let countToday = 0;
    for (const cls of todayClasses) {
      for (const booking of cls.bookings) {
        if (booking.user.lineId) {
          const dateStr = cls.date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' });
          await sendTemplatedLineMessage(
            booking.user.lineId,
            "REMINDER_SAME_DAY",
            {
              userName: booking.user.name,
              className: cls.name,
              date: dateStr,
              time: `${cls.startTime} - ${cls.endTime}`,
              location: cls.locationName || "Date with Soul Love",
              mapUrl: cls.googleMapUrl ? `แผนที่: ${cls.googleMapUrl}` : "",
            },
            {
              bookingId: booking.id,
              userId: booking.userId,
              type: 'REMINDER_SAME_DAY',
            }
          );
          countToday++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${countTwoDays} reminders for 2 days before, ${countTomorrow} tomorrow reminders and ${countToday} today reminders`,
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

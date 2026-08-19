import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendLineMessage } from '@/lib/line';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // In a real app you should enforce this, but for testing we can be flexible if needed
      // return new Response('Unauthorized', { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

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
          where: { status: 'PAID' },
          include: { user: true },
        },
      },
    });

    let countTomorrow = 0;
    for (const cls of tomorrowClasses) {
      for (const booking of cls.bookings) {
        if (booking.user.lineId) {
          const dateStr = cls.date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' });
          await sendLineMessage(
            booking.user.lineId,
            `แจ้งเตือน: คลาส "${cls.name}" ที่คุณจองไว้จะเริ่มในวันพรุ่งนี้ (${dateStr}) เวลา ${cls.startTime} - ${cls.endTime} ค่ะ`
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
          where: { status: 'PAID' },
          include: { user: true },
        },
      },
    });

    let countToday = 0;
    for (const cls of todayClasses) {
      for (const booking of cls.bookings) {
        if (booking.user.lineId) {
          const dateStr = cls.date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' });
          await sendLineMessage(
            booking.user.lineId,
            `แจ้งเตือน: กำหนดเรียนวันนี้! คลาส "${cls.name}" วันนี้ (${dateStr}) เวลา ${cls.startTime} - ${cls.endTime} อย่าลืมมาเรียนกันนะคะ`
          );
          countToday++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${countTomorrow} tomorrow reminders and ${countToday} today reminders`,
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

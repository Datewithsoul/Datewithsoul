"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

interface BookingItemInput {
  classEventId: string;
  seats: number;
}

export async function createCartBookings(items: BookingItemInput[], name: string) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return { error: "กรุณาเข้าสู่ระบบ" };
    }

    if (items.length === 0) {
      return { error: "ตะกร้าว่างเปล่า" };
    }

    let user = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { id: authUser.id, name: name || authUser.email!, email: authUser.email! },
      });
    } else if (user.name !== name && name) {
      // Update name if changed
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name }
      });
    }

    // Verify all classes exist and calculate total price
    let totalPrice = 0;
    
    // Check for existing bookings first
    const classEventIds = items.map(i => i.classEventId);
    const existingBookings = await prisma.booking.findMany({
      where: {
        userId: authUser.id,
        classEventId: { in: classEventIds },
        status: { in: ['BOOKING', 'AWAITING_PAYMENT', 'PAYMENT_REVIEW', 'PAID'] }
      },
      include: { classEvent: true }
    });

    if (existingBookings.length > 0) {
      const names = existingBookings.map(b => b.classEvent.name).join(", ");
      return { error: `คุณมีการจองคลาสเหล่านี้อยู่แล้ว: ${names}` };
    }

    const classEvents = await Promise.all(
      items.map(async (item) => {
        if (!item.seats || isNaN(item.seats) || item.seats <= 0) {
           throw new Error("จำนวนที่นั่งไม่ถูกต้อง");
        }
        const ce = await prisma.classEvent.findUnique({ where: { id: item.classEventId } });
        if (!ce) throw new Error(`Class event ${item.classEventId} not found`);
        if (ce.totalSeats < item.seats) throw new Error(`ที่นั่งสำหรับ ${ce.name} ไม่เพียงพอ`);
        totalPrice += ce.price * item.seats;
        return { ...ce, requestedSeats: item.seats };
      })
    );

    // Create the BookingGroup and all nested Bookings inside a transaction
    const bookingGroup = await prisma.$transaction(async (tx) => {
      const group = await tx.bookingGroup.create({
        data: {
          userId: user.id,
          totalPrice,
          status: "PENDING", // Correct enum value
        }
      });

      // Create individual bookings
      for (const item of classEvents) {
        await tx.booking.create({
          data: {
            userId: user.id,
            classEventId: item.id,
            bookingGroupId: group.id,
            seats: item.requestedSeats,
            totalPrice: item.price * item.requestedSeats,
            status: "BOOKING",
          }
        });

        // Decrement seats atomically
        const updatedClassEvent = await tx.classEvent.updateMany({
          where: { 
            id: item.id,
            totalSeats: { gte: item.requestedSeats }
          },
          data: { totalSeats: { decrement: item.requestedSeats } }
        });
        
        if (updatedClassEvent.count === 0) {
          throw new Error(`ขออภัย ที่นั่งสำหรับ ${item.name} ไม่เพียงพอ หรือมีการจองพร้อมกัน`);
        }
      }

      // Create Group Payment
      await tx.payment.create({
        data: {
          bookingGroupId: group.id,
          status: "PENDING",
        }
      });

      return group;
    });

    // Notify Line asynchronously (don't block return)
    try {
      const classNames = classEvents.map(c => `• ${c.name} (${c.requestedSeats} ที่นั่ง)`).join('\n');
      if (user.lineId) {
        const { sendLineMessage, notifyAdmins } = await import('@/lib/line');
        await sendLineMessage(user.lineId, `ระบบได้รับคำสั่งจองคลาสแบบกลุ่มของคุณแล้ว:\n${classNames}\n\nยอดรวม: ฿${totalPrice.toLocaleString("th-TH")}\n(สถานะ: กำลังจอง) กรุณาชำระเงินเพื่อยืนยันที่นั่งค่ะ`);
        await notifyAdmins(`มีการจองใหม่ (กลุ่ม): ${user.name}\n${classNames}\nยอดรวม ฿${totalPrice.toLocaleString("th-TH")}`);
      } else {
        const { notifyAdmins } = await import('@/lib/line');
        await notifyAdmins(`มีการจองใหม่ (กลุ่ม): ${user.name}\n${classNames}\nยอดรวม ฿${totalPrice.toLocaleString("th-TH")}`);
      }
    } catch (e) {
      console.error("Failed to send LINE notification for cart checkout", e);
    }

    return { groupId: bookingGroup.id };
  } catch (error: any) {
    console.error("Cart checkout error:", error);
    return { error: error.message || "Unknown error" };
  }
}

export async function getAlternativeSchedules(className: string) {
  const now = new Date();
  const schedules = await prisma.classEvent.findMany({
    where: {
      name: className,
      date: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) }
    },
    orderBy: [
      { date: 'asc' },
      { startTime: 'asc' }
    ]
  });
  return schedules;
}


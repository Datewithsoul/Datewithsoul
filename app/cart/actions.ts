"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { BookingStatus, BookingGroupStatus, PaymentStatus } from "@/app/generated/prisma";

interface BookingItemInput {
  classEventId: string;
  seats: number;
}

export async function validatePromoCode(code: string, userId: string, classEventIds: string[]) {
  const promo = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase() },
    include: { applicableEvents: true }
  });

  if (!promo) return { error: "ไม่พบรหัสส่วนลดนี้" };
  if (!promo.isActive) return { error: "รหัสส่วนลดนี้ถูกปิดใช้งาน" };

  const now = new Date();
  if (promo.startDate && promo.startDate > now) return { error: "รหัสส่วนลดนี้ยังไม่เริ่มใช้งาน" };
  if (promo.endDate && promo.endDate < now) return { error: "รหัสส่วนลดนี้หมดอายุแล้ว" };
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) return { error: "รหัสส่วนลดนี้ถูกใช้ครบจำนวนแล้ว" };

  const userUsageCount = await prisma.promoUsage.count({
    where: { promoCodeId: promo.id, userId }
  });
  if (userUsageCount >= promo.perUserLimit) return { error: `คุณใช้รหัสส่วนลดนี้ครบ ${promo.perUserLimit} ครั้งแล้ว` };

  if (!promo.applyToAll) {
    const applicableIds = promo.applicableEvents.map(e => e.id);
    const hasApplicableClass = classEventIds.some(id => applicableIds.includes(id));
    if (!hasApplicableClass) return { error: "รหัสส่วนลดนี้ไม่สามารถใช้กับคอร์สที่เลือกได้" };
  }

  return { success: true, promo };
}

export async function createCartBookings(items: BookingItemInput[], name: string, promoCode?: string) {
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
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name }
      });
    }

    let totalPrice = 0;
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

    let appliedPromo = null;
    let discountAmount = 0;

    if (promoCode) {
      const classEventIds = classEvents.map(c => c.id);
      const valRes = await validatePromoCode(promoCode, user.id, classEventIds);
      if (valRes.error) {
        return { error: valRes.error };
      }
      if (valRes.promo) {
        appliedPromo = valRes.promo;
        if (appliedPromo.discountType === "PERCENTAGE") {
          discountAmount = (totalPrice * appliedPromo.discountValue) / 100;
        } else if (appliedPromo.discountType === "FIXED_AMOUNT") {
          discountAmount = appliedPromo.discountValue;
        } else if (appliedPromo.discountType === "FREE") {
          discountAmount = totalPrice;
        }
        
        // Ensure discount doesn't exceed total price
        if (discountAmount > totalPrice) discountAmount = totalPrice;
      }
    }

    const finalPrice = totalPrice - discountAmount;
    const isFree = finalPrice <= 0;

    const bookingGroup = await prisma.$transaction(async (tx) => {
      const group = await tx.bookingGroup.create({
        data: {
          userId: user.id,
          totalPrice: finalPrice,
          discountAmount,
          promoCodeId: appliedPromo?.id,
          status: isFree ? BookingGroupStatus.CONFIRMED : BookingGroupStatus.PENDING_PAYMENT,
        }
      });

      if (appliedPromo) {
        await tx.promoUsage.create({
          data: {
            promoCodeId: appliedPromo.id,
            userId: user.id,
            bookingGroupId: group.id,
            discountSaved: discountAmount
          }
        });
        await tx.promoCode.update({
          where: { id: appliedPromo.id },
          data: { usedCount: { increment: 1 } }
        });
      }

      for (const item of classEvents) {
        await tx.booking.create({
          data: {
            userId: user.id,
            classEventId: item.id,
            bookingGroupId: group.id,
            seats: item.requestedSeats,
            totalPrice: item.price * item.requestedSeats, // keep original price per booking or distribute discount? Kept original for now, group has the total
            status: isFree ? "CONFIRMED" : "PENDING_PAYMENT",
          }
        });

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

      await tx.payment.create({
        data: {
          bookingGroupId: group.id,
          status: isFree ? PaymentStatus.VERIFIED : PaymentStatus.UNPAID,
        }
      });

      return group;
    });

    try {
      const classNames = classEvents.map(c => `• ${c.name} (${c.requestedSeats} ที่นั่ง)`).join('\n');
      const { sendTemplatedLineMessage, notifyAdminsTemplated } = await import('@/lib/line');
      
      if (user.lineId) {
        await sendTemplatedLineMessage(
          user.lineId,
          "BOOKING_GROUP_CREATED_USER",
          {
            userName: user.name,
            classNames,
            totalPrice: finalPrice.toLocaleString("th-TH"),
          },
          {
            userId: user.id,
            type: "BOOKING_GROUP_CREATED",
          }
        );
      }

      await notifyAdminsTemplated("ADMIN_BOOKING_GROUP_CREATED", {
        userName: user.name,
        classNames,
        totalPrice: finalPrice.toLocaleString("th-TH"),
      });
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

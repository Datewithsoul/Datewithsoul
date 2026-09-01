"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

function redirectWithError(path: string, message: string): never {
  const params = new URLSearchParams({ error: message });
  redirect(`${path}?${params.toString()}`);
}

export async function submitBooking(formData: FormData) {
  const classEventId = formData.get("classEventId") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const seats = parseInt(formData.get("seats") as string, 10);
  if (isNaN(seats) || seats <= 0) {
    throw new Error("จำนวนที่นั่งต้องเป็นจำนวนเต็มบวก");
  }

  const classEvent = await prisma.classEvent.findUnique({
    where: { id: classEventId }
  });

  if (!classEvent) {
    throw new Error("Class event not found");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const classEndDate = classEvent.endDate ?? classEvent.date;
  if (classEndDate < today) {
    redirectWithError(`/book/${classEventId}`, "คลาสนี้ผ่านวันเรียนแล้ว ไม่สามารถจองได้");
  }

  if (classEvent.totalSeats < seats) {
    redirectWithError(`/book/${classEventId}`, `ที่นั่งไม่เพียงพอ (เหลือ ${classEvent.totalSeats} ที่)`);
  }

  const totalPrice = classEvent.price * seats;

  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirectWithError("/login", "กรุณาเข้าสู่ระบบก่อนทำการจอง");
  }

  let user = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { id: authUser.id, name: name || authUser.email!, email: authUser.email! },
    });
  }

  let booking;
  try {
    booking = await prisma.$transaction(async (tx) => {
      // Safely decrement seats only if enough are available
      const updatedClassEvent = await tx.classEvent.updateMany({
        where: { 
          id: classEventId,
          totalSeats: { gte: seats }
        },
        data: {
          totalSeats: { decrement: seats },
        },
      });

      if (updatedClassEvent.count === 0) {
        throw new Error("NOT_ENOUGH_SEATS");
      }

      const b = await tx.booking.create({
        data: {
          userId: user.id,
          classEventId,
          seats,
          totalPrice,
          note: formData.get("note") as string || null,
          status: "PENDING_PAYMENT",
        },
      });

      await tx.payment.create({
        data: {
          bookingId: b.id,
          status: "UNPAID",
        },
      });

      return b;
    });
  } catch (error: any) {
    if (error.message === "NOT_ENOUGH_SEATS") {
      redirectWithError(`/classes/${classEventId}`, "ขออภัย ที่นั่งไม่เพียงพอ กรุณาลองใหม่อีกครั้ง");
    }
    throw error;
  }

  const { sendTemplatedLineMessage, notifyAdminsTemplated } = await import('@/lib/line');
  
  if (user.lineId) {
    await sendTemplatedLineMessage(
      user.lineId,
      "BOOKING_CREATED_USER",
      {
        userName: user.name,
        className: classEvent.name,
        seats,
        totalPrice: totalPrice.toLocaleString("th-TH"),
      },
      {
        userId: user.id,
        bookingId: booking.id,
        type: "BOOKING_CREATED",
      }
    );
  }

  await notifyAdminsTemplated("ADMIN_BOOKING_CREATED", {
    userName: user.name,
    className: classEvent.name,
    seats,
    totalPrice: totalPrice.toLocaleString("th-TH"),
  });

  // Redirect to payment page instead of classes
  redirect(`/payment/${booking.id}`);
}

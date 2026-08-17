"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function submitBooking(formData: FormData) {
  const classEventId = formData.get("classEventId") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const seats = parseInt(formData.get("seats") as string, 10);
  const totalPrice = parseFloat(formData.get("totalPrice") as string);

  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login?error=กรุณาเข้าสู่ระบบก่อนทำการจอง");
  }

  let user = await prisma.user.findFirst({
    where: { email: authUser.email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { name: name || authUser.email!, email: authUser.email! },
    });
  }

  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      classEventId,
      seats,
      totalPrice,
      status: "PENDING",
    },
  });

  // Mock payment record creation
  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      status: "PENDING",
    },
  });

  // Decrease available seats
  await prisma.classEvent.update({
    where: { id: classEventId },
    data: {
      totalSeats: { decrement: seats },
    },
  });

  // For this prototype, just redirect back to classes with a success parameter
  // In a full app we'd redirect to a payment upload page
  redirect("/classes?success=true");
}

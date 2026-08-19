"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { PAYABLE_BOOKING_STATUSES } from "@/lib/booking-status";
import { notifyAdmins, sendLineMessage } from "@/lib/line";
import { BookingStatus, PaymentStatus } from "@/app/generated/prisma";

function isPayable(status: string) {
  return (PAYABLE_BOOKING_STATUSES as readonly string[]).includes(status);
}

export async function uploadSlip(formData: FormData) {
  const bookingId = formData.get("bookingId") as string;
  const slipImage = formData.get("slipImage") as File;

  if (!bookingId || !slipImage || slipImage.size === 0) {
    throw new Error("Missing required fields");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      classEvent: true,
    }
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  const now = new Date();
  const expiryTime = new Date(booking.createdAt.getTime() + 10 * 60 * 1000);

  if (now > expiryTime && isPayable(booking.status)) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
    });

    await prisma.classEvent.update({
      where: { id: booking.classEventId },
      data: { totalSeats: { increment: booking.seats } },
    });

    await prisma.payment.update({
      where: { bookingId },
      data: { status: PaymentStatus.REJECTED },
    });

    if (booking.user.lineId) {
      await sendLineMessage(booking.user.lineId, `คำสั่งจองคลาส "${booking.classEvent.name}" ของคุณหมดเวลาทำการแล้ว (สถานะ: ยกเลิก) กรุณาทำรายการใหม่อีกครั้งค่ะ`);
    }

    redirect(`/payment/${bookingId}?error=expired`);
  }

  const fileExt = slipImage.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `slips/${fileName}`;

  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const buffer = await slipImage.arrayBuffer();

  const { error: uploadError } = await supabaseAdmin.storage
    .from('class-media')
    .upload(filePath, buffer, {
      contentType: slipImage.type,
      upsert: false
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    redirect(`/payment/${bookingId}?error=upload_failed`);
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from('class-media')
    .getPublicUrl(filePath);

  const slipUrl = publicUrlData.publicUrl;

  await prisma.payment.update({
    where: { bookingId: bookingId },
    data: {
      slipUrl: slipUrl,
      status: PaymentStatus.UNDER_REVIEW,
    },
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.PAYMENT_REVIEW,
    },
  });

  if (booking.user.lineId) {
    await sendLineMessage(booking.user.lineId, `เราได้รับสลิปการชำระเงินสำหรับคลาส "${booking.classEvent.name}" แล้ว กำลังรอแอดมินตรวจสอบ (สถานะ: การตรวจสอบชำระเงิน)`);
  }

  await notifyAdmins(
    `ลูกค้าส่งสลิปแล้ว: ${booking.user.name} คลาส "${booking.classEvent.name}" ยอด ฿${booking.totalPrice.toLocaleString("th-TH")} กรุณาตรวจสอบการชำระเงิน`
  );

  redirect(`/payment/${bookingId}`);
}

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      classEvent: true,
    }
  });

  if (!booking || !isPayable(booking.status)) {
    return { success: false, error: "Invalid booking" };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CANCELLED },
  });

  await prisma.classEvent.update({
    where: { id: booking.classEventId },
    data: { totalSeats: { increment: booking.seats } },
  });

  await prisma.payment.update({
    where: { bookingId: bookingId },
    data: { status: PaymentStatus.REJECTED },
  });

  if (booking.user.lineId) {
    await sendLineMessage(booking.user.lineId, `การจองคลาส "${booking.classEvent.name}" ของคุณถูกยกเลิกแล้ว (สถานะ: ยกเลิก)`);
  }

  await notifyAdmins(`การจองถูกยกเลิก: ${booking.user.name} คลาส "${booking.classEvent.name}"`);

  return { success: true };
}

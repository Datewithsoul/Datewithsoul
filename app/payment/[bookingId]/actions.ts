"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

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

  // Find booking
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

  // Check timeout (10 minutes)
  const now = new Date();
  const expiryTime = new Date(booking.createdAt.getTime() + 10 * 60 * 1000);
  
  if (now > expiryTime && booking.status === "PENDING") {
    // If expired during upload, cancel it and return error
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });
    
    // Refund seats
    await prisma.classEvent.update({
      where: { id: booking.classEventId },
      data: { totalSeats: { increment: booking.seats } },
    });

    if (booking.user.lineId) {
      const { sendLineMessage } = await import('@/lib/line');
      await sendLineMessage(booking.user.lineId, `คำสั่งจองคลาส "${booking.classEvent.name}" ของคุณหมดเวลาทำการแล้ว (สถานะ: ยกเลิก) กรุณาทำรายการใหม่อีกครั้งค่ะ`);
    }
    
    redirect(`/payment/${bookingId}?error=expired`);
  }

  // Upload slip to Supabase
  const fileExt = slipImage.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `slips/${fileName}`;

  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const buffer = await slipImage.arrayBuffer();

  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from('class-media') // Reusing class-media bucket
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

  // Update Payment and Booking status
  await prisma.payment.update({
    where: { bookingId: bookingId },
    data: {
      slipUrl: slipUrl,
      status: "VERIFIED", 
    },
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CONFIRMED",
    },
  });

  if (booking.user.lineId) {
    const { sendLineMessage } = await import('@/lib/line');
    await sendLineMessage(booking.user.lineId, `เราได้รับยอดชำระเงินสำหรับคลาส "${booking.classEvent.name}" ของคุณแล้ว (สถานะ: ชำระเงินแล้ว) ขอบคุณที่ใช้บริการค่ะ`);
  }

  // Redirect to success page or back to classes
  redirect("/classes?success=true");
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

  if (!booking || booking.status !== "PENDING") {
    return { success: false, error: "Invalid booking" };
  }

  // Cancel booking
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  // Refund seats
  await prisma.classEvent.update({
    where: { id: booking.classEventId },
    data: { totalSeats: { increment: booking.seats } },
  });

  // Also update payment
  await prisma.payment.update({
    where: { bookingId: bookingId },
    data: { status: "REJECTED" },
  });

  if (booking.user.lineId) {
    const { sendLineMessage } = await import('@/lib/line');
    await sendLineMessage(booking.user.lineId, `การจองคลาส "${booking.classEvent.name}" ของคุณถูกยกเลิกแล้ว (สถานะ: ยกเลิก)`);
  }

  return { success: true };
}

"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BookingStatus, BookingGroupStatus, PaymentStatus } from "@/app/generated/prisma";
import { createClient } from "@/utils/supabase/server";

export async function uploadGroupSlip(formData: FormData) {
  const groupId = formData.get("groupId") as string;
  const slipFile = formData.get("slip") as File;
  
  if (!slipFile || slipFile.size === 0) {
    throw new Error("กรุณาแนบสลิปโอนเงิน");
  }

  // Generate a unique filename
  const fileExt = slipFile.name.split('.').pop();
  const fileName = `group-${groupId}-${Date.now()}.${fileExt}`;
  const filePath = `slips/${fileName}`;

  const supabase = await createClient();
  
  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('slips')
    .upload(filePath, slipFile, {
      contentType: slipFile.type,
      upsert: true
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw new Error("ไม่สามารถอัพโหลดไฟล์ได้");
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('slips')
    .getPublicUrl(filePath);

  // Update payment and booking statuses in transaction
  const bookingGroup = await prisma.$transaction(async (tx) => {
    // 1. Update Payment status
    await tx.payment.update({
      where: { bookingGroupId: groupId },
      data: {
        slipUrl: publicUrl,
        status: PaymentStatus.UNDER_REVIEW,
      },
    });

    // 2. Update Group status
    const group = await tx.bookingGroup.update({
      where: { id: groupId },
      data: { status: BookingGroupStatus.PAYMENT_REVIEW },
      include: { user: true, bookings: { include: { classEvent: true } } },
    });

    // 3. Update individual bookings status
    await tx.booking.updateMany({
      where: { bookingGroupId: groupId },
      data: { status: BookingStatus.PAYMENT_REVIEW },
    });

    return group;
  });

  try {
    const classNames = bookingGroup.bookings.map(b => `• ${b.classEvent.name}`).join('\n');
    
    // Notify admin
    const { notifyAdmins } = await import('@/lib/line');
    await notifyAdmins(`มีการแจ้งชำระเงินใหม่ (กลุ่ม): ${bookingGroup.user.name}\n${classNames}\nยอด: ฿${bookingGroup.totalPrice.toLocaleString("th-TH")}\nตรวจสอบสลิปได้ที่ระบบหลังบ้าน`);

    // Notify user
    if (bookingGroup.user.lineId) {
      const { sendLineMessage } = await import('@/lib/line');
      await sendLineMessage(
        bookingGroup.user.lineId,
        `เราได้รับสลิปแจ้งชำระเงินของคุณแล้ว (รายการกลุ่ม)\nทีมงานจะทำการตรวจสอบภายใน 24 ชั่วโมงค่ะ`
      );
    }
  } catch (error) {
    console.error("Failed to send LINE notification for group payment", error);
  }

  redirect(`/payment/group/${groupId}`);
}

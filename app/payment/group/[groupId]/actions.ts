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

  if (slipFile.size > 5 * 1024 * 1024) {
    throw new Error("ขนาดไฟล์เกิน 5MB");
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(slipFile.type)) {
    throw new Error("รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, WEBP) เท่านั้น");
  }

  // Generate a unique filename
  const fileExt = slipFile.name.split('.').pop();
  const fileName = `group-${groupId}-${Date.now()}.${fileExt}`;
  const filePath = `slips/${fileName}`;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const group = await prisma.bookingGroup.findUnique({
    where: { id: groupId },
    select: { userId: true, status: true }
  });

  if (!group) {
    throw new Error("Group not found");
  }

  if (group.status !== BookingGroupStatus.PENDING && group.status !== BookingGroupStatus.AWAITING_PAYMENT) {
    throw new Error("รายการจองนี้ไม่สามารถอัปโหลดสลิปได้");
  }

  if (group.userId !== user.id) {
    throw new Error("Unauthorized");
  }
  
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

export async function cancelGroupBooking(groupId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const group = await prisma.bookingGroup.findUnique({
    where: { id: groupId },
    include: {
      user: true,
      bookings: { include: { classEvent: true } }
    }
  });

  if (!group || (group.status !== BookingGroupStatus.PENDING && group.status !== BookingGroupStatus.AWAITING_PAYMENT)) {
    return { success: false, error: "Invalid group" };
  }

  if (group.userId !== user.id) {
    return { success: false, error: "Unauthorized" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.bookingGroup.update({
      where: { id: groupId },
      data: { status: BookingGroupStatus.CANCELLED },
    });

    for (const b of group.bookings) {
      await tx.booking.update({
        where: { id: b.id },
        data: { status: BookingStatus.CANCELLED }
      });
      await tx.classEvent.update({
        where: { id: b.classEventId },
        data: { totalSeats: { increment: b.seats } }
      });
    }

    const p = await tx.payment.findUnique({ where: { bookingGroupId: groupId } });
    if (p) {
      await tx.payment.update({
        where: { id: p.id },
        data: { status: PaymentStatus.REJECTED }
      });
    }
  });

  if (group.user.lineId) {
    const { sendLineMessage } = await import('@/lib/line');
    await sendLineMessage(group.user.lineId, `การจองกลุ่มของคุณถูกยกเลิกแล้ว (สถานะ: ยกเลิก)`);
  }

  return { success: true };
}

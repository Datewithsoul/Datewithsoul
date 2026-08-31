"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { BookingGroupStatus } from "@/app/generated/prisma";

function redirectWithError(groupId: string, message: string): never {
  redirect(`/payment/group/${groupId}?error=${encodeURIComponent(message)}`);
}

export async function uploadGroupSlip(formData: FormData) {
  const groupId = formData.get("groupId") as string;
  const slipFile = formData.get("slip") as File;
  
  if (!slipFile || slipFile.size === 0) {
    redirectWithError(groupId, "กรุณาแนบสลิปโอนเงิน");
  }

  if (slipFile.size > 5 * 1024 * 1024) {
    redirectWithError(groupId, "ขนาดไฟล์เกิน 5MB");
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(slipFile.type)) {
    redirectWithError(groupId, "รองรับเฉพาะไฟล์รูปภาพ JPEG, PNG หรือ WEBP เท่านั้น");
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

   if (group.status !== BookingGroupStatus.PENDING_PAYMENT) {
    throw new Error("รายการจองนี้ไม่สามารถอัปโหลดสลิปได้");
  }

  if (group.userId !== user.id) {
    throw new Error("Unauthorized");
  }
  
  // Use the server key so customers do not need direct Storage insert policy access.
  const { createAdminClient } = await import('@/utils/supabase/admin');
  const supabaseAdmin = createAdminClient();

  const { error: uploadError } = await supabaseAdmin.storage
    .from('class-media')
    .upload(filePath, Buffer.from(await slipFile.arrayBuffer()), {
      contentType: slipFile.type,
      upsert: false
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    redirectWithError(groupId, "ไม่สามารถอัปโหลดไฟล์ได้ กรุณาลองใหม่อีกครั้ง");
  }

  // Get public URL
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('class-media')
    .getPublicUrl(filePath);

  // Update payment and booking statuses in transaction
  const bookingGroup = await prisma.$transaction(async (tx) => {
    // 1. Update Payment status
    await tx.payment.update({
      where: { bookingGroupId: groupId },
      data: {
        slipUrl: publicUrl,
        status: "UNDER_REVIEW",
      },
    });

    // 2. Update Group status
    const group = await tx.bookingGroup.update({
      where: { id: groupId },
      data: { status: "PAYMENT_REVIEW" },
      include: { user: true, bookings: { include: { classEvent: true } } },
    });

    // 3. Update individual bookings status
    await tx.booking.updateMany({
      where: { bookingGroupId: groupId },
      data: { status: "PAYMENT_REVIEW" },
    });

    return group;
  });

  try {
    const classNames = bookingGroup.bookings.map(b => `• ${b.classEvent.name}`).join('\n');
    const { sendTemplatedLineMessage, notifyAdminsTemplated } = await import('@/lib/line');
    
    // Notify admin
    await notifyAdminsTemplated("ADMIN_PAYMENT_GROUP_UPLOADED", {
      userName: bookingGroup.user.name,
      classNames,
      totalPrice: bookingGroup.totalPrice.toLocaleString("th-TH"),
    });

    // Notify user
    if (bookingGroup.user.lineId) {
      await sendTemplatedLineMessage(
        bookingGroup.user.lineId,
        "PAYMENT_GROUP_SLIP_UPLOADED_USER",
        {
          userName: bookingGroup.user.name,
          classNames,
          totalPrice: bookingGroup.totalPrice.toLocaleString("th-TH"),
        },
        {
          userId: bookingGroup.userId,
          type: "PAYMENT_GROUP_SLIP_UPLOADED",
        }
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

  if (!group || group.status !== "PENDING_PAYMENT") {
    throw new Error("Invalid booking group status");
  }

  if (group.userId !== user.id) {
    return { success: false, error: "Unauthorized" };
  }

  await prisma.$transaction(async (tx) => {
    const updatedGroup = await tx.bookingGroup.updateMany({
      where: { id: groupId, status: "PENDING_PAYMENT" },
      data: { status: "CANCELLED" },
    });
    if (updatedGroup.count === 0) return;

    for (const b of group.bookings) {
      await tx.booking.update({
        where: { id: b.id },
        data: { status: "CANCELLED" }
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
        data: { status: "REJECTED" }
      });
    }
  });

  if (group.user.lineId) {
    const { sendTemplatedLineMessage, notifyAdminsTemplated } = await import('@/lib/line');
    await sendTemplatedLineMessage(
      group.user.lineId,
      "BOOKING_CANCELLED_USER",
      {
        userName: group.user.name,
        className: group.bookings.map(b => b.classEvent.name).join(", "),
      },
      {
        userId: group.userId,
        type: "BOOKING_CANCELLED",
      }
    );
    await notifyAdminsTemplated("ADMIN_BOOKING_CANCELLED", {
      userName: group.user.name,
      className: group.bookings.map(b => b.classEvent.name).join(", "),
    });
  }

  return { success: true };
}

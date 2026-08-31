"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { PAYABLE_BOOKING_STATUSES } from "@/lib/booking-status";
import { sendTemplatedLineMessage, notifyAdminsTemplated } from "@/lib/line";

function redirectWithError(path: string, message: string): never {
  const params = new URLSearchParams({ error: message });
  redirect(`${path}?${params.toString()}`);
}

function isPayable(status: string) {
  return (PAYABLE_BOOKING_STATUSES as readonly string[]).includes(status);
}

export async function uploadSlip(formData: FormData) {
  const bookingId = formData.get("bookingId") as string;
  const slipImage = formData.get("slipImage") as File;

  if (!bookingId || !slipImage || slipImage.size === 0) {
    throw new Error("Missing required fields");
  }

  if (slipImage.size > 5 * 1024 * 1024) {
    redirectWithError(`/payment/${bookingId}`, "ขนาดไฟล์เกิน 5MB");
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(slipImage.type)) {
    redirectWithError(`/payment/${bookingId}`, "รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, WEBP) เท่านั้น");
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

  if (booking.userId !== user.id) {
    throw new Error("Unauthorized");
  }

  const now = new Date();
  const expiryTime = new Date(booking.createdAt.getTime() + 10 * 60 * 1000);

  if (now > expiryTime && isPayable(booking.status)) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });

    await prisma.classEvent.update({
      where: { id: booking.classEventId },
      data: { totalSeats: { increment: booking.seats } },
    });

    await prisma.payment.updateMany({
      where: { bookingId },
      data: { status: "REJECTED" },
    });

    if (booking.user.lineId) {
      await sendTemplatedLineMessage(
        booking.user.lineId,
        "BOOKING_EXPIRED_USER",
        {
          userName: booking.user.name,
          className: booking.classEvent.name,
        },
        {
          userId: booking.userId,
          bookingId: booking.id,
          type: "BOOKING_EXPIRED",
        }
      );
    }

    redirect(`/payment/${bookingId}?error=expired`);
  }

  const fileExt = slipImage.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `slips/${fileName}`;

  const { createAdminClient } = await import('@/utils/supabase/admin');
  const supabaseAdmin = createAdminClient();

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

  await prisma.payment.updateMany({
    where: { bookingId: bookingId },
    data: {
      slipUrl: slipUrl,
      status: "UNDER_REVIEW",
    },
  });

  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "PAYMENT_REVIEW",
    },
  });

  if (booking.user.lineId) {
    await sendTemplatedLineMessage(
      booking.user.lineId,
      "PAYMENT_SLIP_UPLOADED_USER",
      {
        userName: booking.user.name,
        className: booking.classEvent.name,
        totalPrice: booking.totalPrice.toLocaleString("th-TH"),
      },
      {
        userId: booking.userId,
        bookingId: booking.id,
        type: "PAYMENT_SLIP_UPLOADED",
      }
    );
  }

  await notifyAdminsTemplated("ADMIN_PAYMENT_UPLOADED", {
    userName: booking.user.name,
    className: booking.classEvent.name,
    totalPrice: booking.totalPrice.toLocaleString("th-TH"),
  });

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

  if (booking.userId !== user.id) {
    return { success: false, error: "Unauthorized" };
  }

  await prisma.$transaction(async (tx) => {
    const updated = await tx.booking.updateMany({
      where: { id: bookingId, status: "PENDING_PAYMENT" },
      data: { status: "CANCELLED" },
    });
    if (updated.count === 0) return;

    await tx.classEvent.update({
      where: { id: booking.classEventId },
      data: { totalSeats: { increment: booking.seats } },
    });

    const paymentStatus = "REJECTED";
    const existingPayment = await tx.payment.findUnique({
      where: { bookingId },
    });
    if (existingPayment) {
      await tx.payment.update({
        where: { bookingId },
        data: { status: paymentStatus as any },
      });
    } else {
      await tx.payment.create({
        data: { bookingId, status: paymentStatus as any },
      });
    }
  });

  if (booking.user.lineId) {
    await sendTemplatedLineMessage(
      booking.user.lineId,
      "BOOKING_CANCELLED_USER",
      {
        userName: booking.user.name,
        className: booking.classEvent.name,
      },
      {
        userId: booking.userId,
        bookingId: booking.id,
        type: "BOOKING_CANCELLED",
      }
    );
  }

  await notifyAdminsTemplated("ADMIN_BOOKING_CANCELLED", {
    userName: booking.user.name,
    className: booking.classEvent.name,
  });

  return { success: true };
}

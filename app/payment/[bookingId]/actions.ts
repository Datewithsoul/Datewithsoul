"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { PAYABLE_BOOKING_STATUSES } from "@/lib/booking-status";
import { notifyAdmins, sendLineMessage, sendTemplatedLineMessage, notifyAdminsTemplated } from "@/lib/line";
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

  if (slipImage.size > 5 * 1024 * 1024) {
    redirect(`/payment/${bookingId}?error=ขนาดไฟล์เกิน 5MB`);
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(slipImage.type)) {
    redirect(`/payment/${bookingId}?error=รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, WEBP) เท่านั้น`);
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
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
    });

    await tx.classEvent.update({
      where: { id: booking.classEventId },
      data: { totalSeats: { increment: booking.seats } },
    });

    const paymentStatus = PaymentStatus.REJECTED;
    const existingPayment = await tx.payment.findUnique({
      where: { bookingId },
    });
    if (existingPayment) {
      await tx.payment.update({
        where: { bookingId },
        data: { status: paymentStatus },
      });
    } else {
      await tx.payment.create({
        data: { bookingId, status: paymentStatus },
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

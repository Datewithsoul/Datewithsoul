const fs = require('fs');
const path = require('path');
const p = path.resolve('app/payment/[bookingId]/actions.ts');
let code = fs.readFileSync(p, 'utf8');

// I'll just rewrite the uploadSlip function completely.
const newUploadSlip = 
export async function uploadSlip(formData: FormData) {
  const bookingId = formData.get("bookingId") as string;
  const slipImage = formData.get("slipImage") as File;

  if (!bookingId || !slipImage || slipImage.size === 0) {
    throw new Error("Missing required fields");
  }

  if (slipImage.size > 5 * 1024 * 1024) {
    redirectWithError(\/payment/\\, "ขนาดไฟล์เกิน 5MB");
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(slipImage.type)) {
    redirectWithError(\/payment/\\, "รองรับเฉพาะไฟล์รูปภาพ (JPEG, PNG, WEBP) เท่านั้น");
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
  
  if (booking.bookingGroupId) {
    throw new Error("This booking belongs to a group. Please use the group payment page.");
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

    redirect(\/payment/\?error=expired\);
  }

  const fileExt = slipImage.name.split('.').pop();
  const fileName = \\-\.\\;
  const filePath = \slips/\\;

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
    redirect(\/payment/\?error=upload_failed\);
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

  redirect(\/payment/\\);
}
;

const re = /export async function uploadSlip\(formData: FormData\) \{[\s\S]*?export async function cancelBooking/m;
code = code.replace(re, newUploadSlip + '\nexport async function cancelBooking');

fs.writeFileSync(p, code, 'utf8');

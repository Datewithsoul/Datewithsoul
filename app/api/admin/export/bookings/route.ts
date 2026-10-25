import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/require-admin";
import { buildAdminBookingWhere } from "@/lib/admin-booking-filters";
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS, isBookingStatus } from "@/lib/booking-status";
import { paidAmountForBooking } from "@/lib/revenue";
import { adminCheckFailure, csvResponse, toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

const HEADER = [
  "รหัสการจอง",
  "รหัสกลุ่ม",
  "ชื่อลูกค้า",
  "ชื่อ LINE",
  "เบอร์โทร",
  "คอร์ส",
  "วันเรียน",
  "เวลา",
  "ที่นั่ง",
  "ยอดที่จ่ายจริง (บาท)",
  "สถานะการจอง",
  "สถานะการชำระเงิน",
  "จองเมื่อ",
];

// Same filters as /admin/bookings (q, status), without pagination
export async function GET(request: Request) {
  const auth = await checkAdmin();
  if (!auth.ok) return adminCheckFailure(auth.reason);

  const params = new URL(request.url).searchParams;
  const bookings = await prisma.booking.findMany({
    where: buildAdminBookingWhere({ q: params.get("q"), status: params.get("status") }),
    include: {
      user: true,
      classEvent: true,
      payment: { select: { status: true } },
      bookingGroup: { select: { totalPrice: true, discountAmount: true, payment: { select: { status: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rows = bookings.map((b) => {
    const paymentStatus = (b.bookingGroup ? b.bookingGroup.payment : b.payment)?.status;
    return [
      b.id,
      b.bookingGroupId ?? "",
      b.user.name,
      b.user.lineName ?? "",
      b.user.phone ?? "",
      b.classEvent.name,
      b.classEvent.date.toLocaleDateString("th-TH"),
      `${b.classEvent.startTime}-${b.classEvent.endTime}`,
      b.seats,
      paidAmountForBooking(b),
      isBookingStatus(b.status) ? BOOKING_STATUS_LABELS[b.status] : b.status,
      paymentStatus ? PAYMENT_STATUS_LABELS[paymentStatus] : "",
      b.createdAt.toLocaleString("th-TH"),
    ];
  });

  const today = new Date().toISOString().slice(0, "yyyy-mm-dd".length);
  return csvResponse(`bookings-${today}.csv`, toCsv(HEADER, rows));
}

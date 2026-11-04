import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminPageHeader } from "@/components/admin-page-header";
import { BookingStatusBadge } from "@/components/admin-status-badge";
import { AdminBookingDialog, type BookingWithDetails } from "@/components/admin-booking-dialog";
import { BookingStatus, PaymentStatus, Prisma } from "@/app/generated/prisma";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { maskSlipUrl } from "@/lib/slips";
import { AdminCustomerName } from "@/components/admin-customer-name";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const paymentWithLogs = {
  include: {
    reviewLogs: {
      include: { reviewer: true },
      orderBy: { createdAt: "desc" },
    },
  },
} satisfies Prisma.PaymentDefaultArgs;

// One row per payment to review: a cart (BookingGroup) is paid with a single slip
type ReviewEntry = {
  key: string;
  booking: BookingWithDetails;
  classes: BookingWithDetails["classEvent"][];
  amountDue: number;
  slipUploadedAt: Date | null;
  status: string;
};

function toReviewEntries(bookings: BookingWithDetails[]): ReviewEntry[] {
  const entries = bookings.reduce((acc, booking) => {
    const group = booking.bookingGroup;
    const key = group ? `group-${group.id}` : booking.id;
    const existing = acc.get(key);
    if (existing) {
      existing.classes.push(booking.classEvent);
      return acc;
    }
    const payment = group ? group.payment : booking.payment;
    return acc.set(key, {
      key,
      booking,
      classes: [booking.classEvent],
      amountDue: group ? group.totalPrice : booking.totalPrice,
      slipUploadedAt: payment?.slipUrl ? payment.updatedAt : null,
      status: group ? group.status : booking.status,
    });
  }, new Map<string, ReviewEntry>());
  return [...entries.values()];
}

function formatUploadedAt(date: Date | null) {
  return date ? date.toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" }) : "-";
}

function ClassList({ classes }: { classes: ReviewEntry["classes"] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {classes.length > 1 ? (
        <div className="text-xs font-semibold text-[#8f3b2c]">จองแบบกลุ่ม ({classes.length} คอร์ส)</div>
      ) : null}
      {classes.map((c, i) => (
        <div key={`${c.id}-${i}`}>
          <div className="font-medium text-[#3d3229]">{c.name}</div>
          <div className="text-xs text-[#6a5d50] mt-0.5">
            จองเรียนวันที่: {c.date.toLocaleDateString("th-TH")} ({c.startTime}–{c.endTime} น.)
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function AdminPayments(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q ?? "";

  const whereCondition: Prisma.BookingWhereInput = {
    AND: [
      {
        // Must match getPendingCounts in ../layout.tsx (the sidebar badge)
        OR: [
          { status: BookingStatus.PAYMENT_REVIEW },
          // Grouped bookings are paid through the group; ignore any stray per-booking payment
          { bookingGroupId: null, payment: { status: PaymentStatus.UNDER_REVIEW } },
          { bookingGroup: { payment: { status: PaymentStatus.UNDER_REVIEW } } },
        ],
      },
      ...(query
        ? [{
            OR: [
              { user: { name: { contains: query, mode: "insensitive" as const } } },
              { user: { lineName: { contains: query, mode: "insensitive" as const } } },
              { user: { phone: { contains: query, mode: "insensitive" as const } } },
              { id: { contains: query, mode: "insensitive" as const } },
              { bookingGroupId: { contains: query, mode: "insensitive" as const } },
            ],
          }]
        : []),
    ],
  };

  const bookings = await prisma.booking.findMany({
    where: whereCondition,
    include: {
      user: true,
      classEvent: true,
      payment: paymentWithLogs,
      bookingGroup: { include: { payment: paymentWithLogs } },
    },
    orderBy: { createdAt: "asc" }, // Oldest first for review queue
  });

  // Never send raw storage references to the client; slips go through /api/slips
  bookings.forEach((b) => {
    maskSlipUrl(b.payment);
    maskSlipUrl(b.bookingGroup?.payment);
  });

  const entries = toReviewEntries(bookings);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <AdminPageHeader
        title="ตรวจสอบการชำระเงิน"
        description="ตรวจสลิปที่ส่งเข้ามา แล้วอนุมัติหรือปฏิเสธรายการ"
      />

      <section className="border border-[#ddd4c8] bg-white shadow-sm">
        <div className="border-b border-[#ddd4c8] px-5 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-base font-semibold text-[#3d3229]">รายการรอตรวจสอบ</h2>
            <p className="mt-1 text-sm text-[#6a5d50]">เหลือ {entries.length.toLocaleString("th-TH")} รายการที่ต้องตรวจ</p>
          </div>

          <form className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#a09486]" />
            <Input
              name="q"
              placeholder="ค้นหาชื่อ, เบอร์โทร, รหัส..."
              defaultValue={query}
              className="pl-9 bg-[#fbfaf8] border-[#ddd4c8] focus-visible:ring-[#8a6d1f]"
            />
          </form>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-5 text-[#6a5d50]">ลูกค้า</TableHead>
                <TableHead className="text-[#6a5d50]">คอร์สที่จอง</TableHead>
                <TableHead className="text-[#6a5d50]">แจ้งโอนเมื่อ</TableHead>
                <TableHead className="text-right text-[#6a5d50]">ยอดโอน (บาท)</TableHead>
                <TableHead className="text-[#6a5d50]">สถานะ</TableHead>
                <TableHead className="text-[#6a5d50]">ถัดไป</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="px-5 py-10 text-center text-[#6a5d50]">
                    ไม่มีรายการรอตรวจสอบการชำระเงินในขณะนี้
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((entry) => (
                  <TableRow key={entry.key} className="border-[#eee8e0] align-top group hover:bg-[#f7f4ef]/50">
                    <TableCell className="px-5 py-4">
                      <AdminCustomerName name={entry.booking.user.name} lineName={entry.booking.user.lineName} phone={entry.booking.user.phone} />
                    </TableCell>
                    <TableCell className="py-4">
                      <ClassList classes={entry.classes} />
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm font-medium text-[#3d3229]">{formatUploadedAt(entry.slipUploadedAt)}</div>
                      <div className="text-xs text-[#6a5d50] mt-0.5">เวลาส่งสลิป</div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium py-4 text-[#8a6d1f]">
                      ฿{entry.amountDue.toLocaleString("th-TH")}
                    </TableCell>
                    <TableCell className="py-4">
                      <BookingStatusBadge status={entry.status} />
                    </TableCell>
                    <TableCell className="px-5 py-4 flex items-start gap-2">
                      <AdminBookingDialog booking={entry.booking} triggerLabel="ตรวจสลิป" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col gap-4 p-4 bg-[#f4f1ec]">
          {entries.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#6a5d50] bg-white rounded-md border border-[#ddd4c8]">
              ไม่มีรายการรอตรวจสอบการชำระเงิน
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.key} className="bg-white p-4 rounded-md border border-[#ddd4c8] shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2 border-b border-[#ddd4c8] pb-3">
                  <div>
                    <AdminCustomerName name={entry.booking.user.name} lineName={entry.booking.user.lineName} phone={entry.booking.user.phone} nameClassName="text-base" />
                  </div>
                  <BookingStatusBadge status={entry.status} />
                </div>

                <ClassList classes={entry.classes} />

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-[#6a5d50]">ยอดโอน:</div>
                  <div className="font-medium text-[#8a6d1f] text-right">{entry.amountDue.toLocaleString("th-TH")} บาท</div>

                  <div className="text-[#6a5d50]">เวลาส่งสลิป:</div>
                  <div className="text-[#3d3229] text-right">{formatUploadedAt(entry.slipUploadedAt)}</div>
                </div>

                <div className="pt-3 border-t border-[#ddd4c8] flex justify-end">
                  <AdminBookingDialog booking={entry.booking} triggerLabel="ตรวจสลิป" />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

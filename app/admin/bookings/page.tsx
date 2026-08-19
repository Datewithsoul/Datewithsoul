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
import { BookingStatusBadge, PaymentStatusBadge } from "@/components/admin-status-badge";

export default async function AdminBookings() {
  const bookings = await prisma.booking.findMany({
    include: {
      user: true,
      classEvent: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <AdminPageHeader
        title="รายการจอง"
        description="ตรวจสอบสถานะการจองและการชำระเงินของลูกค้า"
      />

      <section className="border border-[#ddd4c8] bg-white">
        <div className="border-b border-[#ddd4c8] px-5 py-4">
          <h2 className="text-base font-semibold text-[#3d3229]">รายการทั้งหมด</h2>
          <p className="mt-1 text-sm text-[#6a5d50]">{bookings.length.toLocaleString("th-TH")} รายการ</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-5 text-[#6a5d50]">ลูกค้า</TableHead>
              <TableHead className="text-[#6a5d50]">คอร์สเรียน</TableHead>
              <TableHead className="text-center text-[#6a5d50]">ที่นั่ง</TableHead>
              <TableHead className="text-right text-[#6a5d50]">ยอดรวม (บาท)</TableHead>
              <TableHead className="text-[#6a5d50]">สถานะจอง</TableHead>
              <TableHead className="px-5 text-[#6a5d50]">สถานะชำระเงิน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="px-5 py-10 text-center text-[#6a5d50]">
                  ยังไม่มีรายการจอง เมื่อลูกค้าจองคอร์ส จะแสดงที่นี่
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((b) => (
                <TableRow key={b.id} className="border-[#eee8e0]">
                  <TableCell className="px-5 font-medium text-[#3d3229]">{b.user.name}</TableCell>
                  <TableCell>
                    <div className="font-medium text-[#3d3229]">{b.classEvent.name}</div>
                    <div className="text-xs text-[#6a5d50]">{b.classEvent.date.toLocaleDateString("th-TH")}</div>
                  </TableCell>
                  <TableCell className="text-center tabular-nums">{b.seats}</TableCell>
                  <TableCell className="text-right tabular-nums">{b.totalPrice.toLocaleString("th-TH")}</TableCell>
                  <TableCell>
                    <BookingStatusBadge status={b.status} />
                  </TableCell>
                  <TableCell className="px-5">
                    {b.payment ? (
                      <PaymentStatusBadge status={b.payment.status} />
                    ) : (
                      <span className="text-xs text-[#6a5d50]">ยังไม่ชำระเงิน</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}

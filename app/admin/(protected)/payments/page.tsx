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
import { AdminBookingControls } from "@/components/admin-booking-controls";
import { AdminBookingDialog } from "@/components/admin-booking-dialog";
import { BookingStatus, PaymentStatus } from "@/app/generated/prisma";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPayments(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q ?? "";

  const whereCondition: any = {
    AND: [
      {
        OR: [
          { status: BookingStatus.PAYMENT_REVIEW },
          { payment: { status: PaymentStatus.UNDER_REVIEW } },
        ],
      },
    ],
  };

  if (query) {
    whereCondition.AND.push({ OR: [
      { user: { name: { contains: query, mode: "insensitive" } } },
      { user: { phone: { contains: query, mode: "insensitive" } } },
      { id: { contains: query, mode: "insensitive" } },
    ] });
  }

  const bookings = await prisma.booking.findMany({
    where: whereCondition,
    include: {
      user: true,
      classEvent: true,
      payment: {
        include: {
          reviewLogs: {
            include: { reviewer: true },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" }, // Oldest first for review queue
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <AdminPageHeader
        title="ตรวจสอบการชำระเงิน"
        description="ตรวจสอบสลิปโอนเงินที่ลูกค้าอัปโหลดเข้ามา และยืนยันสถานะการจอง"
      />

      <section className="border border-[#ddd4c8] bg-white shadow-sm">
        <div className="border-b border-[#ddd4c8] px-5 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-base font-semibold text-[#3d3229]">รายการรอตรวจสอบ</h2>
            <p className="mt-1 text-sm text-[#6a5d50]">พบ {bookings.length.toLocaleString("th-TH")} รายการ</p>
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
                <TableHead className="text-[#6a5d50]">เวลาแจ้งโอน</TableHead>
                <TableHead className="text-right text-[#6a5d50]">ยอดโอน (บาท)</TableHead>
                <TableHead className="text-[#6a5d50]">สถานะ</TableHead>
                <TableHead className="text-[#6a5d50]">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="px-5 py-10 text-center text-[#6a5d50]">
                    ไม่มีรายการรอตรวจสอบการชำระเงินในขณะนี้
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((b) => (
                  <TableRow key={b.id} className="border-[#eee8e0] align-top group hover:bg-[#f7f4ef]/50">
                    <TableCell className="px-5 py-4">
                      <div className="font-medium text-[#3d3229]">{b.user.name}</div>
                      {b.user.phone && <div className="text-xs text-[#6a5d50] mt-0.5">{b.user.phone}</div>}
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="font-medium text-[#3d3229]">{b.classEvent.name}</div>
                      <div className="text-xs text-[#6a5d50] mt-0.5">
                        จองเรียนวันที่: {b.classEvent.date.toLocaleDateString("th-TH")}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm font-medium text-[#3d3229]">
                        {b.payment?.createdAt ? b.payment.createdAt.toLocaleString('th-TH', { 
                          dateStyle: 'short', timeStyle: 'short' 
                        }) : "-"}
                      </div>
                      <div className="text-xs text-[#6a5d50] mt-0.5">เวลาโอนเงิน</div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium py-4 text-[#8a6d1f]">
                      ฿{b.totalPrice.toLocaleString("th-TH")}
                    </TableCell>
                    <TableCell className="py-4">
                      <BookingStatusBadge status={b.status} />
                    </TableCell>
                    <TableCell className="px-5 py-4 flex items-start gap-2">
                      <AdminBookingDialog booking={b} triggerLabel="ตรวจสลิป" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col gap-4 p-4 bg-[#f4f1ec]">
          {bookings.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#6a5d50] bg-white rounded-md border border-[#ddd4c8]">
              ไม่มีรายการรอตรวจสอบการชำระเงิน
            </div>
          ) : (
            bookings.map((b) => (
              <div key={b.id} className="bg-white p-4 rounded-md border border-[#ddd4c8] shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2 border-b border-[#ddd4c8] pb-3">
                  <div>
                    <div className="font-medium text-[#3d3229] text-base">{b.user.name}</div>
                    {b.user.phone && <div className="text-xs text-[#6a5d50] mt-0.5">{b.user.phone}</div>}
                  </div>
                  <BookingStatusBadge status={b.status} />
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-[#6a5d50]">คอร์ส:</div>
                  <div className="font-medium text-[#3d3229] text-right">{b.classEvent.name}</div>
                  
                  <div className="text-[#6a5d50]">วันที่:</div>
                  <div className="text-[#3d3229] text-right">{b.classEvent.date.toLocaleDateString("th-TH")}</div>
                  
                  <div className="text-[#6a5d50]">ยอดโอน:</div>
                  <div className="font-medium text-[#8a6d1f] text-right">{b.totalPrice.toLocaleString("th-TH")} บาท</div>
                  
                  <div className="text-[#6a5d50]">เวลาแจ้งโอน:</div>
                  <div className="text-[#3d3229] text-right">
                    {b.payment?.createdAt ? b.payment.createdAt.toLocaleString('th-TH', { 
                      dateStyle: 'short', timeStyle: 'short' 
                    }) : "-"}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#ddd4c8] flex justify-end">
                  <AdminBookingDialog booking={b} triggerLabel="ตรวจสลิป" />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

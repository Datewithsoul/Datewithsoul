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
import { AdminChangeClassDialog } from "@/components/admin-change-class-dialog";
import { AdminBookingFilters } from "@/components/admin-booking-filters";
import { AdminBookingDialog } from "@/components/admin-booking-dialog";
import { AdminCreateBookingDialog } from "@/components/admin-create-booking-dialog";
import { BookingStatus, Prisma } from "@/app/generated/prisma";
import Link from "next/link";

export default async function AdminBookings(props: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q ?? "";
  const status = searchParams?.status ?? "ALL";

  const whereCondition: Prisma.BookingWhereInput = {};

  if (query) {
    whereCondition.OR = [
      { user: { name: { contains: query, mode: "insensitive" } } },
      { user: { phone: { contains: query, mode: "insensitive" } } },
      { id: { contains: query, mode: "insensitive" } },
    ];
  }

  if (status !== "ALL" && Object.values(BookingStatus).includes(status as BookingStatus)) {
    whereCondition.status = status as BookingStatus;
  }

  const [bookings, classEvents, users] = await Promise.all([
    prisma.booking.findMany({
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
      orderBy: { createdAt: "desc" },
    }),
    prisma.classEvent.findMany({
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      select: {
        id: true,
        name: true,
        date: true,
        startTime: true,
        endTime: true,
        totalSeats: true,
      },
    }),
    prisma.user.findMany({
      select: { id: true, name: true, phone: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <AdminPageHeader
        title="รายการจอง"
        description="ดูสลิปจากลูกค้า ตรวจสอบว่าชำระเงินจริง แล้วยืนยันเป็นชำระเงินแล้ว หรือเปลี่ยนสถานะได้เอง"
        action={<AdminCreateBookingDialog users={users} classEvents={classEvents} />}
      />

      <section className="border border-[#ddd4c8] bg-white shadow-sm">
        <div className="border-b border-[#ddd4c8] px-5 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-base font-semibold text-[#3d3229]">รายการทั้งหมด</h2>
            <p className="mt-1 text-sm text-[#6a5d50]">พบ {bookings.length.toLocaleString("th-TH")} รายการ</p>
          </div>
        </div>
        
        <AdminBookingFilters />

        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-5 text-[#6a5d50]">ลูกค้า</TableHead>
                <TableHead className="text-[#6a5d50]">คอร์สเรียน</TableHead>
                <TableHead className="text-[#6a5d50]">วันที่จอง</TableHead>
                <TableHead className="text-center text-[#6a5d50]">ที่นั่ง</TableHead>
                <TableHead className="text-right text-[#6a5d50]">ยอดรวม (บาท)</TableHead>
                <TableHead className="text-[#6a5d50]">สถานะ</TableHead>
                <TableHead className="text-[#6a5d50]">ตรวจสอบสลิป</TableHead>
                <TableHead className="px-5 text-[#6a5d50]">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={8} className="px-5 py-10 text-center text-[#6a5d50]">
                    ไม่พบรายการจองที่ตรงกับเงื่อนไข
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((b) => (
                  <TableRow key={b.id} className="border-[#eee8e0] align-top group hover:bg-[#f7f4ef]/50">
                    <TableCell className="px-5 py-4">
                      <div className="font-medium text-[#3d3229]">{b.user.name}</div>
                      {b.user.phone && <div className="text-xs text-[#6a5d50] mt-0.5">{b.user.phone}</div>}
                      <div className="text-[10px] text-[#a09486] font-mono mt-1" title={b.id}>
                        {b.id.substring(0, 8)}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="font-medium text-[#3d3229]">{b.classEvent.name}</div>
                      <div className="text-xs text-[#6a5d50] mt-0.5">
                        {b.classEvent.date.toLocaleDateString("th-TH")}
                      </div>
                      <div className="text-xs text-[#6a5d50]">
                        {b.classEvent.startTime}–{b.classEvent.endTime} น.
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-sm text-[#6a5d50] whitespace-nowrap">
                      {b.createdAt.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}
                    </TableCell>
                    <TableCell className="text-center tabular-nums py-4">{b.seats}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium py-4">{b.totalPrice.toLocaleString("th-TH")}</TableCell>
                    <TableCell className="py-4">
                      <BookingStatusBadge status={b.status} />
                    </TableCell>
                    <TableCell className="py-4">
                      <AdminBookingControls
                        bookingId={b.id}
                        status={b.status}
                        slipUrl={b.payment?.slipUrl ?? null}
                        reviewLogs={b.payment?.reviewLogs ?? []}
                      />
                    </TableCell>
                    <TableCell className="px-5 py-4 flex flex-col items-start gap-2">
                      <AdminBookingDialog booking={b} />
                      {b.status !== "CANCELLED" ? (
                        <AdminChangeClassDialog
                          bookingId={b.id}
                          currentClassEventId={b.classEventId}
                          seats={b.seats}
                          classEvents={classEvents}
                        />
                      ) : null}
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
              ไม่พบรายการจองที่ตรงกับเงื่อนไข
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

                  <div className="text-[#6a5d50]">วันที่จอง:</div>
                  <div className="text-[#3d3229] text-right">{b.createdAt.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" })}</div>
                  
                  <div className="text-[#6a5d50]">ที่นั่ง:</div>
                  <div className="text-[#3d3229] text-right">{b.seats} ที่นั่ง</div>
                  
                  <div className="text-[#6a5d50]">ยอดรวม:</div>
                  <div className="font-medium text-[#3d3229] text-right">{b.totalPrice.toLocaleString("th-TH")} บาท</div>
                </div>

                <div className="pt-3 border-t border-[#ddd4c8] flex flex-col gap-2">
                  <AdminBookingControls
                    bookingId={b.id}
                    status={b.status}
                    slipUrl={b.payment?.slipUrl ?? null}
                    reviewLogs={b.payment?.reviewLogs ?? []}
                  />
                  <div className="flex gap-2 w-full mt-2">
                    <div className="flex-1">
                      <AdminBookingDialog booking={b} />
                    </div>
                    {b.status !== "CANCELLED" ? (
                      <div className="flex-1">
                        <AdminChangeClassDialog
                          bookingId={b.id}
                          currentClassEventId={b.classEventId}
                          seats={b.seats}
                          classEvents={classEvents}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

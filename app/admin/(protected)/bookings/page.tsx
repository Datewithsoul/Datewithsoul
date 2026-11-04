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
import Link from "next/link";
import { Download } from "lucide-react";
import { buildAdminBookingWhere } from "@/lib/admin-booking-filters";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/data-table-pagination";
import { AdminGroupedBookingRow, type BookingTableRow } from "@/components/admin-grouped-booking-row";
import { maskSlipUrl } from "@/lib/slips";
import { bangkokToday } from "@/lib/bangkok-date";
import { AdminCustomerName } from "@/components/admin-customer-name";

export default async function AdminBookings(props: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.q ?? "";
  const status = searchParams?.status ?? "ALL";

  const whereCondition = buildAdminBookingWhere({ q: query, status });

  const currentPage = Number(searchParams?.page) || 1;
  const pageSize = 20;

  const today = bangkokToday();

  const [bookings, classEvents, totalItems] = await Promise.all([
    prisma.booking.findMany({
      where: whereCondition,
      include: {
        user: true,
        classEvent: true,
        bookingGroup: {
          include: {
            payment: {
              include: {
                reviewLogs: {
                  include: { reviewer: true },
                  orderBy: { createdAt: "desc" },
                },
              },
            },
          }
        },
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
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.classEvent.findMany({
      // Options for "change round": deleted and past rounds can't be booked into
      where: { deletedAt: null, date: { gte: today } },
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
    prisma.booking.count({ where: whereCondition })
  ]);
  
  // Never send raw storage references to the client; slips go through /api/slips
  bookings.forEach((b) => {
    maskSlipUrl(b.payment);
    maskSlipUrl(b.bookingGroup?.payment);
  });

  const totalPages = Math.ceil(totalItems / pageSize);

  // Export everything matching the current filters, not just this page
  const exportParams = new URLSearchParams();
  if (query) exportParams.set("q", query);
  if (status !== "ALL") exportParams.set("status", status);
  const exportHref = `/api/admin/export/bookings?${exportParams.toString()}`;

  const groupedBookings = bookings.reduce<BookingTableRow[]>((acc, booking) => {
    const group = booking.bookingGroup;
    if (group) {
      const existing = acc.find((g) => g.isGroup && g.id === group.id);
      if (existing?.isGroup) {
        existing.items.push(booking);
        existing.totalSeats += booking.seats;
        return acc;
      }
      acc.push({
        isGroup: true,
        id: group.id,
        user: booking.user,
        createdAt: group.createdAt,
        totalSeats: booking.seats,
        totalPrice: group.totalPrice,
        status: group.status,
        items: [booking],
        slipUrl: group.payment?.slipUrl ?? null,
        reviewLogs: group.payment?.reviewLogs ?? [],
      });
    } else {
      acc.push({
        isGroup: false,
        id: booking.id,
        items: [booking],
      });
    }
    return acc;
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <AdminPageHeader
        title="รายการจอง"
        description="ค้นหา ดูสถานะ และจัดการรายการจองของลูกค้า"
        action={
          <Link href="/admin/bookings/create">
            <Button className="admin-btn-primary h-9 px-3.5 text-sm gap-2">
              <span>+ สร้างการจองให้ลูกค้า</span>
            </Button>
          </Link>
        }
      />

      <section className="border border-[#ddd4c8] bg-white shadow-sm">
        <div className="border-b border-[#ddd4c8] px-5 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-base font-semibold text-[#3d3229]">รายการทั้งหมด</h2>
            <p className="mt-1 text-sm text-[#6a5d50]">แสดง {bookings.length.toLocaleString("th-TH")} รายการ</p>
          </div>
          <a
            href={exportHref}
            download
            className="inline-flex h-9 items-center gap-2 border border-[#ddd4c8] bg-white px-3.5 text-sm font-medium text-[#3d3229] transition-colors hover:bg-[#f7f4ef]"
          >
            <Download className="h-4 w-4" aria-hidden="true" /> ดาวน์โหลด CSV
          </a>
        </div>
        
        <AdminBookingFilters />

        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-5 text-[#6a5d50]">ลูกค้า</TableHead>
                <TableHead className="text-[#6a5d50]">คอร์สเรียน</TableHead>
                <TableHead className="text-[#6a5d50]">จองเมื่อ</TableHead>
                <TableHead className="text-center text-[#6a5d50]">ที่นั่ง</TableHead>
                <TableHead className="text-right text-[#6a5d50]">ยอดรวม (บาท)</TableHead>
                <TableHead className="text-[#6a5d50]">สถานะ</TableHead>
                <TableHead className="text-[#6a5d50]">การชำระเงิน</TableHead>
                <TableHead className="px-5 text-[#6a5d50]">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedBookings.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={8} className="px-5 py-10 text-center text-[#6a5d50]">
                    ไม่พบรายการจองที่ตรงกับเงื่อนไข
                  </TableCell>
                </TableRow>
              ) : (
                groupedBookings.map((g) => (
                  <AdminGroupedBookingRow key={g.id} group={g} classEvents={classEvents} />
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
                    <AdminCustomerName name={b.user.name} lineName={b.user.lineName} phone={b.user.phone} nameClassName="text-base" />
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
                  {b.bookingGroup ? (
                    <AdminBookingControls
                      bookingId={b.bookingGroup.id}
                      isGroup
                      status={b.bookingGroup.status}
                      slipUrl={b.bookingGroup.payment?.slipUrl ?? null}
                      expectedAmount={b.bookingGroup.totalPrice}
                      reviewLogs={b.bookingGroup.payment?.reviewLogs ?? []}
                    />
                  ) : (
                    <AdminBookingControls
                      bookingId={b.id}
                      status={b.status}
                      slipUrl={b.payment?.slipUrl ?? null}
                      expectedAmount={b.totalPrice}
                      reviewLogs={b.payment?.reviewLogs ?? []}
                    />
                  )}
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
        
        {totalPages > 1 && (
          <div className="border-t border-[#ddd4c8] p-4">
            <DataTablePagination totalPages={totalPages} />
          </div>
        )}
      </section>
    </div>
  );
}

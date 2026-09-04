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
import { BookingStatus, Prisma } from "@/app/generated/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTablePagination } from "@/components/data-table-pagination";
import { AdminGroupedBookingRow } from "@/components/admin-grouped-booking-row";

export default async function AdminBookings(props: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
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

  const currentPage = Number(searchParams?.page) || 1;
  const pageSize = 20;

  const [bookings, classEvents, users, totalItems] = await Promise.all([
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
    prisma.booking.count({ where: whereCondition })
  ]);
  
  const totalPages = Math.ceil(totalItems / pageSize);

  const groupedBookings = bookings.reduce((acc: any[], booking) => {
    if (booking.bookingGroupId) {
      const existing = acc.find(g => g.isGroup && g.id === booking.bookingGroupId);
      if (existing) {
        existing.items.push(booking);
        existing.totalSeats += booking.seats;
        return acc;
      }
      acc.push({
        isGroup: true,
        id: booking.bookingGroupId,
        user: booking.user,
        createdAt: booking.createdAt, // Group createdAt isn't fetched, fallback to booking
        totalSeats: booking.seats,
        totalPrice: booking.bookingGroup!.totalPrice,
        status: booking.bookingGroup!.status,
        items: [booking],
        slipUrl: booking.bookingGroup?.payment?.slipUrl ?? null,
        reviewLogs: booking.bookingGroup?.payment?.reviewLogs ?? [],
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
        description="ดูสลิปจากลูกค้า ตรวจสอบว่าชำระเงินจริง แล้วยืนยันเป็นชำระเงินแล้ว หรือเปลี่ยนสถานะได้เอง"
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
                    slipUrl={b.payment?.slipUrl ?? b.bookingGroup?.payment?.slipUrl ?? null}
                    reviewLogs={b.payment?.reviewLogs ?? b.bookingGroup?.payment?.reviewLogs ?? []}
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
        
        {totalPages > 1 && (
          <div className="border-t border-[#ddd4c8] p-4">
            <DataTablePagination totalPages={totalPages} />
          </div>
        )}
      </section>
    </div>
  );
}

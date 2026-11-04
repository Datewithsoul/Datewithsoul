import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { Prisma, RequestStatus, RequestType } from "@/app/generated/prisma";
import { format } from "date-fns";
import { SearchBar } from "@/components/search-bar";
import { DataTablePagination } from "@/components/data-table-pagination";
import { AdminPageHeader } from "@/components/admin-page-header";
import { formatClassEventLabel } from "@/lib/class-event-label";
import { paidAmountForBooking } from "@/lib/revenue";
import { bangkokToday } from "@/lib/bangkok-date";
import { AdminCustomerName } from "@/components/admin-customer-name";

import { RefundButton, RequestActions } from "./request-actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const REQUEST_TYPE_BADGES: Record<RequestType, { label: string; className: string }> = {
  COURSE_CHANGE: { label: "ขอเปลี่ยนรอบเรียน", className: "border-[#c9a227] bg-[#fbf6e6] text-[#8a6d1f]" },
  CANCELLATION: { label: "ขอยกเลิกการจอง", className: "border-[#8f3b2c] bg-[#fbeeea] text-[#8f3b2c]" },
};

const requestInclude = {
  user: true,
  booking: {
    include: {
      classEvent: true,
      bookingGroup: { select: { totalPrice: true, discountAmount: true } },
    },
  },
  requestedEvent: true,
} satisfies Prisma.ChangeRequestInclude;

const formatBaht = (amount: number) => `฿${amount.toLocaleString("th-TH")}`;

export default async function AdminRequestsPage({ searchParams }: { searchParams: Promise<{ q?: string, page?: string }> }) {
  await requireAdmin();

  const { q, page } = await searchParams;
  const currentPage = Number(page) || 1;

  const search: Prisma.ChangeRequestWhereInput = q
    ? {
        OR: [
          { user: { name: { contains: q, mode: "insensitive" } } },
          { user: { lineName: { contains: q, mode: "insensitive" } } },
          { user: { phone: { contains: q, mode: "insensitive" } } },
          { customerReason: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};
  const where: Prisma.ChangeRequestWhereInput = { ...search, status: RequestStatus.PENDING };
  // Approved cancellations stay APPROVED until the admin confirms the refund was transferred
  const refundWhere: Prisma.ChangeRequestWhereInput = {
    ...search,
    type: RequestType.CANCELLATION,
    status: RequestStatus.APPROVED,
  };

  const [requests, totalItems, refundsPending, upcomingEvents] = await Promise.all([
    prisma.changeRequest.findMany({
      where,
      include: requestInclude,
      orderBy: { createdAt: "asc" }, // Oldest first, like the payment queue
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.changeRequest.count({ where }),
    prisma.changeRequest.findMany({
      where: refundWhere,
      include: requestInclude,
      orderBy: { createdAt: "asc" },
    }),
    prisma.classEvent.findMany({
      where: { date: { gte: bangkokToday() }, status: "PUBLISHED", deletedAt: null },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      select: { id: true, name: true, date: true, startTime: true, endTime: true, totalSeats: true },
    })
  ]);

  const totalPages = Math.ceil(totalItems / PAGE_SIZE);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <AdminPageHeader
        title="คำขอจากลูกค้า"
        description="อนุมัติหรือปฏิเสธคำขอเปลี่ยนรอบเรียนและคำขอยกเลิก แล้วบันทึกการคืนเงิน"
      />
      <div className="sm:w-72">
        <SearchBar placeholder="ค้นหาชื่อ, เบอร์โทร, เหตุผล..." />
      </div>

      {refundsPending.length > 0 ? (
        <section className="border border-[#8f3b2c]/40 bg-white shadow-sm">
          <div className="border-b border-[#ddd4c8] px-5 py-4">
            <h2 className="text-base font-semibold text-[#3d3229]">รอคืนเงิน</h2>
            <p className="mt-1 text-sm text-[#6a5d50]">
              ยกเลิกแล้ว {refundsPending.length.toLocaleString("th-TH")} รายการ โอนเงินคืนลูกค้าแล้วกด &quot;คืนเงินแล้ว&quot;
            </p>
          </div>
          <div className="divide-y divide-[#eee8e0]">
            {refundsPending.map((req) => (
              <div key={req.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm">
                  <AdminCustomerName name={req.user.name} lineName={req.user.lineName} phone={req.user.phone} />
                  <div className="text-[#6a5d50]">{formatClassEventLabel(req.booking.classEvent)}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-[#6a5d50]">ยอดคืน</div>
                    <div className="text-lg font-semibold tabular-nums text-[#8f3b2c]">{formatBaht(req.newPrice ?? 0)}</div>
                  </div>
                  <RefundButton requestId={req.id} />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {requests.length === 0 ? (
        <div className="border border-[#ddd4c8] bg-white p-12 text-center shadow-sm">
          <h2 className="text-base font-semibold text-[#3d3229]">ไม่มีคำขอใหม่</h2>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map(req => {
            const badge = REQUEST_TYPE_BADGES[req.type];
            return (
              <div key={req.id} className="border border-[#ddd4c8] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <span className={`inline-block border px-2 py-0.5 text-xs font-semibold ${badge.className}`}>
                      {badge.label}
                    </span>
                    <AdminCustomerName
                      className="mt-2"
                      name={req.user.name}
                      lineName={req.user.lineName}
                      phone={req.user.phone}
                    />
                    <p className="text-xs text-[#6a5d50]">ส่งคำขอเมื่อ: {format(req.createdAt, "dd/MM/yyyy HH:mm")}</p>
                  </div>
                  <span className="border border-[#FF9800] bg-[#FFF4E5] px-3 py-1 text-xs font-bold text-[#E65100]">รอตรวจสอบ</span>
                </div>

                <div className="mb-4 space-y-1 border border-[#eee8e0] bg-[#fbfaf8] p-4 text-sm text-[#3d3229]">
                  <p><strong>รอบที่จอง:</strong> {formatClassEventLabel(req.booking.classEvent)} ({req.booking.seats} ที่นั่ง)</p>
                  {req.type === RequestType.COURSE_CHANGE && req.requestedEvent ? (
                    <p><strong>รอบใหม่ที่ต้องการ:</strong> {formatClassEventLabel(req.requestedEvent)}</p>
                  ) : null}
                  {req.type === RequestType.CANCELLATION ? (
                    <p><strong>ยอดที่ต้องคืนถ้าอนุมัติ:</strong> {formatBaht(paidAmountForBooking(req.booking))}</p>
                  ) : null}
                  {req.customerReason ? <p><strong>เหตุผล:</strong> {req.customerReason}</p> : null}
                </div>

                <RequestActions
                  requestId={req.id}
                  type={req.type}
                  classDate={req.booking.classEvent.date}
                  events={upcomingEvents}
                  requestedSeats={req.booking.seats}
                  requestedEventId={req.requestedEventId}
                />
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <DataTablePagination totalPages={totalPages} />
      )}
    </div>
  );
}

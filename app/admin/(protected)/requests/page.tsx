import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { RequestStatus, RequestType } from "@/app/generated/prisma";
import { format } from "date-fns";
import { SearchBar } from "@/components/search-bar";
import { DataTablePagination } from "@/components/data-table-pagination";

export default async function AdminRequestsPage({ searchParams }: { searchParams: Promise<{ q?: string, page?: string }> }) {
  await requireAdmin();
  
  const { q, page } = await searchParams;
  const currentPage = Number(page) || 1;
  const pageSize = 20;

  const where: any = { status: RequestStatus.PENDING, type: RequestType.COURSE_CHANGE };
  if (q) {
    where.OR = [
      { user: { name: { contains: q } } },
      { customerReason: { contains: q } }
    ];
  }

  const [requests, totalItems] = await Promise.all([
    prisma.changeRequest.findMany({
      where,
      include: {
        user: true,
        booking: { include: { classEvent: true } },
        requestedEvent: true
      },
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.changeRequest.count({ where })
  ]);
  
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-[#4A3B32]">คำขอเปลี่ยนรอบเรียน</h1>
        <SearchBar placeholder="ค้นหาชื่อ, เหตุผล..." />
      </div>
      
      {requests.length === 0 ? (
        <div className="bg-white border border-[#4A3B32]/20 rounded-2xl p-12 text-center">
          <h2 className="text-xl font-semibold mb-2 text-[#4A3B32]">ไม่มีคำขอใหม่</h2>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white border border-[#4A3B32] shadow-sm rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-[#4A3B32]">
                    ขอเปลี่ยนรอบเรียน
                  </h3>
                  <p className="text-sm text-[#4A3B32]/70">โดย: {req.user.name}</p>
                  <p className="text-sm text-[#4A3B32]/70">วันที่สร้างคำขอ: {format(req.createdAt, "dd/MM/yyyy HH:mm")}</p>
                </div>
                <span className="bg-[#FFF4E5] border border-[#FF9800] text-[#E65100] px-3 py-1 rounded-full text-xs font-bold">รอตรวจสอบ</span>
              </div>

              <div className="mb-4 text-sm bg-gray-50 border border-gray-100 p-4 rounded-lg">
                <p><strong>รอบเดิม:</strong> {req.booking.classEvent.name}</p>
                {req.requestedEvent && (
                  <p><strong>รอบใหม่ที่ต้องการ:</strong> {req.requestedEvent.name}</p>
                )}
                {req.customerReason && <p><strong>เหตุผล:</strong> {req.customerReason}</p>}
              </div>

              <div className="flex gap-2">
                <form action={async () => {
                  "use server";
                  const { approveRequest } = await import("../bookings/requests");
                  await approveRequest(req.id);
                }}>
                  <button className="bg-[#4A3B32] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#3A2D25] transition-colors border-2 border-[#4A3B32]">
                    อนุมัติ
                  </button>
                </form>
                <form action={async () => {
                  "use server";
                  const { rejectRequest } = await import("../bookings/requests");
                  await rejectRequest(req.id, "พิจารณาแล้วไม่สามารถอนุมัติได้");
                }}>
                  <button className="bg-white border-2 border-[#4A3B32] text-[#4A3B32] px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                    ปฏิเสธ
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {totalPages > 1 && (
        <DataTablePagination totalPages={totalPages} />
      )}
    </div>
  );
}


import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { RequestStatus, RequestType } from "@/app/generated/prisma";
import { format } from "date-fns";

export default async function AdminRequestsPage() {
  await requireAdmin();

  const requests = await prisma.changeRequest.findMany({
    where: { status: RequestStatus.PENDING, type: RequestType.COURSE_CHANGE },
    include: {
      user: true,
      booking: { include: { classEvent: true } },
      requestedEvent: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#4A3B32]">คำขอเปลี่ยนรอบเรียน</h1>
      
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
    </div>
  );
}


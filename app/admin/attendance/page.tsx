import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin-page-header";
import { BookingStatus } from "@/app/generated/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AttendanceListPage() {
  const classes = await prisma.classEvent.findMany({
    orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
    include: {
      bookings: {
        where: { status: BookingStatus.PAID },
      }
    }
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <AdminPageHeader
        title="เช็คชื่อเข้าเรียน"
        description="เลือกคอร์สเรียนเพื่อทำการเช็คชื่อผู้เข้าร่วมที่ชำระเงินแล้ว"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((c) => {
          const totalPaid = c.bookings.reduce((sum, b) => sum + b.seats, 0);
          const totalAttended = c.bookings.filter(b => b.attended).reduce((sum, b) => sum + b.seats, 0);
          
          return (
            <div key={c.id} className="bg-white border border-[#ddd4c8] rounded-xl shadow-sm p-5 flex flex-col hover:border-[#8a6d1f] transition-colors">
              <div className="flex justify-between items-start gap-2 mb-3">
                <h3 className="font-bold text-[#3d3229] line-clamp-2 leading-tight">{c.name}</h3>
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-semibold shrink-0 ${c.status === "COMPLETED" ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"}`}>
                  {c.status === "COMPLETED" ? "ปิดรับสมัคร" : c.status}
                </span>
              </div>
              
              <div className="text-sm text-[#6a5d50] mb-4 space-y-1">
                <div>📅 วันที่: {c.date.toLocaleDateString("th-TH")}</div>
                <div>⏰ เวลา: {c.startTime} - {c.endTime}</div>
                <div className="mt-2 pt-2 border-t border-[#eee8e0] font-medium text-[#3d3229]">
                  มาแล้ว: <span className="text-green-600 font-bold">{totalAttended}</span> / {totalPaid} ที่นั่ง
                </div>
              </div>

              <div className="mt-auto pt-4 flex gap-2">
                <Link href={`/admin/attendance/${c.id}`} className="flex-1">
                  <Button className="w-full bg-[#8a6d1f] hover:bg-[#6c5518] text-white">เช็คชื่อ</Button>
                </Link>
              </div>
            </div>
          );
        })}
        {classes.length === 0 && (
          <div className="col-span-full py-10 text-center text-[#6a5d50] bg-white rounded-xl border border-[#ddd4c8]">
            ยังไม่มีคอร์สเรียนในระบบ
          </div>
        )}
      </div>
    </div>
  );
}

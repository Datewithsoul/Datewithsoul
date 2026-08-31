import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin-page-header";
import { BookingStatus } from "@/app/generated/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { AttendanceToggle } from "./[id]/attendance-toggle";

export const dynamic = "force-dynamic";

export default async function AttendanceListPage() {
  const classes = await prisma.classEvent.findMany({
    orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
    include: {
      bookings: {
        where: { status: BookingStatus.CONFIRMED },
        include: { user: true },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  // Group classes by name
  const groupedClasses = classes.reduce((acc, c) => {
    if (!acc[c.name]) {
      acc[c.name] = [];
    }
    acc[c.name].push(c);
    return acc;
  }, {} as Record<string, typeof classes>);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <AdminPageHeader
        title="เช็คชื่อเข้าเรียน"
        description="เลือกคอร์สเรียนเพื่อดูรอบเวลาและทำการเช็คชื่อผู้เข้าร่วม"
      />

      {classes.length === 0 ? (
        <div className="py-10 text-center text-[#6a5d50] bg-white rounded-xl border border-[#ddd4c8]">
          ยังไม่มีคอร์สเรียนในระบบ
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#ddd4c8] shadow-sm overflow-hidden p-2">
          <div className="w-full flex flex-col gap-2">
            {Object.entries(groupedClasses).map(([courseName, events], index) => {
              const totalPaidCourse = events.reduce((sum, e) => sum + e.bookings.reduce((s, b) => s + b.seats, 0), 0);
              
              return (
                <details key={index} className="group border-b border-[#eee8e0] pb-2 last:border-0 last:pb-0 px-2">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-[#3d3229] hover:bg-[#fbfaf8] rounded-lg px-2 transition-colors [&::-webkit-details-marker]:hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between w-full pr-4 gap-2 text-left">
                      <h3 className="font-bold text-lg">{courseName}</h3>
                      <div className="text-sm font-normal text-[#6a5d50] bg-[#fbfaf8] px-3 py-1 rounded-full border border-[#eee8e0]">
                        {events.length} รอบเรียน • ผู้ลงทะเบียนทั้งหมด {totalPaidCourse} ที่นั่ง
                      </div>
                    </div>
                    <ChevronDown className="h-5 w-5 text-[#6a5d50] transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pb-5 pt-2 px-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {events.map((c) => {
                        // In this app, c.totalSeats is the REMAINING capacity. We need to add all bookings to get real total, 
                        // but since we only have PAID bookings here, we'll estimate or just show the paid fraction.
                        // Wait, let's just show {totalPaid} / {c.totalSeats + totalPaid}
                        const totalPaid = c.bookings.reduce((sum, b) => sum + b.seats, 0);
                        const totalAttended = c.bookings.filter(b => b.attended).reduce((sum, b) => sum + b.seats, 0);
                        const totalCapacity = c.totalSeats + totalPaid;
                        
                        return (
                          <div key={c.id} className="bg-[#fbfaf8] border border-[#ddd4c8] rounded-lg p-4 flex flex-col hover:border-[#8a6d1f] hover:shadow-sm transition-all">
                            <div className="flex justify-between items-start gap-2 mb-3">
                              <div className="text-[#3d3229] font-medium">
                                📅 {c.date.toLocaleDateString("th-TH")}
                              </div>
                              <span className={`px-2 py-0.5 text-[10px] rounded-full font-semibold shrink-0 ${c.status === "COMPLETED" ? "bg-gray-200 text-gray-700" : "bg-green-100 text-green-700"}`}>
                                {c.status === "COMPLETED" ? "ปิดรับสมัคร" : c.status}
                              </span>
                            </div>
                            
                            <div className="text-sm text-[#6a5d50] mb-4 space-y-1">
                              <div>⏰ เวลา: {c.startTime} - {c.endTime}</div>
                              <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#eee8e0]">
                                <span>จองแล้ว: <span className="font-bold text-[#3d3229]">{totalPaid} / {totalCapacity}</span> ที่นั่ง</span>
                                <span>มาแล้ว: <span className="font-bold text-green-600">{totalAttended}</span></span>
                              </div>
                            </div>

                            {/* Show names right here so they can click immediately */}
                            {c.bookings.length > 0 ? (
                              <div className="mt-2 flex flex-col gap-2 border-t border-[#eee8e0] pt-3">
                                {c.bookings.map(b => (
                                  <div key={b.id} className="flex items-center justify-between gap-2 text-sm bg-white p-2 rounded border border-[#eee8e0]">
                                    <div className="flex flex-col truncate">
                                      <span className="font-semibold text-[#3d3229] truncate">{b.user.name}</span>
                                      <span className="text-[10px] text-[#6a5d50]">{b.seats} ที่นั่ง</span>
                                    </div>
                                    <div className="shrink-0 scale-75 origin-right">
                                      <AttendanceToggle bookingId={b.id} initialStatus={b.attended} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="mt-2 text-xs text-center text-[#a09486] border-t border-[#eee8e0] pt-3">
                                ยังไม่มีผู้ชำระเงิน
                              </div>
                            )}

                            <div className="mt-4 pt-2 flex gap-2">
                              <Link href={`/admin/attendance/${c.id}`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full text-xs">จัดการเต็มรูปแบบ</Button>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

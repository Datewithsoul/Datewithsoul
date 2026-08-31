import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin-page-header";
import { notFound } from "next/navigation";
import { BookingStatus } from "@/app/generated/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { AttendanceToggle } from "./attendance-toggle";

export default async function AttendancePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;

  const classEvent = await prisma.classEvent.findUnique({
    where: { id },
    include: {
      bookings: {
        where: { status: BookingStatus.CONFIRMED },
        include: { user: true },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!classEvent) {
    notFound();
  }

  const totalPaidSeats = classEvent.bookings.reduce((sum, b) => sum + b.seats, 0);
  const totalAttended = classEvent.bookings.filter(b => b.attended).reduce((sum, b) => sum + b.seats, 0);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex items-center gap-2 mb-2 text-[#6a5d50]">
        <Link href="/admin/attendance" className="hover:text-[#3d3229] hover:underline flex items-center gap-1 text-sm">
          <ArrowLeft className="h-4 w-4" /> กลับไปหน้ารายการเช็คชื่อ
        </Link>
      </div>

      <AdminPageHeader
        title={`เช็คชื่อ: ${classEvent.name}`}
        description={`รอบวันที่ ${classEvent.date.toLocaleDateString("th-TH")} เวลา ${classEvent.startTime} - ${classEvent.endTime}`}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-[#ddd4c8] shadow-sm flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-[#3d3229]">{totalPaidSeats}</div>
          <div className="text-sm text-[#6a5d50] mt-1">ที่นั่งที่ชำระเงินแล้ว</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#ddd4c8] shadow-sm flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-green-600">{totalAttended}</div>
          <div className="text-sm text-[#6a5d50] mt-1">มาเข้าร่วมแล้ว</div>
        </div>
      </div>

      <section className="bg-white border border-[#ddd4c8] rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-[#ddd4c8] px-5 py-4 bg-[#fbfaf8]">
          <h2 className="font-semibold text-[#3d3229]">รายชื่อผู้เข้าร่วม (เฉพาะที่ชำระเงินแล้ว)</h2>
        </div>
        
        {classEvent.bookings.length === 0 ? (
          <div className="p-8 text-center text-[#6a5d50]">
            ยังไม่มีผู้ชำระเงินสำหรับคอร์สนี้
          </div>
        ) : (
          <div className="divide-y divide-[#eee8e0]">
            {classEvent.bookings.map((booking) => (
              <div key={booking.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#fbfaf8] transition-colors">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <AttendanceToggle bookingId={booking.id} initialStatus={booking.attended} />
                  </div>
                  <div>
                    <div className="font-medium text-[#3d3229] text-lg">{booking.user.name}</div>
                    <div className="text-sm text-[#6a5d50] mt-1">
                      {booking.user.email} {booking.user.phone && `• ${booking.user.phone}`}
                    </div>
                    <div className="text-sm font-semibold text-[#8a6d1f] mt-1">
                      จอง {booking.seats} ที่นั่ง
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

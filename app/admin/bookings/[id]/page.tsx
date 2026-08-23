import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin-page-header";
import { BookingStatusBadge } from "@/components/admin-status-badge";
import { AdminBookingControls } from "@/components/admin-booking-controls";
import Link from "next/link";
import { ArrowLeft, User, Calendar, CreditCard, Clock } from "lucide-react";
import Image from "next/image";

export default async function AdminBookingDetail(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const bookingId = params.id;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
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
  });

  if (!booking) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex items-center gap-2 text-sm text-[#6a5d50]">
        <Link href="/admin/bookings" className="hover:text-[#3d3229] hover:underline flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> กลับไปหน้ารายการจอง
        </Link>
      </div>

      <AdminPageHeader
        title={`รายละเอียดการจอง`}
        description={`รหัสการจอง: ${booking.id}`}
        action={<BookingStatusBadge status={booking.status} />}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="border border-[#ddd4c8] bg-white p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-[#ddd4c8] pb-3">
            <User className="h-5 w-5 text-[#8f3b2c]" />
            <h2 className="text-base font-semibold text-[#3d3229]">ข้อมูลลูกค้า</h2>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-[#6a5d50]">ชื่อ:</div>
            <div className="col-span-2 font-medium text-[#3d3229]">{booking.user.name}</div>
            
            <div className="text-[#6a5d50]">อีเมล:</div>
            <div className="col-span-2 text-[#3d3229]">{booking.user.email || "-"}</div>
            
            <div className="text-[#6a5d50]">เบอร์โทร:</div>
            <div className="col-span-2 text-[#3d3229]">{booking.user.phone || "-"}</div>
          </div>
        </section>

        <section className="border border-[#ddd4c8] bg-white p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-[#ddd4c8] pb-3">
            <Calendar className="h-5 w-5 text-[#8f3b2c]" />
            <h2 className="text-base font-semibold text-[#3d3229]">ข้อมูลคอร์สเรียน</h2>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-[#6a5d50]">คอร์ส:</div>
            <div className="col-span-2 font-medium text-[#3d3229]">{booking.classEvent.name}</div>
            
            <div className="text-[#6a5d50]">วันที่:</div>
            <div className="col-span-2 text-[#3d3229]">{booking.classEvent.date.toLocaleDateString("th-TH")}</div>
            
            <div className="text-[#6a5d50]">เวลา:</div>
            <div className="col-span-2 text-[#3d3229]">{booking.classEvent.startTime} - {booking.classEvent.endTime} น.</div>
            
            <div className="text-[#6a5d50]">จำนวนที่นั่ง:</div>
            <div className="col-span-2 text-[#3d3229]">{booking.seats} ที่นั่ง</div>
          </div>
        </section>
      </div>

      <section className="border border-[#ddd4c8] bg-white p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-[#ddd4c8] pb-3">
          <CreditCard className="h-5 w-5 text-[#8f3b2c]" />
          <h2 className="text-base font-semibold text-[#3d3229]">ข้อมูลการชำระเงิน</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-[#6a5d50]">ยอดที่ต้องชำระ:</div>
              <div className="font-medium text-[#3d3229] text-lg">{booking.totalPrice.toLocaleString("th-TH")} บาท</div>
              
              <div className="text-[#6a5d50]">สถานะการชำระเงิน:</div>
              <div>{booking.payment?.status ?? "ยังไม่ชำระ"}</div>
            </div>

            <div className="mt-4 border-t border-[#ddd4c8] pt-4">
              <h3 className="font-medium text-[#3d3229] mb-3">จัดการสถานะ</h3>
              <AdminBookingControls
                bookingId={booking.id}
                status={booking.status}
                slipUrl={booking.payment?.slipUrl ?? null}
                reviewLogs={booking.payment?.reviewLogs ?? []}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-[#3d3229]">สลิปโอนเงิน</h3>
            {booking.payment?.slipUrl ? (
              <a href={booking.payment.slipUrl} target="_blank" rel="noreferrer" className="block w-full max-w-sm rounded border border-[#ddd4c8] overflow-hidden hover:opacity-90 transition-opacity">
                <Image 
                  src={booking.payment.slipUrl} 
                  alt="Payment Slip" 
                  width={400} 
                  height={600} 
                  className="w-full h-auto object-contain"
                />
              </a>
            ) : (
              <div className="h-40 bg-[#f7f4ef] rounded border border-dashed border-[#ddd4c8] flex items-center justify-center text-sm text-[#6a5d50]">
                ยังไม่มีการแนบสลิป
              </div>
            )}
          </div>
        </div>
      </section>

      {booking.payment?.reviewLogs && booking.payment.reviewLogs.length > 0 && (
        <section className="border border-[#ddd4c8] bg-white p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-[#ddd4c8] pb-3">
            <Clock className="h-5 w-5 text-[#8f3b2c]" />
            <h2 className="text-base font-semibold text-[#3d3229]">ประวัติการตรวจสอบ</h2>
          </div>
          <div className="flex flex-col gap-3">
            {booking.payment.reviewLogs.map((log) => (
              <div key={log.id} className="text-sm flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 border-b border-[#eee8e0] pb-3 last:border-0 last:pb-0">
                <div className="text-[#6a5d50] w-32 shrink-0">
                  {log.createdAt.toLocaleString("th-TH")}
                </div>
                <div>
                  <span className="font-medium text-[#3d3229]">{log.reviewer.name}</span> เปลี่ยนสถานะจาก{" "}
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">{log.previousStatus}</span> เป็น{" "}
                  <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">{log.newStatus}</span>
                  {log.reason && <div className="mt-1 text-[#6a5d50] italic">หมายเหตุ: {log.reason}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

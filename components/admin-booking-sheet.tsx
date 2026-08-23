"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/admin-status-badge";
import { AdminBookingControls } from "@/components/admin-booking-controls";
import { User, Calendar, CreditCard, Clock } from "lucide-react";
import Image from "next/image";
import { Prisma } from "@/app/generated/prisma";

type BookingWithDetails = Prisma.BookingGetPayload<{
  include: {
    user: true;
    classEvent: true;
    payment: {
      include: {
        reviewLogs: {
          include: { reviewer: true };
        };
      };
    };
  };
}>;

export function AdminBookingSheet({ booking, triggerLabel = "รายละเอียด" }: { booking: BookingWithDetails, triggerLabel?: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant={triggerLabel === "รายละเอียด" ? "outline" : "default"} size="sm" className="h-8 px-3 text-xs">
          {triggerLabel}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-y-auto bg-[#f4f1ec]" side="right" data-admin>
        <SheetHeader className="mb-6 border-b border-[#ddd4c8] pb-4">
          <SheetTitle className="text-[#3d3229]">รายละเอียดการจอง</SheetTitle>
          <SheetDescription className="text-[#6a5d50]">
            รหัสการจอง: {booking.id}
          </SheetDescription>
          <div className="mt-2">
            <BookingStatusBadge status={booking.status} />
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-6">
          <section className="border border-[#ddd4c8] bg-white p-5 rounded-md shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#ddd4c8] pb-3 mb-4">
              <User className="h-5 w-5 text-[#8f3b2c]" />
              <h2 className="text-base font-semibold text-[#3d3229]">ข้อมูลลูกค้า</h2>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
              <div className="text-[#6a5d50]">ชื่อ:</div>
              <div className="font-medium text-[#3d3229]">{booking.user.name}</div>
              
              <div className="text-[#6a5d50]">อีเมล:</div>
              <div className="text-[#3d3229]">{booking.user.email || "-"}</div>
              
              <div className="text-[#6a5d50]">เบอร์โทร:</div>
              <div className="text-[#3d3229]">{booking.user.phone || "-"}</div>
            </div>
          </section>

          <section className="border border-[#ddd4c8] bg-white p-5 rounded-md shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#ddd4c8] pb-3 mb-4">
              <Calendar className="h-5 w-5 text-[#8f3b2c]" />
              <h2 className="text-base font-semibold text-[#3d3229]">ข้อมูลคอร์สเรียน</h2>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
              <div className="text-[#6a5d50]">คอร์ส:</div>
              <div className="font-medium text-[#3d3229]">{booking.classEvent.name}</div>
              
              <div className="text-[#6a5d50]">วันที่:</div>
              <div className="text-[#3d3229]">{booking.classEvent.date.toLocaleDateString("th-TH")}</div>
              
              <div className="text-[#6a5d50]">เวลา:</div>
              <div className="text-[#3d3229]">{booking.classEvent.startTime} - {booking.classEvent.endTime} น.</div>
              
              <div className="text-[#6a5d50]">จำนวนที่นั่ง:</div>
              <div className="text-[#3d3229]">{booking.seats} ที่นั่ง</div>
            </div>
          </section>

          <section className="border border-[#ddd4c8] bg-white p-5 rounded-md shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#ddd4c8] pb-3 mb-4">
              <CreditCard className="h-5 w-5 text-[#8f3b2c]" />
              <h2 className="text-base font-semibold text-[#3d3229]">ตรวจสอบการชำระเงิน</h2>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-2 text-sm border-b border-[#ddd4c8] pb-4">
                <div className="text-[#6a5d50]">ยอดที่ต้องชำระ:</div>
                <div className="font-medium text-[#3d3229] text-lg">{booking.totalPrice.toLocaleString("th-TH")} บาท</div>
                
                <div className="text-[#6a5d50]">สถานะการชำระเงิน:</div>
                <div>{booking.payment?.status ?? "ยังไม่ชำระ"}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-medium text-[#3d3229]">สลิปโอนเงิน</h3>
                  {booking.payment?.slipUrl ? (
                    <a href={booking.payment.slipUrl} target="_blank" rel="noreferrer" className="block w-full rounded border border-[#ddd4c8] overflow-hidden hover:opacity-90 transition-opacity bg-black/5">
                      <img 
                        src={booking.payment.slipUrl} 
                        alt="Payment Slip" 
                        className="w-full h-auto object-contain max-h-[300px]"
                      />
                    </a>
                  ) : (
                    <div className="h-32 bg-[#f7f4ef] rounded border border-dashed border-[#ddd4c8] flex items-center justify-center text-sm text-[#6a5d50]">
                      ยังไม่มีการแนบสลิป
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-medium text-[#3d3229]">จัดการสถานะ</h3>
                  <div className="bg-[#f7f4ef] p-4 rounded-md border border-[#ddd4c8]">
                    <AdminBookingControls
                      bookingId={booking.id}
                      status={booking.status}
                      slipUrl={booking.payment?.slipUrl ?? null}
                      reviewLogs={booking.payment?.reviewLogs ?? []}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {booking.payment?.reviewLogs && booking.payment.reviewLogs.length > 0 && (
            <section className="border border-[#ddd4c8] bg-white p-5 rounded-md shadow-sm mb-8">
              <div className="flex items-center gap-2 border-b border-[#ddd4c8] pb-3 mb-4">
                <Clock className="h-5 w-5 text-[#8f3b2c]" />
                <h2 className="text-base font-semibold text-[#3d3229]">ประวัติการตรวจสอบ (Timeline)</h2>
              </div>
              <div className="flex flex-col gap-3">
                {booking.payment.reviewLogs.map((log) => (
                  <div key={log.id} className="text-sm flex flex-col gap-1 border-b border-[#eee8e0] pb-3 last:border-0 last:pb-0">
                    <div className="text-[#6a5d50] text-xs">
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
      </SheetContent>
    </Sheet>
  );
}

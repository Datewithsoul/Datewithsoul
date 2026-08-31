"use client";

import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/admin-status-badge";
import { AdminBookingControls } from "@/components/admin-booking-controls";
import { User, Calendar, CreditCard, Clock } from "lucide-react";
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

export function AdminBookingDialog({ booking, triggerLabel = "รายละเอียด" }: { booking: BookingWithDetails, triggerLabel?: string }) {
  const [open, setOpen] = React.useState(false);

  const createdAtText = React.useMemo(() => {
    if (!booking?.createdAt) return "-";
    try {
      return new Date(booking.createdAt).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
    } catch {
      return String(booking.createdAt);
    }
  }, [booking?.createdAt]);

  const classDateText = React.useMemo(() => {
    if (!booking?.classEvent?.date) return "-";
    try {
      return new Date(booking.classEvent.date).toLocaleDateString("th-TH");
    } catch {
      return String(booking.classEvent.date);
    }
  }, [booking?.classEvent?.date]);

  return (
    <Drawer open={open} onOpenChange={setOpen} swipeDirection="right">
      <DrawerTrigger 
        render={
          <Button variant={triggerLabel === "รายละเอียด" ? "outline" : "default"} size="sm" className="h-8 px-3 text-xs">
            {triggerLabel}
          </Button>
        }
      />
      <DrawerContent 
        className="bg-[#f4f1ec] m-2 sm:m-4 overflow-hidden rounded-2xl after:hidden"
        style={{
          width: "min(440px, calc(100vw - 1rem))",
          height: "calc(100dvh - 2rem)",
          maxHeight: "calc(100dvh - 2rem)",
          "--drawer-content-width": "min(440px, calc(100vw - 1rem))",
          "--drawer-content-height": "calc(100dvh - 2rem)",
        } as React.CSSProperties}
        data-admin
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 flex flex-col gap-4">
          <DrawerHeader className="mb-1 border-b border-[#ddd4c8] pb-3 px-0">
            <DrawerTitle className="text-[#3d3229]">รายละเอียดการจอง</DrawerTitle>
            <DrawerDescription className="text-[#6a5d50]">
              รหัสการจอง: {booking.id}
            </DrawerDescription>
            <p className="text-sm text-[#8a6d1f]">
              จองเมื่อ: {createdAtText}
            </p>
            <div className="mt-2 flex justify-center sm:justify-start">
              <BookingStatusBadge status={booking.status} />
            </div>
          </DrawerHeader>

          <section className="border border-[#ddd4c8] bg-white p-3 rounded-md shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#ddd4c8] pb-2 mb-3">
              <User className="h-5 w-5 text-[#8f3b2c]" />
              <h2 className="text-base font-semibold text-[#3d3229]">ข้อมูลลูกค้า</h2>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
              <div className="text-[#6a5d50]">ชื่อ:</div>
              <div className="font-medium text-[#3d3229]">{booking.user.name}</div>
              
              <div className="text-[#6a5d50]">อีเมล:</div>
              <div className="text-[#3d3229]">{booking.user.email || "-"}</div>
              
              <div className="text-[#6a5d50]">เบอร์โทร:</div>
              <div className="text-[#3d3229]">{booking.user.phone || "-"}</div>
            </div>
          </section>

          <section className="border border-[#ddd4c8] bg-white p-3 rounded-md shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#ddd4c8] pb-2 mb-3">
              <Calendar className="h-5 w-5 text-[#8f3b2c]" />
              <h2 className="text-base font-semibold text-[#3d3229]">ข้อมูลคอร์สเรียน</h2>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
              <div className="text-[#6a5d50]">คอร์ส:</div>
              <div className="font-medium text-[#3d3229]">{booking.classEvent.name}</div>
              
              <div className="text-[#6a5d50]">วันที่:</div>
              <div className="text-[#3d3229]">{classDateText}</div>
              
              <div className="text-[#6a5d50]">เวลา:</div>
              <div className="text-[#3d3229]">{booking.classEvent.startTime} - {booking.classEvent.endTime} น.</div>
              
              <div className="text-[#6a5d50]">จำนวนที่นั่ง:</div>
              <div className="text-[#3d3229]">{booking.seats} ที่นั่ง</div>
              
              <div className="text-[#6a5d50]">หมายเหตุ:</div>
              <div className="text-[#3d3229] whitespace-pre-wrap">{booking.note || "-"}</div>
            </div>
          </section>

          <section className="border border-[#ddd4c8] bg-white p-3 rounded-md shadow-sm">
            <div className="flex items-center gap-2 border-b border-[#ddd4c8] pb-2 mb-3">
              <CreditCard className="h-5 w-5 text-[#8f3b2c]" />
              <h2 className="text-base font-semibold text-[#3d3229]">ตรวจสอบการชำระเงิน</h2>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2 text-sm border-b border-[#ddd4c8] pb-4">
                <div className="text-[#6a5d50]">ยอดที่ต้องชำระ:</div>
                <div className="font-medium text-[#3d3229] text-lg">{booking.totalPrice.toLocaleString("th-TH")} บาท</div>
                
                <div className="text-[#6a5d50]">สถานะการชำระเงิน:</div>
                <div>{booking.payment?.status ?? "ยังไม่ชำระ"}</div>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 w-full">
                  <h3 className="text-sm font-medium text-[#3d3229]">สลิปโอนเงิน</h3>
                  {booking.payment?.slipUrl ? (
                    <a href={booking.payment.slipUrl} target="_blank" rel="noreferrer" className="block w-full max-h-[300px] rounded border border-[#ddd4c8] overflow-hidden hover:opacity-90 transition-opacity bg-black/5 flex items-center justify-center">
                      <img 
                        src={booking.payment.slipUrl} 
                        alt="Payment Slip" 
                        className="max-w-full max-h-[300px] object-contain"
                      />
                    </a>
                  ) : (
                    <div className="h-24 bg-[#f7f4ef] rounded border border-dashed border-[#ddd4c8] flex items-center justify-center text-sm text-[#6a5d50]">
                      ยังไม่มีการแนบสลิป
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <h3 className="text-sm font-medium text-[#3d3229]">จัดการสถานะ</h3>
                  <div className="bg-[#f7f4ef] p-3 rounded-md border border-[#ddd4c8]">
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
            <section className="border border-[#ddd4c8] bg-white p-3 rounded-md shadow-sm mb-6">
              <div className="flex items-center gap-2 border-b border-[#ddd4c8] pb-2 mb-3">
                <Clock className="h-5 w-5 text-[#8f3b2c]" />
                <h2 className="text-base font-semibold text-[#3d3229]">ประวัติการตรวจสอบ (Timeline)</h2>
              </div>
              
              <div className="flex flex-col gap-4">
                {booking.payment.reviewLogs.map((log) => {
                  let logDateStr = "-";
                  try {
                    logDateStr = new Date(log.createdAt).toLocaleString("th-TH");
                  } catch {
                    logDateStr = String(log.createdAt);
                  }
                  return (
                    <div key={log.id} className="text-sm flex flex-col gap-1 border-b border-[#eee8e0] pb-3 last:border-0 last:pb-0">
                      <div className="text-[#6a5d50] text-xs">
                        {logDateStr}
                      </div>
                      <div className="text-[#3d3229]">
                        <span className="font-medium">{log.reviewer?.name || "Admin"}</span> เปลี่ยนสถานะจาก{" "}
                        <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">{log.previousStatus}</span> เป็น{" "}
                        <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">{log.newStatus}</span>
                        {log.reason && <div className="mt-1 text-[#6a5d50] italic">หมายเหตุ: {log.reason}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { confirmPayment, updateBookingStatus } from "@/app/admin/(protected)/bookings/actions";
import { BOOKING_STATUSES, BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/booking-status";
import type { AppBookingStatus } from "@/lib/booking-status";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
export function AdminBookingControls({
  bookingId,
  status,
  slipUrl,
  reviewLogs = [],
}: {
  bookingId: string;
  status: AppBookingStatus;
  slipUrl: string | null;
  reviewLogs?: any[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showSlip, setShowSlip] = useState(false);

  function changeStatus(nextStatus: string, reason?: string) {
    setError(null);
    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, nextStatus, reason);
      if (!result.success) {
        setError(result.error ?? "เปลี่ยนสถานะไม่สำเร็จ");
        return;
      }
      router.refresh();
    });
  }

  function verifyPayment() {
    setError(null);
    startTransition(async () => {
      const result = await confirmPayment(bookingId);
      if (!result.success) {
        setError(result.error ?? "ยืนยันชำระเงินไม่สำเร็จ");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex min-w-[14rem] flex-col items-start gap-2">
      <Select
        value={status}
        onValueChange={(value) => changeStatus(value)}
        disabled={isPending}
      >
        <SelectTrigger className="h-8 w-full rounded-md border border-border bg-card px-2 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring">
          <SelectValue placeholder="เลือกสถานะ">
            {status ? BOOKING_STATUS_LABELS[status] : "เลือกสถานะ"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {BOOKING_STATUSES.map((item) => (
            <SelectItem key={item} value={item} className="text-xs">
              {BOOKING_STATUS_LABELS[item]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex flex-wrap items-center gap-2">
        {slipUrl ? (
          <button
            type="button"
            onClick={() => setShowSlip(true)}
            className="text-xs font-medium text-[#6a5d50] underline-offset-2 hover:text-[#3d3229] hover:underline"
          >
            ดูสลิป
          </button>
        ) : (
          <span className="text-xs text-[#6a5d50]">ยังไม่มีสลิป</span>
        )}

        {status !== "CONFIRMED" && slipUrl ? (
          <button
            type="button"
            disabled={isPending}
            onClick={verifyPayment}
            className="admin-btn-primary inline-flex h-7 items-center px-2.5 text-xs disabled:opacity-50"
          >
            ยืนยันชำระเงินแล้ว
          </button>
        ) : null}
      </div>

      {error ? <p className="text-xs text-[#8f3b2c]">{error}</p> : null}

      {showSlip && slipUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#3d3229]/50 p-4"
          onClick={() => setShowSlip(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-auto border border-[#ddd4c8] bg-white p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-[#3d3229]">สลิปการชำระเงิน</h3>
              <button
                type="button"
                onClick={() => setShowSlip(false)}
                className="text-xs text-[#6a5d50] hover:text-[#3d3229]"
              >
                ปิด
              </button>
            </div>
            <img src={slipUrl} alt="สลิปการชำระเงิน" className="w-full border border-[#eee8e0]" />
            {status !== "CONFIRMED" ? (
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    const reason = window.prompt("ระบุเหตุผลที่ปฏิเสธสลิป:");
                    if (reason !== null) {
                      changeStatus("PENDING_PAYMENT", reason);
                      setShowSlip(false);
                    }
                  }}
                  className="inline-flex h-9 flex-1 items-center justify-center text-sm border border-[#8f3b2c] text-[#8f3b2c] hover:bg-[#8f3b2c]/10 rounded-md disabled:opacity-50"
                >
                  สลิปไม่ถูกต้อง
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={verifyPayment}
                  className="admin-btn-primary inline-flex h-9 flex-1 items-center justify-center text-sm disabled:opacity-50"
                >
                  ยืนยันชำระเงิน
                </button>
              </div>
            ) : null}

            {reviewLogs && reviewLogs.length > 0 && (
              <div className="mt-6 border-t border-[#eee8e0] pt-4">
                <h4 className="text-sm font-semibold text-[#3d3229] mb-2">ประวัติการตรวจสอบ</h4>
                <div className="space-y-2">
                  {reviewLogs.map((log: any) => (
                    <div key={log.id} className="text-xs text-[#6a5d50] bg-gray-50 p-2 rounded">
                      <div className="flex justify-between">
                        <span className="font-medium text-[#3d3229]">{log.reviewer?.name || "Admin"}</span>
                        <span>{format(new Date(log.createdAt), "dd MMM yyyy HH:mm")}</span>
                      </div>
                      <div className="mt-1">
                        เปลี่ยนสถานะเป็น <span className="font-medium">{PAYMENT_STATUS_LABELS[log.newStatus as keyof typeof PAYMENT_STATUS_LABELS] || log.newStatus}</span>
                      </div>
                      {log.reason && (
                        <div className="mt-1 text-[#8f3b2c]">
                          เหตุผล: {log.reason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

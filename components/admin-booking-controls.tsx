"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { confirmPayment, updateBookingStatus } from "@/app/admin/bookings/actions";
import { BOOKING_STATUSES, BOOKING_STATUS_LABELS } from "@/lib/booking-status";
import type { AppBookingStatus } from "@/lib/booking-status";

export function AdminBookingControls({
  bookingId,
  status,
  slipUrl,
}: {
  bookingId: string;
  status: AppBookingStatus;
  slipUrl: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showSlip, setShowSlip] = useState(false);

  function changeStatus(nextStatus: string) {
    setError(null);
    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, nextStatus);
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
      <select
        value={status}
        disabled={isPending}
        onChange={(event) => changeStatus(event.target.value)}
        className="h-8 w-full rounded-md border border-[#ddd4c8] bg-white px-2 text-xs text-[#3d3229] outline-none focus:ring-2 focus:ring-[#8a6d1f]"
      >
        {BOOKING_STATUSES.map((item) => (
          <option key={item} value={item}>
            {BOOKING_STATUS_LABELS[item]}
          </option>
        ))}
      </select>

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

        {status !== "PAID" && slipUrl ? (
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
            {status !== "PAID" ? (
              <button
                type="button"
                disabled={isPending}
                onClick={verifyPayment}
                className="admin-btn-primary mt-4 inline-flex h-9 w-full items-center justify-center text-sm disabled:opacity-50"
              >
                ตรวจสอบแล้ว ยืนยันชำระเงินแล้ว
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { changeBookingClass } from "@/app/admin/(protected)/bookings/actions";

type ClassEventOption = {
  id: string;
  name: string;
  date: Date;
  startTime: string;
  endTime: string;
  totalSeats: number;
};

export function AdminChangeClassDialog({
  bookingId,
  currentClassEventId,
  seats,
  classEvents,
}: {
  bookingId: string;
  currentClassEventId: string;
  seats: number;
  classEvents: ClassEventOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(currentClassEventId);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleOpen() {
    setSelected(currentClassEventId);
    setError(null);
    setOpen(true);
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await changeBookingClass(bookingId, selected);
      if (!result.success) {
        setError(result.error ?? "เปลี่ยนรอบไม่สำเร็จ");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="text-xs font-medium text-[#6a5d50] underline-offset-2 hover:text-[#3d3229] hover:underline"
      >
        เปลี่ยนรอบ
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#3d3229]/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md border border-[#ddd4c8] bg-white p-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-[#3d3229]">เปลี่ยนรอบเรียน</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs text-[#6a5d50] hover:text-[#3d3229]"
              >
                ปิด
              </button>
            </div>

            {/* Class event list */}
            <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
              {classEvents.map((ce) => {
                const isSelected = ce.id === selected;
                const isCurrent = ce.id === currentClassEventId;
                const hasEnoughSeats = ce.totalSeats >= seats || isCurrent;

                return (
                  <label
                    key={ce.id}
                    className={[
                      "flex cursor-pointer items-start gap-3 rounded border p-3 transition-colors",
                      isSelected
                        ? "border-[#8a6d1f] bg-[#fdf8ee]"
                        : "border-[#ddd4c8] hover:border-[#c4a85e] hover:bg-[#fafaf7]",
                      !hasEnoughSeats ? "cursor-not-allowed opacity-50" : "",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      name="classEvent"
                      value={ce.id}
                      checked={isSelected}
                      disabled={!hasEnoughSeats}
                      onChange={() => setSelected(ce.id)}
                      className="mt-0.5 accent-[#8a6d1f]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-[#3d3229]">{ce.name}</span>
                        {isCurrent && (
                          <span className="rounded bg-[#eee8e0] px-1.5 py-0.5 text-[10px] font-medium text-[#6a5d50]">
                            รอบปัจจุบัน
                          </span>
                        )}
                        {!hasEnoughSeats && (
                          <span className="rounded bg-[#fbe9e4] px-1.5 py-0.5 text-[10px] font-medium text-[#8f3b2c]">
                            ที่นั่งไม่พอ
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-[#6a5d50]">
                        {ce.date.toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                        {"  "}
                        {ce.startTime}–{ce.endTime} น.
                      </div>
                      <div className="mt-0.5 text-xs text-[#6a5d50]">
                        ว่าง {ce.totalSeats} ที่นั่ง
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            {error && <p className="mt-3 text-xs text-[#8f3b2c]">{error}</p>}

            {/* Actions */}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 items-center rounded border border-[#ddd4c8] bg-white px-4 text-xs text-[#6a5d50] hover:border-[#c4a85e] hover:text-[#3d3229]"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isPending || selected === currentClassEventId}
                onClick={handleSubmit}
                className="admin-btn-primary inline-flex h-8 items-center px-4 text-xs disabled:opacity-50"
              >
                {isPending ? "กำลังบันทึก..." : "ยืนยันเปลี่ยนรอบ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

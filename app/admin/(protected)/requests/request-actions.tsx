"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { approveRequest, rejectRequest } from "../bookings/requests";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface RequestActionsProps {
  requestId: string;
  events: any[];
  requestedSeats: number;
  requestedEventId: string | null;
}

export function RequestActions({ requestId, events, requestedSeats, requestedEventId }: RequestActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [isFull, setIsFull] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  const handleApprove = (overrideId?: string) => {
    startTransition(async () => {
      try {
        const result = await approveRequest(requestId, overrideId);
        if (result.success) {
          toast.success("อนุมัติคำขอสำเร็จ");
          setIsFull(false);
        } else {
          toast.error(result.error || "เกิดข้อผิดพลาดในการอนุมัติคำขอ");
          if (result.error === "ที่นั่งในรอบที่เลือกไม่เพียงพอ" || result.error === "ที่นั่งในรอบใหม่ไม่เพียงพอ") {
            setIsFull(true);
          }
        }
      } catch (error: any) {
        toast.error(error.message || "เกิดข้อผิดพลาด");
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      try {
        const result = await rejectRequest(requestId, "พิจารณาแล้วไม่สามารถอนุมัติได้");
        if (result.success) {
          toast.success("ปฏิเสธคำขอสำเร็จ");
        } else {
          toast.error(result.error || "เกิดข้อผิดพลาดในการปฏิเสธคำขอ");
        }
      } catch (error: any) {
        toast.error(error.message || "เกิดข้อผิดพลาด");
      }
    });
  };

  const availableEvents = events.filter(e => e.id !== requestedEventId && e.totalSeats >= requestedSeats);

  return (
    <div className="flex flex-col gap-4">
      {isFull && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-bold mb-2">รอบนี้เต็มแล้ว! คุณสามารถเลือกรอบอื่นที่มีที่นั่งว่างเพียงพอได้</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <select 
              className="border p-2 rounded-lg flex-1 text-sm bg-white"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              <option value="">-- เลือกรอบเรียนใหม่ --</option>
              {availableEvents.map(e => (
                <option key={e.id} value={e.id}>
                  {e.name} - {format(new Date(e.date), "dd MMM yyyy", { locale: th })} ({e.startTime}-{e.endTime}) [ว่าง {e.totalSeats} ที่นั่ง]
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (!selectedEventId) {
                  toast.error("กรุณาเลือกรอบเรียน");
                  return;
                }
                handleApprove(selectedEventId);
              }}
              disabled={isPending || !selectedEventId}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {isPending ? "กำลังดำเนินการ..." : "ย้ายไปรอบนี้"}
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => handleApprove()}
          disabled={isPending || isFull}
          className="bg-[#4A3B32] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#3A2D25] transition-colors border-2 border-[#4A3B32] disabled:opacity-50"
        >
          {isPending && !selectedEventId ? "กำลังดำเนินการ..." : "อนุมัติ"}
        </button>
        <button
          onClick={handleReject}
          disabled={isPending}
          className="bg-white border-2 border-[#4A3B32] text-[#4A3B32] px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {isPending ? "กำลังดำเนินการ..." : "ปฏิเสธ"}
        </button>
      </div>
    </div>
  );
}

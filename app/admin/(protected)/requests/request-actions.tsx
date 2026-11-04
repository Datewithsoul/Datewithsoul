"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { approveRequest, markRefunded, rejectRequest } from "../bookings/requests";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import type { RequestType } from "@/app/generated/prisma";
import type { ClassEventOption } from "@/components/admin-change-class-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { REQUEST_DEADLINE_DAYS, canSubmitBookingRequest } from "@/lib/booking-status";
import { BOOKING_CHANGE_POLICY, BOOKING_CHANGE_POLICY_PATH } from "@/lib/booking-policy";

const SEATS_FULL_ERROR = "ที่นั่งในรอบที่เลือกไม่เพียงพอ";
const LATE_REQUEST_REASON = `ส่งคำขอล่วงหน้าไม่ถึง ${REQUEST_DEADLINE_DAYS} วันก่อนวันเรียน ตามนโยบายการจอง`;
const QUICK_REJECT_REASONS = [
  LATE_REQUEST_REASON,
  "รอบที่ต้องการเปลี่ยนไปเต็มแล้ว",
  "พิจารณาแล้วไม่สามารถอนุมัติได้",
];

interface RequestActionsProps {
  requestId: string;
  type: RequestType;
  classDate: Date;
  events: ClassEventOption[];
  requestedSeats: number;
  requestedEventId: string | null;
}

export function RequestActions({ requestId, type, classDate, events, requestedSeats, requestedEventId }: RequestActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [isFull, setIsFull] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const isCancellation = type === "CANCELLATION";
  const isPastDeadline = !canSubmitBookingRequest(classDate);
  const approveLabel = isCancellation ? "อนุมัติการยกเลิก" : "อนุมัติ";

  const handleApprove = (overrideId?: string) => {
    if (isCancellation && !window.confirm("ยืนยันการยกเลิกการจองนี้? ระบบจะคืนที่นั่งและย้ายไปรายการรอคืนเงิน")) {
      return;
    }
    startTransition(async () => {
      const result = await approveRequest(requestId, overrideId);
      if (result.success) {
        toast.success(isCancellation ? "อนุมัติการยกเลิกแล้ว รอโอนเงินคืน" : "อนุมัติคำขอสำเร็จ");
        setIsFull(false);
        return;
      }
      toast.error(result.error);
      if (result.error === SEATS_FULL_ERROR) setIsFull(true);
    });
  };

  const openRejectDialog = () => {
    setRejectReason(isPastDeadline ? LATE_REQUEST_REASON : "");
    setRejectOpen(true);
  };

  const handleReject = () => {
    const reason = rejectReason.trim();
    if (!reason) {
      toast.error("กรุณาระบุเหตุผลที่ปฏิเสธ");
      return;
    }
    startTransition(async () => {
      const result = await rejectRequest(requestId, reason);
      if (result.success) {
        toast.success("ปฏิเสธคำขอแล้ว ส่งเหตุผลและนโยบายให้ลูกค้าทาง LINE");
        setRejectOpen(false);
      } else {
        toast.error(result.error);
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
          className="admin-btn-primary inline-flex h-9 items-center px-4 text-sm font-semibold disabled:opacity-50"
        >
          {isPending ? "กำลังดำเนินการ..." : approveLabel}
        </button>
        <button
          onClick={openRejectDialog}
          disabled={isPending}
          className="inline-flex h-9 items-center border border-[#3d3229] bg-white px-4 text-sm font-semibold text-[#3d3229] transition-colors hover:bg-[#f7f4ef] disabled:opacity-50"
        >
          ปฏิเสธ
        </button>
      </div>

      <Dialog open={rejectOpen} onOpenChange={(open) => !isPending && setRejectOpen(open)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>ปฏิเสธคำขอ{isCancellation ? "ยกเลิกการจอง" : "เปลี่ยนรอบเรียน"}</DialogTitle>
            <DialogDescription>การจองของลูกค้าจะกลับไปเป็น &quot;ยืนยันแล้ว&quot; ที่รอบเดิม</DialogDescription>
          </DialogHeader>

          {isPastDeadline && (
            <p className="border border-[#c9a227] bg-[#fbf6e6] p-3 text-xs text-[#8a6d1f]">
              ตอนนี้เหลือไม่ถึง {REQUEST_DEADLINE_DAYS} วันก่อนวันเรียน ซึ่งเลยกำหนดตามนโยบายการจองแล้ว
            </p>
          )}

          <div className="grid gap-2">
            <label htmlFor={`reject-reason-${requestId}`} className="text-sm font-semibold text-[#3d3229]">
              เหตุผลที่ปฏิเสธ
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REJECT_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setRejectReason(reason)}
                  className={`border px-2 py-1 text-left text-xs transition-colors ${
                    rejectReason === reason
                      ? "border-[#3d3229] bg-[#3d3229] text-white"
                      : "border-[#ddd4c8] bg-white text-[#6a5d50] hover:border-[#3d3229]"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            <Textarea
              id={`reject-reason-${requestId}`}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="พิมพ์เหตุผล หรือเลือกจากด้านบน"
              rows={3}
            />
          </div>

          <div className="border border-[#eee8e0] bg-[#fbfaf8] p-3 text-xs text-[#3d3229]">
            <p className="mb-2 font-semibold">ลูกค้าจะได้รับทาง LINE</p>
            <ul className="mb-2 list-disc space-y-0.5 pl-4 text-[#6a5d50]">
              <li>เหตุผลที่กรอกด้านบน</li>
              <li>นโยบายการเปลี่ยนแปลงการจอง:</li>
            </ul>
            <ul className="mb-2 space-y-1 border-l-2 border-[#ddd4c8] pl-3 text-[#6a5d50]">
              {BOOKING_CHANGE_POLICY.content.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
            <a
              href={BOOKING_CHANGE_POLICY_PATH}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[#8f3b2c] underline underline-offset-2"
            >
              ลิงก์หน้านโยบายการจอง (กดเข้าไปดูได้)
            </a>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setRejectOpen(false)}
              disabled={isPending}
              className="inline-flex h-9 items-center justify-center border border-[#ddd4c8] bg-white px-4 text-sm font-semibold text-[#6a5d50] hover:bg-[#f7f4ef] disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={isPending || !rejectReason.trim()}
              className="admin-btn-primary inline-flex h-9 items-center justify-center px-4 text-sm font-semibold disabled:opacity-50"
            >
              {isPending ? "กำลังส่ง..." : "ยืนยันปฏิเสธและส่ง LINE"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function RefundButton({ requestId }: { requestId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!window.confirm("ยืนยันว่าโอนเงินคืนลูกค้าแล้ว? ระบบจะแจ้งลูกค้าทาง LINE")) return;
    startTransition(async () => {
      const result = await markRefunded(requestId);
      if (result.success) {
        toast.success("บันทึกการคืนเงินแล้ว");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="admin-btn-primary inline-flex h-9 items-center px-4 text-sm font-semibold disabled:opacity-50"
    >
      {isPending ? "กำลังบันทึก..." : "คืนเงินแล้ว"}
    </button>
  );
}

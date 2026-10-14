import { cn } from "@/lib/utils";

const STYLES: Record<string, { text: string; className: string; dot: string; live: boolean }> = {
  PENDING_PAYMENT: { text: "รอชำระเงิน", className: "bg-orange-50 text-orange-800 border-orange-200", dot: "bg-orange-500", live: true },
  PAYMENT_REVIEW: { text: "กำลังตรวจสอบสลิป", className: "bg-yellow-50 text-yellow-800 border-yellow-200", dot: "bg-yellow-500", live: true },
  CONFIRMED: { text: "ชำระเงินแล้ว", className: "bg-green-50 text-green-800 border-green-200", dot: "bg-green-500", live: false },
  CHANGE_REQUESTED: { text: "ขอเปลี่ยนรอบ", className: "bg-blue-50 text-blue-800 border-blue-200", dot: "bg-blue-500", live: true },
  CANCELLATION_REQUESTED: { text: "ขอยกเลิก", className: "bg-rose-50 text-rose-800 border-rose-200", dot: "bg-rose-500", live: true },
  CANCELLED: { text: "ยกเลิกแล้ว", className: "bg-gray-50 text-gray-600 border-gray-200", dot: "bg-gray-400", live: false },
  EXPIRED: { text: "หมดอายุ", className: "bg-gray-50 text-gray-600 border-gray-200", dot: "bg-gray-400", live: false },
  COMPLETED: { text: "เรียนแล้ว", className: "bg-violet-50 text-violet-800 border-violet-200", dot: "bg-violet-500", live: false },
};

/** Booking status pill; in-progress states get a pulsing "live" dot. */
export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const s = STYLES[status] ?? STYLES.PENDING_PAYMENT;
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold animate-pop-in", s.className, className)}>
      <span className="relative flex h-2 w-2">
        {s.live && <span className={cn("absolute inline-flex h-full w-full rounded-full animate-status-ping", s.dot)} />}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", s.dot)} />
      </span>
      {s.text}
    </span>
  );
}

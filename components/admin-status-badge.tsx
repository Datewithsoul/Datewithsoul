import { cn } from "@/lib/utils";

const styles = {
  neutral: "bg-[#ece7e1] text-[#3d3229]",
  attention: "bg-[#efe6d2] text-[#6b5410]",
  danger: "bg-[#f1e4df] text-[#8f3b2c]",
  outline: "border border-[#ddd4c8] bg-white text-[#6a5d50]",
} as const;

const bookingMap = {
  PENDING_PAYMENT: { label: "กำลังจอง/ชำระเงิน", tone: "attention" },
  PAYMENT_REVIEW: { label: "ตรวจสอบชำระเงิน", tone: "attention" },
  CONFIRMED: { label: "ยืนยันแล้ว", tone: "neutral" },
  CHANGE_REQUESTED: { label: "ขอเปลี่ยนรอบ", tone: "attention" },
  CANCELLATION_REQUESTED: { label: "ขอยกเลิก", tone: "attention" },
  CANCELLED: { label: "ยกเลิก", tone: "danger" },
  EXPIRED: { label: "หมดอายุ", tone: "danger" },
  COMPLETED: { label: "เรียนแล้ว", tone: "outline" },
} as const;

const paymentMap = {
  UNPAID: { label: "ยังไม่ชำระเงิน", tone: "outline" },
  UPLOADED: { label: "ส่งสลิปแล้ว", tone: "attention" },
  UNDER_REVIEW: { label: "รอตรวจสอบสลิป", tone: "attention" },
  VERIFIED: { label: "ชำระเงินแล้ว", tone: "neutral" },
  REFUND_PENDING: { label: "รอคืนเงิน", tone: "attention" },
  REFUNDED: { label: "คืนเงินแล้ว", tone: "neutral" },
  REJECTED: { label: "ไม่ผ่าน", tone: "danger" },
} as const;

const roleMap = {
  ADMIN: { label: "ผู้ดูแลระบบ", tone: "neutral" },
  CUSTOMER: { label: "ลูกค้า", tone: "outline" },
} as const;

function Pill({ label, tone }: { label: string; tone: keyof typeof styles }) {
  return (
    <span className={cn("inline-flex h-6 items-center rounded px-2 text-xs font-medium tabular-nums", styles[tone])}>
      {label}
    </span>
  );
}

export function BookingStatusBadge({ status }: { status: keyof typeof bookingMap | string }) {
  const item = bookingMap[status as keyof typeof bookingMap];
  if (!item) return <Pill label={status} tone="outline" />;
  return <Pill label={item.label} tone={item.tone} />;
}

export function PaymentStatusBadge({ status }: { status: keyof typeof paymentMap | string }) {
  const item = paymentMap[status as keyof typeof paymentMap];
  if (!item) return <Pill label={status} tone="outline" />;
  return <Pill label={item.label} tone={item.tone} />;
}

export function RoleBadge({ role }: { role: keyof typeof roleMap | string }) {
  const item = roleMap[role as keyof typeof roleMap];
  if (!item) return <Pill label={role} tone="outline" />;
  return <Pill label={item.label} tone={item.tone} />;
}

export const BOOKING_STATUSES = [
  "PENDING_PAYMENT",
  "PAYMENT_REVIEW",
  "CONFIRMED",
  "CHANGE_REQUESTED",
  "CANCELLATION_REQUESTED",
  "CANCELLED",
  "EXPIRED",
  "COMPLETED",
] as const;

export type AppBookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_STATUS_LABELS: Record<AppBookingStatus, string> = {
  PENDING_PAYMENT: "กำลังจอง/ชำระเงิน",
  PAYMENT_REVIEW: "ตรวจสอบชำระเงิน",
  CONFIRMED: "ยืนยันแล้ว",
  CHANGE_REQUESTED: "ขอเปลี่ยนรอบ",
  CANCELLATION_REQUESTED: "ขอยกเลิก",
  CANCELLED: "ยกเลิก",
  EXPIRED: "หมดอายุ",
  COMPLETED: "เรียนแล้ว",
};

export const PAYMENT_STATUS_LABELS = {
  UNPAID: "ยังไม่ชำระเงิน",
  UPLOADED: "ส่งสลิปแล้ว",
  UNDER_REVIEW: "รอตรวจสอบสลิป",
  VERIFIED: "ชำระเงินแล้ว",
  REJECTED: "ไม่ผ่าน",
} as const;

export const ACTIVE_BOOKING_STATUSES: AppBookingStatus[] = [
  "PENDING_PAYMENT",
  "PAYMENT_REVIEW",
  "CONFIRMED",
  "CHANGE_REQUESTED",
  "CANCELLATION_REQUESTED",
];

export const PAYABLE_BOOKING_STATUSES: AppBookingStatus[] = ["PENDING_PAYMENT"];

export function paymentStatusForBooking(status: AppBookingStatus) {
  switch (status) {
    case "PAYMENT_REVIEW":
      return "UNDER_REVIEW";
    case "CONFIRMED":
      return "VERIFIED";
    case "CANCELLED":
      return "REJECTED";
    default:
      return "UNPAID";
  }
}

export function isBookingStatus(value: string): value is AppBookingStatus {
  return (BOOKING_STATUSES as readonly string[]).includes(value as AppBookingStatus);
}

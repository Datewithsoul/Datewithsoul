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
  REFUND_PENDING: "รอคืนเงิน",
  REFUNDED: "คืนเงินแล้ว",
  REJECTED: "ไม่ผ่าน",
} as const;

// Customers must request a round change or cancellation at least this many days before the class date
export const REQUEST_DEADLINE_DAYS = 7;

/** True when the class date is still far enough away for a customer change/cancellation request. */
export function canSubmitBookingRequest(classDate: Date, now = new Date()) {
  const deadline = new Date(classDate);
  deadline.setHours(0, 0, 0, 0);
  deadline.setDate(deadline.getDate() - REQUEST_DEADLINE_DAYS);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return today <= deadline;
}

export const ACTIVE_BOOKING_STATUSES: AppBookingStatus[] = [
  "PENDING_PAYMENT",
  "PAYMENT_REVIEW",
  "CONFIRMED",
  "CHANGE_REQUESTED",
  "CANCELLATION_REQUESTED",
];

export const PAYABLE_BOOKING_STATUSES: AppBookingStatus[] = ["PENDING_PAYMENT"];

/**
 * Payment status implied by a booking status, or null when the booking status
 * says nothing about payment (e.g. COMPLETED, CHANGE_REQUESTED) and the
 * payment should be left as it is.
 */
const PAYMENT_STATUS_FOR_BOOKING: Partial<Record<AppBookingStatus, "UNPAID" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED">> = {
  PENDING_PAYMENT: "UNPAID",
  PAYMENT_REVIEW: "UNDER_REVIEW",
  CONFIRMED: "VERIFIED",
  CANCELLED: "REJECTED",
};

export function paymentStatusForBooking(status: AppBookingStatus) {
  return PAYMENT_STATUS_FOR_BOOKING[status] ?? null;
}

export function isBookingStatus(value: string): value is AppBookingStatus {
  return (BOOKING_STATUSES as readonly string[]).includes(value as AppBookingStatus);
}

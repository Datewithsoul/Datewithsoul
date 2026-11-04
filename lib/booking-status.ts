import { addDays, bangkokToday } from "@/lib/bangkok-date";

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

// Unpaid bookings release their seats after this window (lib/expire-bookings.ts)
const PAYMENT_WINDOW_MINUTES = 10;
const MS_PER_MINUTE = 60_000;
export const PAYMENT_WINDOW_MS = PAYMENT_WINDOW_MINUTES * MS_PER_MINUTE;

// Customers must request a round change or cancellation at least this many days before the class date
export const REQUEST_DEADLINE_DAYS = 7;

/** True when the class date is still far enough away for a customer change/cancellation request. */
export function canSubmitBookingRequest(classDate: Date, now = new Date()) {
  return bangkokToday(now) <= addDays(new Date(classDate), -REQUEST_DEADLINE_DAYS);
}

export const ACTIVE_BOOKING_STATUSES: AppBookingStatus[] = [
  "PENDING_PAYMENT",
  "PAYMENT_REVIEW",
  "CONFIRMED",
  "CHANGE_REQUESTED",
  "CANCELLATION_REQUESTED",
];

export const PAYABLE_BOOKING_STATUSES: AppBookingStatus[] = ["PENDING_PAYMENT"];

// Paid bookings that hold a seat in the class; CONFIRMED becomes COMPLETED once the class is over
export const ATTENDEE_BOOKING_STATUSES = ["CONFIRMED", "COMPLETED"] as const satisfies readonly AppBookingStatus[];

export function isPaidBookingStatus(status: string) {
  return (ATTENDEE_BOOKING_STATUSES as readonly string[]).includes(status);
}

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

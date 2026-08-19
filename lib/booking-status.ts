import { BookingStatus, PaymentStatus } from "@/app/generated/prisma";

export const BOOKING_STATUSES = [
  BookingStatus.BOOKING,
  BookingStatus.AWAITING_PAYMENT,
  BookingStatus.PAYMENT_REVIEW,
  BookingStatus.PAID,
  BookingStatus.CANCELLED,
] as const;

export type AppBookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_STATUS_LABELS: Record<AppBookingStatus, string> = {
  [BookingStatus.BOOKING]: "กำลังจอง",
  [BookingStatus.AWAITING_PAYMENT]: "กำลังชำระเงิน",
  [BookingStatus.PAYMENT_REVIEW]: "การตรวจสอบชำระเงิน",
  [BookingStatus.PAID]: "ชำระเงินแล้ว",
  [BookingStatus.CANCELLED]: "ยกเลิก",
};

export const PAYMENT_STATUS_LABELS = {
  [PaymentStatus.PENDING]: "รอชำระเงิน",
  [PaymentStatus.UNDER_REVIEW]: "รอตรวจสอบสลิป",
  [PaymentStatus.VERIFIED]: "ชำระเงินแล้ว",
  [PaymentStatus.REJECTED]: "ไม่ผ่าน",
} as const;

export const ACTIVE_BOOKING_STATUSES: AppBookingStatus[] = [
  BookingStatus.BOOKING,
  BookingStatus.AWAITING_PAYMENT,
  BookingStatus.PAYMENT_REVIEW,
  BookingStatus.PAID,
];

export const PAYABLE_BOOKING_STATUSES: AppBookingStatus[] = [BookingStatus.BOOKING, BookingStatus.AWAITING_PAYMENT];

export function paymentStatusForBooking(status: AppBookingStatus) {
  switch (status) {
    case BookingStatus.PAYMENT_REVIEW:
      return PaymentStatus.UNDER_REVIEW;
    case BookingStatus.PAID:
      return PaymentStatus.VERIFIED;
    case BookingStatus.CANCELLED:
      return PaymentStatus.REJECTED;
    default:
      return PaymentStatus.PENDING;
  }
}

export function isBookingStatus(value: string): value is AppBookingStatus {
  return (BOOKING_STATUSES as readonly string[]).includes(value as AppBookingStatus);
}

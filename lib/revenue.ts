import type { AppBookingStatus } from "@/lib/booking-status";

// Bookings whose money has been received and kept (a finished class is still revenue)
export const REVENUE_BOOKING_STATUSES: AppBookingStatus[] = ["CONFIRMED", "COMPLETED"];

export type PricedBooking = {
  totalPrice: number;
  bookingGroup?: { totalPrice: number; discountAmount: number } | null;
};

/**
 * What the customer actually paid for one booking.
 *
 * Cart bookings store their pre-discount price; the promo discount lives on the
 * BookingGroup. Spread it over the group's bookings in proportion to their price,
 * so the bookings of a group always add up to `BookingGroup.totalPrice`.
 */
export function paidAmountForBooking(booking: PricedBooking): number {
  const group = booking.bookingGroup;
  if (!group || group.discountAmount <= 0) return booking.totalPrice;

  const subtotal = group.totalPrice + group.discountAmount;
  if (subtotal <= 0) return 0;
  return (booking.totalPrice * group.totalPrice) / subtotal;
}

/** Selection needed by paidAmountForBooking, for Prisma queries. */
export const PRICED_BOOKING_SELECT = {
  totalPrice: true,
  bookingGroup: { select: { totalPrice: true, discountAmount: true } },
} as const;

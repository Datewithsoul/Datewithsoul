import { prisma } from "@/lib/prisma";
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

/**
 * Sum of paidAmountForBooking per booking status, computed in the database so the
 * dashboard doesn't load every booking. Keep the CASE in step with paidAmountForBooking.
 */
export async function sumPaidAmountByStatus(): Promise<Map<string, number>> {
  const rows = await prisma.$queryRaw<{ status: string; paid: number | null }[]>`
    SELECT b."status"::text AS status,
           SUM(
             CASE
               WHEN g."id" IS NULL OR g."discountAmount" <= 0 THEN b."totalPrice"
               WHEN g."totalPrice" + g."discountAmount" <= 0 THEN 0
               ELSE b."totalPrice" * g."totalPrice" / (g."totalPrice" + g."discountAmount")
             END
           )::float8 AS paid
    FROM "Booking" b
    LEFT JOIN "BookingGroup" g ON g."id" = b."bookingGroupId"
    GROUP BY b."status"
  `;
  return new Map(rows.map((row) => [row.status, row.paid ?? 0]));
}

/** Selection needed by paidAmountForBooking, for Prisma queries. */
export const PRICED_BOOKING_SELECT = {
  totalPrice: true,
  bookingGroup: { select: { totalPrice: true, discountAmount: true } },
} as const;

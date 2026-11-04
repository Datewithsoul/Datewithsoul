import { BookingStatus, type Prisma } from "@/app/generated/prisma";

/** Booking filter shared by /admin/bookings and its CSV export, from the page's `q` / `status` params. */
export function buildAdminBookingWhere({ q, status }: { q?: string | null; status?: string | null }) {
  const where: Prisma.BookingWhereInput = {};

  if (q) {
    where.OR = [
      { user: { name: { contains: q, mode: "insensitive" } } },
      { user: { lineName: { contains: q, mode: "insensitive" } } },
      { user: { phone: { contains: q, mode: "insensitive" } } },
      { id: { contains: q, mode: "insensitive" } },
    ];
  }

  if (status && status !== "ALL" && Object.values(BookingStatus).includes(status as BookingStatus)) {
    where.status = status as BookingStatus;
  }

  return where;
}

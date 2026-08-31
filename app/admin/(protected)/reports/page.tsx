import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin-page-header";
import { BookingStatus } from "@/app/generated/prisma";
import { AdminAnalyticsDashboard } from "@/components/admin-analytics-dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminReports() {
  const [bookingsRaw, classesRaw] = await Promise.all([
    prisma.booking.findMany({
      where: {
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
      },
      select: {
        id: true,
        createdAt: true,
        totalPrice: true,
        seats: true,
        status: true,
        classEventId: true,
        classEvent: {
          select: {
            name: true,
            startTime: true,
            endTime: true,
            date: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.classEvent.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        totalSeats: true,
        startTime: true,
        endTime: true,
        date: true,
      },
      orderBy: { date: "asc" },
    }),
  ]);

  const serializedBookings = bookingsRaw.map((b) => ({
    id: b.id,
    createdAt: b.createdAt.toISOString(),
    totalPrice: b.totalPrice,
    seats: b.seats,
    status: b.status,
    classEventId: b.classEventId,
    classEventName: b.classEvent?.name || "คอร์สเรียน",
    classStartTime: b.classEvent?.startTime || "",
    classEndTime: b.classEvent?.endTime || "",
    classDate: b.classEvent?.date ? b.classEvent.date.toISOString() : b.createdAt.toISOString(),
  }));

  const serializedClasses = classesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    price: c.price,
    totalSeats: c.totalSeats,
    startTime: c.startTime,
    endTime: c.endTime,
    date: c.date.toISOString(),
  }));

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <AdminPageHeader
        title="รายงานและสถิติการวิเคราะห์ (Analytics & Reports)"
        description="เปรียบเทียบยอดจอง ยอดขาย และแนวโน้มของแต่ละคอร์สเรียน พร้อมตัวกรองแยกตามสัปดาห์ เดือน และปีแบบละเอียด"
      />

      <AdminAnalyticsDashboard
        bookings={serializedBookings}
        classes={serializedClasses}
      />
    </div>
  );
}
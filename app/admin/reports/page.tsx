import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin-page-header";
import { DashboardChart } from "@/components/dashboard-chart";
import { BookingStatus } from "@/app/generated/prisma";
import { ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminReports() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const bookingsForChart = await prisma.booking.findMany({
    where: { status: BookingStatus.PAID },
    select: { createdAt: true, totalPrice: true, status: true, seats: true, payment: { select: { updatedAt: true } } },
  });

  const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const chartDataMap = new Map();
  
  let totalRevenue = 0;
  let totalBookings = 0;
  let totalSeats = 0;

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    chartDataMap.set(monthKey, {
      month: monthNames[d.getMonth()],
      revenue: 0,
      bookings: 0,
    });
  }

  bookingsForChart.forEach(b => {
    if (b.status === BookingStatus.PAID) {
      // Use payment verified date if available, otherwise fallback to booking creation date
      const eventDate = b.payment?.updatedAt ? new Date(b.payment.updatedAt) : new Date(b.createdAt);
      const monthKey = `${eventDate.getFullYear()}-${eventDate.getMonth()}`;
      
      if (chartDataMap.has(monthKey)) {
        const data = chartDataMap.get(monthKey);
        data.bookings += 1;
        data.revenue += b.totalPrice;
        totalRevenue += b.totalPrice;
        totalBookings += 1;
        totalSeats += b.seats;
      }
    }
  });

  const chartData = Array.from(chartDataMap.values());

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <AdminPageHeader
        title="รายงาน"
        description="สรุปผลประกอบการและสถิติการใช้งานย้อนหลัง 6 เดือน"
      />

      <dl className="grid grid-cols-1 divide-y divide-[#ddd4c8] border border-[#ddd4c8] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="px-5 py-4">
          <dt className="text-sm text-[#6a5d50]">รายได้รวม (6 เดือนล่าสุด)</dt>
          <dd className="mt-1 flex items-baseline justify-between gap-3">
            <span className="text-3xl font-bold tabular-nums text-[#3d3229]">
              ฿{totalRevenue.toLocaleString("th-TH")}
            </span>
          </dd>
        </div>
        <div className="px-5 py-4">
          <dt className="text-sm text-[#6a5d50]">จำนวนการจองสำเร็จ</dt>
          <dd className="mt-1 flex items-baseline justify-between gap-3">
            <span className="text-3xl font-bold tabular-nums text-[#3d3229]">
              {totalBookings.toLocaleString("th-TH")} ครั้ง
            </span>
          </dd>
        </div>
        <div className="px-5 py-4">
          <dt className="text-sm text-[#6a5d50]">จำนวนที่นั่งทั้งหมด</dt>
          <dd className="mt-1 flex items-baseline justify-between gap-3">
            <span className="text-3xl font-bold tabular-nums text-[#3d3229]">
              {totalSeats.toLocaleString("th-TH")} ที่นั่ง
            </span>
          </dd>
        </div>
      </dl>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="border border-[#ddd4c8] bg-white">
          <div className="border-b border-[#ddd4c8] px-5 py-4">
            <h2 className="text-base font-semibold text-[#3d3229]">แนวโน้มรายได้ (บาท)</h2>
          </div>
          <div className="px-5 py-6">
            <DashboardChart data={chartData} dataKey="revenue" />
          </div>
        </section>

        <section className="border border-[#ddd4c8] bg-white">
          <div className="border-b border-[#ddd4c8] px-5 py-4">
            <h2 className="text-base font-semibold text-[#3d3229]">แนวโน้มจำนวนการจอง (ครั้ง)</h2>
          </div>
          <div className="px-5 py-6">
            <DashboardChart data={chartData} dataKey="bookings" />
          </div>
        </section>
      </div>
    </div>
  );
}
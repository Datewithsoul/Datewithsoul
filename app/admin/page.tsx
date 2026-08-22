import { prisma } from "@/lib/prisma";
import { ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";
import { DashboardChart } from "@/components/dashboard-chart";
import { AdminPageHeader, AdminPrimaryLink } from "@/components/admin-page-header";
import { BookingStatusBadge } from "@/components/admin-status-badge";
import { BookingStatus } from "@/app/generated/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboard() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalClasses, totalBookings, pendingPayments, recentBookingsList, upcomingClasses, bookingsForChart] = await Promise.all([
    prisma.classEvent.count(),
    prisma.booking.count({ where: { status: BookingStatus.PAID } }),
    prisma.booking.count({ where: { status: BookingStatus.PAYMENT_REVIEW } }),
    prisma.booking.findMany({
      include: { user: true, classEvent: true, payment: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.classEvent.findMany({
      where: { date: { gte: today } },
      orderBy: { date: "asc" },
      take: 5,
    }),
    prisma.booking.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, totalPrice: true, status: true },
    }),
  ]);

  const monthNames = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const chartDataMap = new Map();
  
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
    const d = new Date(b.createdAt);
    const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
    if (chartDataMap.has(monthKey)) {
      const data = chartDataMap.get(monthKey);
      if (b.status === BookingStatus.PAID) {
        data.bookings += 1;
        data.revenue += b.totalPrice;
      }
    }
  });

  const chartData = Array.from(chartDataMap.values());

  const stats = [
    { label: "คอร์สเรียน", value: totalClasses, href: "/admin/classes" },
    { label: "รายการจอง", value: totalBookings, href: "/admin/bookings" },
    { label: "รอตรวจสอบการชำระเงิน", value: pendingPayments, href: "/admin/bookings", emphasize: pendingPayments > 0 },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <AdminPageHeader
        title="ภาพรวม"
        description="ติดตามคอร์สเรียน รายการจอง และการชำระเงินที่ต้องตรวจสอบ"
        action={
          <AdminPrimaryLink href="/admin/classes/new">
            <Plus className="h-4 w-4" /> เพิ่มคอร์สเรียน
          </AdminPrimaryLink>
        }
      />

      <dl className="grid grid-cols-1 divide-y divide-[#ddd4c8] border border-[#ddd4c8] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((stat) => (
          <div key={stat.label} className="px-5 py-4">
            <dt className="text-sm text-[#6a5d50]">{stat.label}</dt>
            <dd className="mt-1 flex items-baseline justify-between gap-3">
              <span className={`text-2xl font-semibold tabular-nums ${stat.emphasize ? "text-[#8f3b2c]" : "text-[#3d3229]"}`}>
                {stat.value.toLocaleString("th-TH")}
              </span>
              <Link href={stat.href} className="inline-flex items-center gap-1 text-xs text-[#6a5d50] hover:text-[#3d3229]">
                ดูรายการ <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.9fr)]">
        <div className="flex flex-col gap-8">
          <section className="border border-[#ddd4c8] bg-white">
            <div className="flex items-end justify-between gap-3 border-b border-[#ddd4c8] px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-[#3d3229]">รายได้ (บาท)</h2>
                <p className="mt-1 text-sm text-[#6a5d50]">เปรียบเทียบข้อมูลย้อนหลัง 6 เดือน</p>
              </div>
            </div>
            <div className="px-3 py-4 sm:px-5">
              <DashboardChart data={chartData} dataKey="revenue" />
            </div>
          </section>

          <section className="border border-[#ddd4c8] bg-white">
            <div className="flex items-end justify-between gap-3 border-b border-[#ddd4c8] px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-[#3d3229]">จำนวนการจอง (ครั้ง)</h2>
                <p className="mt-1 text-sm text-[#6a5d50]">เปรียบเทียบข้อมูลย้อนหลัง 6 เดือน</p>
              </div>
            </div>
            <div className="px-3 py-4 sm:px-5">
              <DashboardChart data={chartData} dataKey="bookings" />
            </div>
          </section>
        </div>

        <section className="border border-[#ddd4c8] bg-white">
          <div className="border-b border-[#ddd4c8] px-5 py-4">
            <h2 className="text-base font-semibold text-[#3d3229]">คอร์สที่กำลังจะถึง</h2>
            <p className="mt-1 text-sm text-[#6a5d50]">เรียงตามวันที่จัด</p>
          </div>
          {upcomingClasses.length === 0 ? (
            <p className="px-5 py-8 text-sm text-[#6a5d50]">ยังไม่มีคอร์สในอนาคต สามารถเพิ่มคอร์สใหม่ได้จากปุ่มด้านบน</p>
          ) : (
            <ul>
              {upcomingClasses.map((item, index) => (
                <li key={item.id} className={index === 0 ? "" : "border-t border-[#ddd4c8]"}>
                  <Link href={`/admin/classes/${item.id}/edit`} className="flex items-start justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-[#f7f4ef]">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#3d3229]">{item.name}</p>
                      <p className="mt-0.5 text-xs text-[#6a5d50]">
                        {item.date.toLocaleDateString("th-TH")} · {item.startTime}–{item.endTime}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-[#6a5d50]">{item.totalSeats} ที่นั่ง</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="border border-[#ddd4c8] bg-white">
        <div className="flex items-end justify-between gap-3 border-b border-[#ddd4c8] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#3d3229]">รายการจองล่าสุด</h2>
            <p className="mt-1 text-sm text-[#6a5d50]">รายการจองคลาสเรียนล่าสุดจากลูกค้า</p>
          </div>
          <Link href="/admin/bookings" className="text-sm text-[#6a5d50] hover:text-[#3d3229]">
            ดูทั้งหมด
          </Link>
        </div>
        {recentBookingsList.length === 0 ? (
          <p className="px-5 py-8 text-sm text-[#6a5d50]">ยังไม่มีรายการจองในขณะนี้</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#ddd4c8] text-left text-xs text-[#6a5d50]">
                  <th className="px-5 py-2.5 font-medium">ลูกค้า</th>
                  <th className="px-5 py-2.5 font-medium">คอร์ส</th>
                  <th className="px-5 py-2.5 font-medium">ยอด</th>
                  <th className="px-5 py-2.5 font-medium">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {recentBookingsList.map((booking) => (
                  <tr key={booking.id} className="border-b border-[#eee8e0] last:border-0 hover:bg-[#f7f4ef]/50">
                    <td className="px-5 py-3 font-medium text-[#3d3229]">{booking.user.name}</td>
                    <td className="px-5 py-3 text-[#3d3229]">
                      <div>{booking.classEvent.name}</div>
                      <div className="text-xs text-[#6a5d50]">{booking.classEvent.date.toLocaleDateString("th-TH")}</div>
                    </td>
                    <td className="px-5 py-3 tabular-nums">{booking.totalPrice.toLocaleString("th-TH")} บาท</td>
                    <td className="px-5 py-3"><BookingStatusBadge status={booking.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

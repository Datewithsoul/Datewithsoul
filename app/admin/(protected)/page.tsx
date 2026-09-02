import { prisma } from "@/lib/prisma";
import { ArrowUpRight, Plus, Calendar, CheckCircle, Clock, XCircle, AlertCircle, Megaphone, Banknote, FileText, LineChart } from "lucide-react";
import Link from "next/link";
import { DashboardChart } from "@/components/dashboard-chart";
import { AdminPageHeader, AdminPrimaryLink } from "@/components/admin-page-header";
import { BookingStatusBadge } from "@/components/admin-status-badge";
import { BookingStatus } from "@/app/generated/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboard() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalClasses,
    totalBookings,
    pendingPayments,
    recentBookingsList,
    upcomingClasses,
    bookingsForChart,
    newBookingsToday,
    awaitingPaymentBookings,
    almostFullClasses,
    bookingStatusGroups,
    bookingTotalSums
  ] = await Promise.all([
    prisma.classEvent.count(),
    prisma.booking.count({ where: { status: BookingStatus.CONFIRMED } }),
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
    prisma.booking.count({ where: { createdAt: { gte: today } } }),
    prisma.booking.count({ where: { status: BookingStatus.PENDING_PAYMENT } }),
    prisma.classEvent.count({ where: { date: { gte: today }, totalSeats: { lte: 3, gt: 0 } } }),
    prisma.booking.groupBy({ by: ['status'], _count: { id: true } }),
    prisma.booking.groupBy({ by: ['status'], _sum: { totalPrice: true } })
  ]);

  const getBookingCount = (status: BookingStatus) => bookingStatusGroups.find(g => g.status === status)?._count.id || 0;
  const getPaymentSum = (status: BookingStatus) => bookingTotalSums.find(g => g.status === status)?._sum.totalPrice || 0;

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
      if (b.status === BookingStatus.CONFIRMED) {
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

      {(newBookingsToday > 0 || pendingPayments > 0 || awaitingPaymentBookings > 0 || almostFullClasses > 0) && (
        <section className="bg-red-50 border border-[#8f3b2c]/30 rounded-md p-5 flex flex-col gap-3">
          <h2 className="text-base font-semibold text-[#8f3b2c] flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            สิ่งที่ต้องดำเนินการด่วน
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {pendingPayments > 0 && (
              <div className="bg-card border border-[#8f3b2c]/20 p-3 rounded-md flex flex-col gap-1">
                <span className="text-sm font-medium text-[#8f3b2c]">รอตรวจสอบสลิป</span>
                <span className="text-2xl font-bold text-[#8f3b2c]">{pendingPayments}</span>
                <Link href="/admin/bookings?status=PAYMENT_REVIEW" className="text-xs text-[#8f3b2c] hover:underline mt-1">ดูรายการ</Link>
              </div>
            )}
            {newBookingsToday > 0 && (
              <div className="bg-card border border-border p-3 rounded-md flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">การจองใหม่วันนี้</span>
                <span className="text-2xl font-bold text-foreground">{newBookingsToday}</span>
                <Link href="/admin/bookings" className="text-xs text-muted-foreground hover:underline mt-1">ดูรายการ</Link>
              </div>
            )}
            {awaitingPaymentBookings > 0 && (
              <div className="bg-card border border-border p-3 rounded-md flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">รอชำระเงิน</span>
                <span className="text-2xl font-bold text-foreground">{awaitingPaymentBookings}</span>
                <Link href="/admin/bookings?status=AWAITING_PAYMENT" className="text-xs text-muted-foreground hover:underline mt-1">ดูรายการ</Link>
              </div>
            )}
            {almostFullClasses > 0 && (
              <div className="bg-card border border-border p-3 rounded-md flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">คอร์สใกล้เต็ม</span>
                <span className="text-2xl font-bold text-foreground">{almostFullClasses}</span>
                <Link href="/admin/classes" className="text-xs text-muted-foreground hover:underline mt-1">ดูรายการ</Link>
              </div>
            )}
          </div>
        </section>
      )}

      <dl className="grid grid-cols-1 divide-y divide-[#ddd4c8] border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((stat) => (
          <div key={stat.label} className="px-5 py-4">
            <dt className="text-sm text-muted-foreground">{stat.label}</dt>
            <dd className="mt-1 flex items-baseline justify-between gap-3">
              <span className={`text-2xl font-semibold tabular-nums ${stat.emphasize ? "text-[#8f3b2c]" : "text-foreground"}`}>
                {stat.value.toLocaleString("th-TH")}
              </span>
              <Link href={stat.href} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                ดูรายการ <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </dd>
          </div>
        ))}
      </dl>

      <section>
        <h2 className="text-base font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/classes/new" className="inline-flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors">
            <Plus className="h-4 w-4" /> เพิ่มคลาสใหม่
          </Link>
          <Link href="/admin/bookings" className="inline-flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors">
            <FileText className="h-4 w-4" /> ดู Booking ทั้งหมด
          </Link>
          <Link href="/admin/bookings?status=PAYMENT_REVIEW" className="inline-flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors">
            <Banknote className="h-4 w-4" /> ตรวจสอบสลิป
          </Link>
          <Link href="/admin/classes" className="inline-flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors">
            <Calendar className="h-4 w-4" /> จัดการตารางเรียน
          </Link>
          <Link href="/admin/reports" className="inline-flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent transition-colors">
            <LineChart className="h-4 w-4 text-[#8f3b2c]" /> รายงานและกราฟวิเคราะห์ (Analytics)
          </Link>
          <button disabled className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-md text-sm font-medium text-gray-400 cursor-not-allowed">
            <Megaphone className="h-4 w-4" /> ส่งประกาศถึงลูกค้า
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="flex flex-col">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base">Booking Overview</CardTitle>
            <CardDescription>สรุปสถานะการจองทั้งหมด</CardDescription>
          </CardHeader>
          <div className="p-5 grid grid-cols-2 gap-y-6 gap-x-4 flex-1">
             <div className="flex flex-col">
               <span className="text-sm text-muted-foreground">ยืนยันแล้ว</span>
               <span className="text-2xl font-semibold text-foreground">{getBookingCount(BookingStatus.CONFIRMED).toLocaleString("th-TH")}</span>
             </div>
             <div className="flex flex-col">
               <span className="text-sm text-muted-foreground">รอชำระเงิน</span>
               <span className="text-2xl font-semibold text-foreground">{getBookingCount(BookingStatus.PENDING_PAYMENT).toLocaleString("th-TH")}</span>
             </div>
             <div className="flex flex-col">
               <span className="text-sm text-muted-foreground">รอตรวจสอบ</span>
               <span className="text-2xl font-semibold text-[#8f3b2c]">{getBookingCount(BookingStatus.PAYMENT_REVIEW).toLocaleString("th-TH")}</span>
             </div>
             <div className="flex flex-col">
               <span className="text-sm text-muted-foreground">ยกเลิก</span>
               <span className="text-2xl font-semibold text-foreground">{getBookingCount(BookingStatus.CANCELLED).toLocaleString("th-TH")}</span>
             </div>
             <div className="flex flex-col">
               <span className="text-sm text-muted-foreground">หมดอายุ</span>
               <span className="text-2xl font-semibold text-foreground">{getBookingCount(BookingStatus.EXPIRED).toLocaleString("th-TH")}</span>
             </div>
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base">Payment Overview</CardTitle>
            <CardDescription>สรุปยอดเงินตามสถานะ</CardDescription>
          </CardHeader>
          <div className="p-5 grid grid-cols-2 gap-y-6 gap-x-4 flex-1">
             <div className="flex flex-col">
               <span className="text-sm text-muted-foreground">ชำระแล้ว</span>
               <span className="text-2xl font-semibold text-foreground">฿{getPaymentSum(BookingStatus.CONFIRMED).toLocaleString("th-TH")}</span>
             </div>
             <div className="flex flex-col">
               <span className="text-sm text-muted-foreground">รอตรวจสอบ</span>
               <span className="text-2xl font-semibold text-[#8f3b2c]">฿{getPaymentSum(BookingStatus.PAYMENT_REVIEW).toLocaleString("th-TH")}</span>
             </div>
             <div className="flex flex-col col-span-2">
               <span className="text-sm text-muted-foreground">ถูกปฏิเสธ/ยกเลิก/หมดอายุ</span>
               <span className="text-2xl font-semibold text-muted-foreground">฿{(getPaymentSum(BookingStatus.CANCELLED) + getPaymentSum(BookingStatus.EXPIRED)).toLocaleString("th-TH")}</span>
             </div>
          </div>
          <div className="border-t border-border p-4 bg-accent">
            <Link href="/admin/bookings?status=PAYMENT_REVIEW" className="w-full flex justify-center items-center gap-2 bg-card border border-border px-4 py-2 rounded-md text-sm font-medium text-foreground hover:bg-gray-50 transition-colors">
               <Banknote className="h-4 w-4" /> ดูหน้าตรวจสอบ Payment
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.9fr)]">
        <div className="flex flex-col gap-8">
          <Card>
            <CardHeader className="flex flex-row items-end justify-between gap-3 border-b border-border pb-4">
              <div>
                <CardTitle className="text-base">รายได้ (บาท)</CardTitle>
                <CardDescription>เปรียบเทียบข้อมูลย้อนหลัง 6 เดือน</CardDescription>
              </div>
            </CardHeader>
            <div className="px-3 py-4 sm:px-5">
              <DashboardChart data={chartData} dataKey="revenue" />
            </div>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-end justify-between gap-3 border-b border-border pb-4">
              <div>
                <CardTitle className="text-base">จำนวนการจอง (ครั้ง)</CardTitle>
                <CardDescription>เปรียบเทียบข้อมูลย้อนหลัง 6 เดือน</CardDescription>
              </div>
            </CardHeader>
            <div className="px-3 py-4 sm:px-5">
              <DashboardChart data={chartData} dataKey="bookings" />
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base">คอร์สที่กำลังจะถึง</CardTitle>
            <CardDescription>เรียงตามวันที่จัด</CardDescription>
          </CardHeader>
          {upcomingClasses.length === 0 ? (
            <p className="px-5 py-8 text-sm text-muted-foreground">ยังไม่มีคอร์สในอนาคต สามารถเพิ่มคอร์สใหม่ได้จากปุ่มด้านบน</p>
          ) : (
            <ul>
              {upcomingClasses.map((item, index) => (
                <li key={item.id} className={index === 0 ? "" : "border-t border-border"}>
                  <Link href={`/admin/classes/${item.id}/edit`} className="flex items-start justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-accent">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.date.toLocaleDateString("th-TH")} · {item.startTime}–{item.endTime}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{item.totalSeats} ที่นั่ง</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-end justify-between gap-3 border-b border-border pb-4">
          <div>
            <CardTitle className="text-base">รายการจองล่าสุด</CardTitle>
            <CardDescription>รายการจองคลาสเรียนล่าสุดจากลูกค้า</CardDescription>
          </div>
          <Link href="/admin/bookings" className="text-sm text-muted-foreground hover:text-foreground">
            ดูทั้งหมด
          </Link>
        </CardHeader>
        {recentBookingsList.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">ยังไม่มีรายการจองในขณะนี้</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>ลูกค้า</TableHead>
                  <TableHead>คอร์ส</TableHead>
                  <TableHead>ยอด</TableHead>
                  <TableHead>สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookingsList.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.user.name}</TableCell>
                    <TableCell>
                      <div>{booking.classEvent.name}</div>
                      <div className="text-xs text-muted-foreground">{booking.classEvent.date.toLocaleDateString("th-TH")}</div>
                    </TableCell>
                    <TableCell className="tabular-nums">{booking.totalPrice.toLocaleString("th-TH")} บาท</TableCell>
                    <TableCell><BookingStatusBadge status={booking.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}

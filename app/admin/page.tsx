import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Users, CreditCard, ArrowUpRight, Plus, BookOpen } from "lucide-react";
import Link from "next/link";
import { DashboardChart } from "@/components/dashboard-chart";

export default async function AdminDashboard() {
  const totalClasses = await prisma.classEvent.count();
  const totalBookings = await prisma.booking.count();
  const pendingPayments = await prisma.payment.count({ where: { status: "PENDING" } });
  const chartData = [
    { month: "Jan", revenue: 15000, bookings: 10 }, { month: "Feb", revenue: 22000, bookings: 15 },
    { month: "Mar", revenue: 18000, bookings: 12 }, { month: "Apr", revenue: 35000, bookings: 25 },
    { month: "May", revenue: 42000, bookings: 30 }, { month: "Jun", revenue: 50000, bookings: 35 },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-7">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#b17800]">สวัสดีจากหลังบ้าน 👋</p>
          <h1 className="text-3xl font-black tracking-tight text-[#68452f] sm:text-4xl">ภาพรวมระบบ</h1>
          <p className="mt-2 text-[#806f5a]">สรุปข้อมูลสำคัญของ Date With Soul ในที่เดียว</p>
        </div>
        <Link href="/admin/classes/new" className="pop-btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm"><Plus className="h-4 w-4" /> เพิ่มคอร์สเรียน</Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-[#e7dfd2] bg-white shadow-sm"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-semibold text-[#806f5a]">คอร์สเรียนทั้งหมด</CardTitle><span className="rounded-lg bg-[#fff3b5] p-2 text-[#9b7200]"><CalendarDays className="h-4 w-4" /></span></CardHeader><CardContent><div className="text-3xl font-black text-[#68452f]">{totalClasses}</div><p className="mt-1 text-xs text-[#a18e75]">คลาสที่สร้างไว้ในระบบ</p></CardContent></Card>
        <Card className="border-[#e7dfd2] bg-white shadow-sm"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-semibold text-[#806f5a]">ยอดการจองทั้งหมด</CardTitle><span className="rounded-lg bg-[#f9e3dc] p-2 text-[#b6442f]"><Users className="h-4 w-4" /></span></CardHeader><CardContent><div className="text-3xl font-black text-[#68452f]">{totalBookings}</div><p className="mt-1 text-xs text-[#a18e75]">รายการจองทั้งหมด</p></CardContent></Card>
        <Card className="border-[#e7dfd2] bg-white shadow-sm"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-semibold text-[#806f5a]">รอตรวจสอบการชำระเงิน</CardTitle><span className="rounded-lg bg-[#f9e3dc] p-2 text-[#b6442f]"><CreditCard className="h-4 w-4" /></span></CardHeader><CardContent><div className="text-3xl font-black text-[#b6442f]">{pendingPayments}</div><p className="mt-1 text-xs text-[#a18e75]">รายการที่ต้องตรวจสอบ</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        <Card className="border-[#e7dfd2] bg-white shadow-sm"><CardHeader><CardTitle className="text-lg font-bold text-[#68452f]">แนวโน้มการเติบโต</CardTitle><p className="text-sm text-[#a18e75]">รายได้และจำนวนการจองในช่วง 6 เดือนล่าสุด</p></CardHeader><CardContent><DashboardChart data={chartData} /></CardContent></Card>
        <Card className="border-[#e7dfd2] bg-[#68452f] text-white shadow-sm"><CardHeader><CardTitle className="text-lg font-bold text-white">ทางลัดการจัดการ</CardTitle><p className="text-sm text-[#ead9c6]">ทำงานที่ใช้บ่อยได้ทันที</p></CardHeader><CardContent className="flex flex-col gap-3">
          <Link href="/admin/classes" className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-3 text-sm font-semibold transition-colors hover:bg-white/20"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#f7d64a]" /> ดูคอร์สเรียน</span><ArrowUpRight className="h-4 w-4" /></Link>
          <Link href="/admin/bookings" className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-3 text-sm font-semibold transition-colors hover:bg-white/20"><span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-[#f7d64a]" /> ตรวจรายการจอง</span><ArrowUpRight className="h-4 w-4" /></Link>
          <Link href="/admin/users" className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-3 text-sm font-semibold transition-colors hover:bg-white/20"><span className="flex items-center gap-2"><Users className="h-4 w-4 text-[#f7d64a]" /> ดูผู้ใช้งาน</span><ArrowUpRight className="h-4 w-4" /></Link>
        </CardContent></Card>
      </div>
    </div>
  );
}

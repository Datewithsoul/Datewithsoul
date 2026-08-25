import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin-page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { CheckCircle2, XCircle, MessageSquare, History, Users, Shield, Send, Sparkles } from "lucide-react";
import { RetryNotificationButton } from "@/components/retry-notification-button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminNotifications() {
  const notifications = await prisma.notificationLog.findMany({
    include: {
      user: true,
      booking: {
        include: {
          classEvent: true,
        },
      },
    },
    orderBy: { sentAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <AdminPageHeader
          title="การแจ้งเตือน LINE Official Account"
          description="ตรวจสอบประวัติการส่งข้อความย้อนหลังและจัดการรูปแบบข้อความแจ้งเตือนทาง LINE"
        />
        <div className="flex items-center gap-2">
          <Link
            href="/admin/notifications/templates"
            style={{ backgroundColor: "#1c1917", color: "#ffffff" }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl hover:brightness-110 transition-all shadow-md"
          >
            <MessageSquare className="h-4 w-4 text-[#fbbf24]" />
            จัดการเทมเพลตและทดสอบส่ง
          </Link>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#d6c7b2] gap-6 text-sm">
        <Link
          href="/admin/notifications"
          className="pb-3 border-b-2 border-[#1c1917] font-bold text-[#1c1917] flex items-center gap-2"
        >
          <History className="h-4 w-4 text-[#b45309]" />
          ประวัติการแจ้งเตือน (Logs) ({notifications.length})
        </Link>
        <Link
          href="/admin/notifications/templates"
          className="pb-3 text-[#57534e] hover:text-[#1c1917] font-semibold flex items-center gap-2 transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          เทมเพลตข้อความ LINE (Message Templates)
        </Link>
      </div>

      <section className="border-2 border-[#d6c7b2] bg-white rounded-2xl shadow-xs overflow-hidden">
        <div className="border-b border-[#e5dccb] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#faf6ee]">
          <div>
            <h2 className="text-base font-bold text-[#1c1917]">
              ประวัติการส่งข้อความล่าสุด ({notifications.length} รายการ)
            </h2>
            <p className="text-xs text-[#57534e] mt-0.5">
              บันทึกทุกรายการที่ส่งหาลูกค้า, แอดมิน และข้อความทดสอบ
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              style={{ backgroundColor: "#d1fae5", color: "#065f46" }}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> เชื่อมต่อ LINE API พร้อมใช้งาน
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-[#f5f0e6] border-b border-[#e5dccb]">
                <TableHead className="px-6 text-[#1c1917] font-bold text-xs">เวลาที่ส่ง</TableHead>
                <TableHead className="text-[#1c1917] font-bold text-xs">ผู้รับ</TableHead>
                <TableHead className="text-[#1c1917] font-bold text-xs">ประเภท</TableHead>
                <TableHead className="text-[#1c1917] font-bold text-xs min-w-[300px]">ข้อความที่ส่ง</TableHead>
                <TableHead className="px-6 text-[#1c1917] font-bold text-xs">อ้างอิง</TableHead>
                <TableHead className="px-6 text-[#1c1917] font-bold text-xs text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <History className="h-8 w-8 text-stone-300" />
                      <p className="text-sm font-bold text-[#1c1917]">ยังไม่มีประวัติการส่งข้อความ</p>
                      <p className="text-xs text-[#57534e]">
                        เมื่อมีการจอง, ชำระเงิน หรือส่งข้อความทดสอบ ประวัติจะปรากฏขึ้นที่นี่โดยอัตโนมัติ
                      </p>
                      <Link
                        href="/admin/notifications/templates"
                        style={{ backgroundColor: "#059669", color: "#ffffff" }}
                        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl shadow-xs"
                      >
                        <Send className="h-3.5 w-3.5" />
                        ไปที่หน้าทดสอบส่งข้อความ
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                notifications.map((log) => {
                  const isTest = log.type === "TEST_MESSAGE" || log.type.includes("TEST");
                  const isAdminAlert = log.type.startsWith("ADMIN_") || log.user?.role === "ADMIN";

                  return (
                    <TableRow key={log.id} className="border-b border-[#eee8e0] hover:bg-[#faf8f5] align-top">
                      <TableCell className="px-6 py-4 tabular-nums text-xs whitespace-nowrap text-[#1c1917] font-medium">
                        {format(new Date(log.sentAt), "dd/MM/yyyy HH:mm:ss")}
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="font-bold text-xs text-[#1c1917]">
                          {log.user ? log.user.name || "ผู้ใช้งาน" : "ไม่ระบุชื่อ"}
                        </div>
                        {log.user?.role === "ADMIN" && (
                          <span
                            style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
                            className="inline-block text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-300 mt-0.5"
                          >
                            ผู้ดูแลระบบ (Admin)
                          </span>
                        )}
                        {log.user?.lineId ? (
                          <div className="text-[10px] text-emerald-700 font-mono flex items-center gap-1 mt-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            {log.user.lineId.substring(0, 10)}...
                          </div>
                        ) : (
                          <div className="text-[10px] text-stone-500 flex items-center gap-1 mt-1">
                            LINE ID: ไม่ระบุ
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="py-4">
                        {isTest ? (
                          <span
                            style={{ backgroundColor: "#e0e7ff", color: "#3730a3" }}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold border border-indigo-200"
                          >
                            <Sparkles className="h-3 w-3" /> ข้อความทดสอบ
                          </span>
                        ) : isAdminAlert ? (
                          <span
                            style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold border border-amber-300"
                          >
                            <Shield className="h-3 w-3" /> แอดมิน
                          </span>
                        ) : (
                          <span
                            style={{ backgroundColor: "#d1fae5", color: "#065f46" }}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-bold border border-emerald-300"
                          >
                            <Users className="h-3 w-3" /> ลูกค้า
                          </span>
                        )}
                        <div className="text-[10px] font-mono text-stone-500 mt-1">
                          {log.type}
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="bg-[#faf8f5] p-2.5 rounded-xl border border-[#e5dccb] text-xs text-[#1c1917] font-sans whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                          {log.message || "-"}
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4 text-xs text-[#44403c]">
                        {log.booking ? (
                          <div className="bg-white p-2 rounded-lg border border-[#e5dccb] shadow-2xs">
                            <span className="font-bold text-[#1c1917]">จอง:</span>{" "}
                            <span className="font-mono">{log.booking.id.substring(0, 8)}</span>
                            <br />
                            <span className="font-bold text-[#1c1917]">คอร์ส:</span>{" "}
                            <span>{log.booking.classEvent?.name}</span>
                          </div>
                        ) : (
                          <span className="text-stone-400">-</span>
                        )}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-right">
                        <RetryNotificationButton notificationId={log.id} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

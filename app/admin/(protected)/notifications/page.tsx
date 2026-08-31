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
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-black rounded-xl border-2 border-[#3d3229] bg-[#fbbf24] text-[#3d3229] shadow-[2px_2px_0_0_#3d3229] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#3d3229] active:translate-y-0 active:shadow-[0_0_0_0_#3d3229] transition-all"
          >
            <MessageSquare className="h-4 w-4" />
            จัดการเทมเพลตและทดสอบส่ง
          </Link>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b-4 border-[#3d3229] gap-6 text-sm">
        <Link
          href="/admin/notifications"
          className="pb-3 border-b-4 border-[#3d3229] font-black text-[#3d3229] flex items-center gap-2 translate-y-[4px]"
        >
          <History className="h-4 w-4 text-[#e51d53]" />
          ประวัติการแจ้งเตือน (Logs) ({notifications.length})
        </Link>
        <Link
          href="/admin/notifications/templates"
          className="pb-3 text-[#6a5d50] hover:text-[#3d3229] font-bold flex items-center gap-2 transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          เทมเพลตข้อความ LINE (Message Templates)
        </Link>
      </div>

      <section className="border-4 border-[#3d3229] bg-white rounded-2xl shadow-[4px_4px_0px_0px_#3d3229] overflow-hidden">
        <div className="border-b-4 border-[#3d3229] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#fbe7a1]">
          <div>
            <h2 className="text-base font-black text-[#3d3229]">
              ประวัติการส่งข้อความล่าสุด ({notifications.length} รายการ)
            </h2>
            <p className="text-xs font-bold text-[#6a5d50] mt-0.5">
              บันทึกทุกรายการที่ส่งหาลูกค้า, แอดมิน และข้อความทดสอบ
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border-2 border-[#3d3229] bg-[#d1fae5] text-emerald-800 shadow-[2px_2px_0_0_#3d3229]">
              <CheckCircle2 className="h-4 w-4" /> เชื่อมต่อ LINE API พร้อมใช้งาน
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-white border-b-2 border-[#3d3229]">
                <TableHead className="px-6 text-[#3d3229] font-black text-xs">เวลาที่ส่ง</TableHead>
                <TableHead className="text-[#3d3229] font-black text-xs">ผู้รับ</TableHead>
                <TableHead className="text-[#3d3229] font-black text-xs">ประเภท</TableHead>
                <TableHead className="text-[#3d3229] font-black text-xs min-w-[300px]">ข้อความที่ส่ง</TableHead>
                <TableHead className="px-6 text-[#3d3229] font-black text-xs">อ้างอิง</TableHead>
                <TableHead className="px-6 text-[#3d3229] font-black text-xs text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="p-4 bg-[#fbe7a1] rounded-full border-2 border-[#3d3229] shadow-[2px_2px_0_0_#3d3229]">
                        <History className="h-8 w-8 text-[#3d3229]" />
                      </div>
                      <p className="text-sm font-black text-[#3d3229]">ยังไม่มีประวัติการส่งข้อความ</p>
                      <p className="text-xs font-bold text-[#6a5d50]">
                        เมื่อมีการจอง, ชำระเงิน หรือส่งข้อความทดสอบ ประวัติจะปรากฏขึ้นที่นี่โดยอัตโนมัติ
                      </p>
                      <Link
                        href="/admin/notifications/templates"
                        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-black rounded-xl border-2 border-[#3d3229] bg-[#e51d53] text-white shadow-[2px_2px_0_0_#3d3229] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_#3d3229] active:translate-y-0 active:shadow-[0_0_0_0_#3d3229] transition-all"
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
                    <TableRow key={log.id} className="border-b border-[#ddd4c8] hover:bg-[#faf8f5] align-top">
                      <TableCell className="px-6 py-4 tabular-nums text-xs whitespace-nowrap text-[#3d3229] font-bold">
                        {format(new Date(log.sentAt), "dd/MM/yyyy HH:mm:ss")}
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="font-black text-xs text-[#3d3229]">
                          {log.user ? log.user.name || "ผู้ใช้งาน" : "ไม่ระบุชื่อ"}
                        </div>
                        {log.user?.role === "ADMIN" && (
                          <span className="inline-block text-[10px] font-black px-1.5 py-0.5 rounded border border-[#3d3229] bg-[#fef3c7] text-[#92400e] mt-0.5 shadow-[1px_1px_0_0_#3d3229]">
                            ผู้ดูแลระบบ (Admin)
                          </span>
                        )}
                        {log.user?.lineId ? (
                          <div className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-1 mt-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            {log.user.lineId.substring(0, 10)}...
                          </div>
                        ) : (
                          <div className="text-[10px] text-[#8f8072] font-bold flex items-center gap-1 mt-1">
                            LINE ID: ไม่ระบุ
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="py-4">
                        {isTest ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-black border-2 border-[#3d3229] bg-[#e0e7ff] text-[#3730a3] shadow-[2px_2px_0_0_#3d3229]">
                            <Sparkles className="h-3 w-3" /> ข้อความทดสอบ
                          </span>
                        ) : isAdminAlert ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-black border-2 border-[#3d3229] bg-[#fef3c7] text-[#92400e] shadow-[2px_2px_0_0_#3d3229]">
                            <Shield className="h-3 w-3" /> แอดมิน
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-black border-2 border-[#3d3229] bg-[#d1fae5] text-[#065f46] shadow-[2px_2px_0_0_#3d3229]">
                            <Users className="h-3 w-3" /> ลูกค้า
                          </span>
                        )}
                        <div className="text-[10px] font-mono font-bold text-[#8f8072] mt-2">
                          {log.type}
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="bg-white p-2.5 rounded-xl border-2 border-[#3d3229] text-xs text-[#3d3229] font-sans font-bold whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto shadow-[2px_2px_0_0_#3d3229]">
                          {log.message || "-"}
                        </div>
                      </TableCell>

                      <TableCell className="px-6 py-4 text-xs text-[#44403c]">
                        {log.booking ? (
                          <div className="bg-[#faf8f5] p-2 rounded-lg border-2 border-[#3d3229] shadow-[2px_2px_0_0_#3d3229]">
                            <span className="font-black text-[#3d3229]">จอง:</span>{" "}
                            <span className="font-mono font-bold">{log.booking.id.substring(0, 8)}</span>
                            <br />
                            <span className="font-black text-[#3d3229]">คอร์ส:</span>{" "}
                            <span className="font-bold">{log.booking.classEvent?.name}</span>
                          </div>
                        ) : (
                          <span className="text-[#8f8072] font-bold">-</span>
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

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
import { CheckCircle2, XCircle, MessageSquare, History } from "lucide-react";
import { RetryNotificationButton } from "@/components/retry-notification-button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminNotifications() {
  const notifications = await prisma.notificationLog.findMany({
    include: {
      user: true,
      booking: {
        include: {
          classEvent: true
        }
      }
    },
    orderBy: { sentAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader
          title="การแจ้งเตือน LINE Official Account"
          description="ตรวจสอบประวัติการส่งข้อความและจัดการรูปแบบข้อความแจ้งเตือนทาง LINE"
        />
        <div className="flex items-center gap-2">
          <Link
            href="/admin/notifications/templates"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#3d3229] rounded-md hover:bg-[#3d3229]/90 transition-all shadow-sm"
          >
            <MessageSquare className="h-3.5 w-3.5 text-amber-400" />
            จัดการเทมเพลตข้อความ
          </Link>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#ddd4c8] gap-4 text-sm">
        <Link
          href="/admin/notifications"
          className="pb-2.5 border-b-2 border-[#3d3229] font-bold text-[#3d3229] flex items-center gap-1.5"
        >
          <History className="h-4 w-4 text-[#8a6d1f]" />
          ประวัติการแจ้งเตือน (Logs)
        </Link>
        <Link
          href="/admin/notifications/templates"
          className="pb-2.5 text-[#6a5d50] hover:text-[#3d3229] flex items-center gap-1.5 transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          เทมเพลตข้อความ LINE (Message Templates)
        </Link>
      </div>

      <section className="border border-[#ddd4c8] bg-white">
        <div className="border-b border-[#ddd4c8] px-5 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-base font-semibold text-[#3d3229]">ประวัติล่าสุด (50 รายการ)</h2>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="h-4 w-4" /> เชื่อมต่อ LINE API แล้ว
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-5 text-[#6a5d50]">เวลาที่ส่ง</TableHead>
                <TableHead className="text-[#6a5d50]">ลูกค้า</TableHead>
                <TableHead className="text-[#6a5d50]">ประเภท</TableHead>
                <TableHead className="text-[#6a5d50]">ข้อความ (บางส่วน)</TableHead>
                <TableHead className="px-5 text-[#6a5d50]">อ้างอิง</TableHead>
                <TableHead className="px-5 text-[#6a5d50] text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="px-5 py-10 text-center text-[#6a5d50]">
                    ยังไม่มีประวัติการแจ้งเตือน
                  </TableCell>
                </TableRow>
              ) : (
                notifications.map((log) => (
                  <TableRow key={log.id} className="border-[#eee8e0] align-top">
                    <TableCell className="px-5 py-3 tabular-nums text-xs whitespace-nowrap">
                      {format(new Date(log.sentAt), "dd/MM/yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="font-medium text-[#3d3229]">{log.user.name}</div>
                      {log.user.lineId ? (
                        <div className="text-[10px] text-green-600 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="h-3 w-3" /> เชื่อมต่อ LINE แล้ว
                        </div>
                      ) : (
                        <div className="text-[10px] text-red-500 flex items-center gap-1 mt-0.5">
                          <XCircle className="h-3 w-3" /> ไม่พบ LINE ID
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="bg-gray-100 text-gray-800 text-[10px] px-2 py-0.5 rounded font-mono">
                        {log.type}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-xs text-[#6a5d50] max-w-xs truncate">
                      {log.message || "-"}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-xs text-[#6a5d50]">
                      {log.booking ? (
                        <div>
                          จอง: <span className="font-mono">{log.booking.id.substring(0, 8)}</span><br/>
                          คอร์ส: {log.booking.classEvent.name}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-right">
                      <RetryNotificationButton notificationId={log.id} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

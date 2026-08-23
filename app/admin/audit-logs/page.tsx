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
import { PAYMENT_STATUS_LABELS } from "@/lib/booking-status";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogs() {
  const reviewLogs = await prisma.paymentReviewLog.findMany({
    include: {
      reviewer: true,
      payment: {
        include: {
          booking: {
            include: {
              classEvent: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <AdminPageHeader
        title="ประวัติการตรวจสอบการชำระเงิน (Audit Logs)"
        description="ตรวจสอบว่าใครเป็นคนเปลี่ยนสถานะการชำระเงินและเมื่อไหร่"
      />

      <section className="border border-[#ddd4c8] bg-white">
        <div className="border-b border-[#ddd4c8] px-5 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-base font-semibold text-[#3d3229]">ประวัติล่าสุด (100 รายการ)</h2>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-5 text-[#6a5d50]">เวลาที่ดำเนินการ</TableHead>
                <TableHead className="text-[#6a5d50]">ผู้ตรวจสอบ (Staff/Admin)</TableHead>
                <TableHead className="text-[#6a5d50]">การเปลี่ยนแปลงสถานะ</TableHead>
                <TableHead className="text-[#6a5d50]">หมายเหตุ</TableHead>
                <TableHead className="px-5 text-[#6a5d50]">อ้างอิง</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviewLogs.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className="px-5 py-10 text-center text-[#6a5d50]">
                    ยังไม่มีประวัติการตรวจสอบ
                  </TableCell>
                </TableRow>
              ) : (
                reviewLogs.map((log) => (
                  <TableRow key={log.id} className="border-[#eee8e0] align-top">
                    <TableCell className="px-5 py-3 tabular-nums text-xs whitespace-nowrap">
                      {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss")}
                    </TableCell>
                    <TableCell className="py-3 font-medium text-[#3d3229]">
                      {log.reviewer.name}
                    </TableCell>
                    <TableCell className="py-3 text-xs">
                      จาก <span className="bg-gray-100 px-1 py-0.5 rounded border">{PAYMENT_STATUS_LABELS[log.previousStatus as keyof typeof PAYMENT_STATUS_LABELS] || log.previousStatus}</span><br/>
                      เป็น <span className="bg-blue-50 text-blue-700 px-1 py-0.5 rounded border border-blue-200 mt-1 inline-block">{PAYMENT_STATUS_LABELS[log.newStatus as keyof typeof PAYMENT_STATUS_LABELS] || log.newStatus}</span>
                    </TableCell>
                    <TableCell className="py-3 text-xs text-[#8f3b2c] italic">
                      {log.reason || "-"}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-xs text-[#6a5d50]">
                      {log.payment.booking ? (
                        <div>
                          จอง: <span className="font-mono">{log.payment.booking.id.substring(0, 8)}</span><br/>
                          คอร์ส: {log.payment.booking.classEvent.name}
                        </div>
                      ) : (
                        "Booking Group"
                      )}
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

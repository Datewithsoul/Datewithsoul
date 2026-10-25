import { prisma } from "@/lib/prisma";
import { checkAdmin } from "@/lib/require-admin";
import { BookingStatus } from "@/app/generated/prisma";
import { adminCheckFailure, csvResponse, toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

const HTTP_NOT_FOUND = 404;

const HEADER = ["ลำดับ", "ชื่อ LINE", "ชื่อ-นามสกุล", "เบอร์โทร", "ที่นั่ง", "เข้าเรียนแล้ว", "หมายเหตุการจอง"];

// The paid participants of one class round, matching /admin/attendance/[id]
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await checkAdmin();
  if (!auth.ok) return adminCheckFailure(auth.reason);

  const { id } = await params;
  const classEvent = await prisma.classEvent.findUnique({
    where: { id },
    include: {
      bookings: {
        where: { status: BookingStatus.CONFIRMED },
        include: { user: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!classEvent) return new Response("Not found", { status: HTTP_NOT_FOUND });

  const rows = classEvent.bookings.map((b, i) => [
    i + 1,
    b.user.lineName ?? "",
    b.user.name,
    b.user.phone ?? "",
    b.seats,
    b.attended ? "ใช่" : "",
    b.note ?? "",
  ]);

  const date = classEvent.date.toISOString().slice(0, "yyyy-mm-dd".length);
  return csvResponse(`attendance-${date}-${classEvent.startTime.replace(":", "")}.csv`, toCsv(HEADER, rows));
}

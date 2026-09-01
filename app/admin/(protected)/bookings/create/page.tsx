import { prisma } from "@/lib/prisma";
import { AdminCreateBookingForm } from "@/components/admin-create-booking-form";
import { AdminPageHeader } from "@/components/admin-page-header";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CreateBookingPage() {
  const [classEvents, users] = await Promise.all([
    prisma.classEvent.findMany({
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      select: {
        id: true,
        name: true,
        date: true,
        startTime: true,
        endTime: true,
        totalSeats: true,
      },
    }),
    prisma.user.findMany({
      select: { id: true, name: true, phone: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/bookings">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <AdminPageHeader
          title="สร้างการจองใหม่"
          description="สำหรับแอดมินสร้างการจองแทนลูกค้า"
        />
      </div>

      <div className="border border-[#ddd4c8] bg-white shadow-sm rounded-xl p-6">
        <AdminCreateBookingForm users={users} classEvents={classEvents} />
      </div>
    </div>
  );
}

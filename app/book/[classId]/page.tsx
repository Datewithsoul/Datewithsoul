import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, AlertCircle } from "lucide-react";
import { submitBooking } from "./actions";
import { createClient } from "@/utils/supabase/server";

import Navbar from "@/components/navbar";
import BookingForm from "@/components/booking-form";

import ScheduleSelector from "@/app/classes/[id]/schedule-selector";

function redirectWithError(message: string): never {
  const params = new URLSearchParams({ error: message });
  redirect(`/login?${params.toString()}`);
}

export default async function BookClassPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ classId: string }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { classId } = await params;
  const resolvedSearchParams = await searchParams;
  const errorMessage = typeof resolvedSearchParams?.error === "string" ? resolvedSearchParams.error : null;

  const classEvent = await prisma.classEvent.findUnique({
    where: { id: classId },
  });

  if (!classEvent) {
    return notFound();
  }

  const now = new Date();
  const relatedClassEventsData = await prisma.classEvent.findMany({
    where: { 
      name: classEvent.name,
      OR: [
        { date: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } },
        { id: classEvent.id }
      ]
    },
    include: {
      bookings: {
        where: {
          status: { not: "CANCELLED" }
        }
      }
    },
    orderBy: [
      { date: 'asc' },
      { startTime: 'asc' }
    ]
  });

  const relatedClassEvents = relatedClassEventsData.map(ce => {
    const bookedSeats = ce.bookings.reduce((sum, b) => sum + b.seats, 0);
    return {
      id: ce.id,
      date: ce.date,
      endDate: ce.endDate,
      startTime: ce.startTime,
      endTime: ce.endTime,
      totalSeats: ce.totalSeats,
      maxSeats: ce.totalSeats + bookedSeats
    };
  });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirectWithError("กรุณาเข้าสู่ระบบก่อนทำการจอง");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans pb-24">
      <Navbar />

      <section className="pt-12 px-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8 border-b border-gray-200 pb-4">
          <Link 
            href={`/classes/${classEvent.id}`}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-[#222222]" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            ยืนยันการจอง
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Class Details */}
          <div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 h-fit">
              <h2 className="text-2xl font-semibold mb-6">{classEvent.name}</h2>
              <div className="flex flex-col gap-4 text-[#222222]">
                <ScheduleSelector 
                  currentId={classEvent.id} 
                  schedules={relatedClassEvents} 
                  baseUrl="/book"
                />
                <div className="flex justify-between border-b border-gray-200 pb-3 mt-4">
                  <span className="text-gray-600">ราคาต่อที่นั่ง</span>
                  <span className="font-semibold text-[#F44336]">฿{classEvent.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mt-2 text-xl font-bold">
                  <span>รวมทั้งสิ้น</span>
                  <span className="text-[#F44336]">฿{classEvent.price.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <h2 className="text-xl font-semibold mb-6">ข้อมูลผู้จอง</h2>
            
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 font-semibold flex items-center gap-2 text-sm">
                <AlertCircle size={18} />
                {errorMessage}
              </div>
            )}
            <BookingForm 
              classEventId={classEvent.id}
              pricePerSeat={classEvent.price}
              totalAvailableSeats={classEvent.totalSeats}
              defaultName={dbUser?.name || ""}
              defaultEmail={user.email || ""}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

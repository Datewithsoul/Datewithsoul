import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import { BookingStatus } from "@/app/generated/prisma";
import CancelBookingButton from "@/components/cancel-booking-button";

export default async function BookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  if (!dbUser) {
    redirect("/login");
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: dbUser.id },
    include: {
      classEvent: {
        include: {
          media: {
            take: 1,
            orderBy: { order: 'asc' }
          }
        }
      },
      payment: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans">
      <Navbar />
      
      <main className="max-w-[1000px] mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">ประวัติการจองของฉัน</h1>
        
        {bookings.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center">
            <h2 className="text-xl font-semibold mb-2">ยังไม่มีประวัติการจอง</h2>
            <p className="text-gray-500 mb-6">เริ่มค้นหาและจองคลาสเรียนที่คุณสนใจได้เลย</p>
            <Link 
              href="/classes" 
              className="inline-block bg-[#F44336] text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600 transition-colors"
            >
              ดูคลาสเรียนทั้งหมด
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {bookings.map(booking => {
              const c = booking.classEvent;
              const statusStyles: Record<string, { text: string; color: string }> = {
                [BookingStatus.PENDING_PAYMENT]: { text: "กำลังจอง", color: "bg-gray-100 text-gray-800" },
                [BookingStatus.PENDING_PAYMENT]: { text: "กำลังชำระเงิน", color: "bg-orange-100 text-orange-800" },
                [BookingStatus.PAYMENT_REVIEW]: { text: "การตรวจสอบชำระเงิน", color: "bg-yellow-100 text-yellow-800" },
                [BookingStatus.CONFIRMED]: { text: "ชำระเงินแล้ว", color: "bg-green-100 text-green-800" },
                [BookingStatus.CANCELLED]: { text: "ยกเลิกแล้ว", color: "bg-red-100 text-red-800" },
              };
              const { text: statusText, color: statusColor } = statusStyles[booking.status] ?? {
                text: "กำลังจอง",
                color: "bg-yellow-100 text-yellow-800",
              };

              return (
                <div key={booking.id} className="border border-gray-200 rounded-2xl overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-shadow">
                  {/* Image */}
                  <div className="sm:w-64 h-48 sm:h-auto bg-gray-100 shrink-0">
                    {c.media && c.media.length > 0 ? (
                      <img src={c.media[0].url} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">ไม่มีรูปภาพ</div>
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <Link href={`/classes/${c.id}`}>
                        <h3 className="text-xl font-bold hover:underline">{c.name}</h3>
                      </Link>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                        {statusText}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{c.date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{c.startTime} - {c.endTime}</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">รหัสการจอง: {booking.id.split('-')[0].toUpperCase()}</span>
                        <span className="font-semibold">{booking.seats} ที่นั่ง · ฿{booking.totalPrice.toLocaleString()}</span>
                      </div>
                      
                        {(booking.status === BookingStatus.PENDING_PAYMENT || booking.status === BookingStatus.PENDING_PAYMENT) && (
                          <div className="flex items-center gap-2">
                            <CancelBookingButton bookingId={booking.id} />
                            <Link 
                              href={`/payment/${booking.id}`}
                              className="bg-[#222222] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-black transition-colors"
                            >
                              ชำระเงิน
                            </Link>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

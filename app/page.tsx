import Link from "next/link";
import { Search, Heart, LogOut, User as UserIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { logout } from "./login/actions";
import Navbar from "@/components/navbar";
import ClassCalendar from "@/components/class-calendar";
import { getClassesForMonth } from "@/app/actions/calendar";
export default async function Home() {
  const upcomingClasses = await prisma.classEvent.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    take: 8,
    include: {
      media: {
        where: { type: 'IMAGE' },
        orderBy: { order: 'asc' },
        take: 1
      }
    }
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const calendarRes = await getClassesForMonth(currentYear, currentMonth);
  const initialCalendarClasses = calendarRes.classes || [];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let dbUser = null;
  let recentBookings: any[] = [];
  let upcomingUserClasses: any[] = [];
  
  if (user) {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });
    
    if (dbUser) {
      recentBookings = await prisma.booking.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { classEvent: { include: { media: { where: { type: 'IMAGE' }, take: 1 } } } }
      });
      
      upcomingUserClasses = await prisma.booking.findMany({
        where: { 
          userId: dbUser.id,
          classEvent: { date: { gte: new Date() } },
          status: { in: ['CONFIRMED', 'PENDING'] }
        },
        orderBy: { classEvent: { date: 'asc' } },
        take: 4,
        include: { classEvent: { include: { media: { where: { type: 'IMAGE' }, take: 1 } } } }
      });
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#1c1d1f] font-sans overflow-x-hidden">
      <Navbar />

      {/* Pop Art Class Calendar Section */}
      <ClassCalendar 
        initialClasses={initialCalendarClasses} 
        initialYear={currentYear} 
        initialMonth={currentMonth} 
      />

      {/* User Dashboard Section */}
      {dbUser && (
        <section className="max-w-[1340px] mx-auto px-6 py-8 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
              {dbUser.image ? <img src={dbUser.image} alt={dbUser.name} className="w-full h-full object-cover" /> : <UserIcon size={20} className="text-gray-500" />}
            </div>
            <h2 className="text-2xl font-bold">สวัสดี, {dbUser.name} 👋</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Classes */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#1c1d1f]">คลาสที่กำลังจะมาถึง</h3>
                <Link href="/bookings" className="text-sm font-bold text-[#F44336] hover:underline">ประวัติทั้งหมด</Link>
              </div>
              
              {upcomingUserClasses.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center flex flex-col items-center justify-center">
                  <p className="text-gray-500 mb-4">คุณยังไม่มีคลาสเรียนที่กำลังจะมาถึง</p>
                  <Link href="/classes" className="inline-block border border-gray-300 bg-white font-bold px-6 py-2 rounded-full hover:bg-gray-50 transition-colors">
                    ค้นหาคลาสเรียน
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {upcomingUserClasses.map(booking => {
                    const classDate = new Date(booking.classEvent.date);
                    return (
                      <div key={booking.id} className="flex gap-4 p-4 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors group">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                          {booking.classEvent.media && booking.classEvent.media.length > 0 ? (
                            <img src={booking.classEvent.media[0].url} alt={booking.classEvent.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-bold">No Image</div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center overflow-hidden">
                          <h4 className="font-bold text-[#1c1d1f] line-clamp-2 md:text-lg mb-1 group-hover:text-[#F44336] transition-colors">{booking.classEvent.name}</h4>
                          <p className="text-sm text-gray-600 line-clamp-1 mb-1">{classDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          <p className="text-sm font-bold text-[#F44336]">{booking.classEvent.startTime} - {booking.classEvent.endTime}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Recent Bookings */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#1c1d1f]">รายการจองล่าสุด</h3>
              </div>
              
              {recentBookings.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center h-[120px] flex items-center justify-center">
                  <p className="text-gray-500">ไม่มีประวัติการจอง</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentBookings.map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col truncate pr-4">
                        <span className="font-bold text-sm truncate text-[#1c1d1f] mb-1">{booking.classEvent.name}</span>
                        <span className="text-xs text-gray-500">{new Date(booking.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })} • {booking.seats} ที่นั่ง</span>
                      </div>
                      <div className="shrink-0">
                        {booking.status === 'CONFIRMED' && <span className="bg-green-100 border border-green-200 text-green-700 px-3 py-1 rounded-full text-xs font-bold">สำเร็จ</span>}
                        {booking.status === 'PENDING' && <span className="bg-yellow-100 border border-yellow-200 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">รอชำระเงิน</span>}
                        {booking.status === 'CANCELLED' && <span className="bg-gray-200 border border-gray-300 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">ยกเลิก</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Course Carousel Section */}
      <section className="max-w-[1340px] mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-6">คอร์สเรียนแนะนำสำหรับคุณ</h2>
        
        {upcomingClasses.length === 0 ? (
          <div className="text-center p-12 border border-gray-200 bg-gray-50">
            <p className="text-lg text-gray-600">ยังไม่มีคลาสเรียนแนะนำในขณะนี้</p>
          </div>
        ) : (
          <div className="relative px-12">
            <Carousel opts={{ align: "start" }} className="w-full">
              <CarouselContent className="-ml-4">
                {upcomingClasses.map((c) => (
                  <CarouselItem key={c.id} className="pl-4 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                    <Link href={`/classes/${c.id}`} className="group block">
                      <div className="flex flex-col h-full">
                        <div className="bg-gray-200 aspect-video mb-3 overflow-hidden border border-gray-200 group-hover:opacity-90 transition-opacity">
                          {c.media && c.media.length > 0 ? (
                            <img src={c.media[0].url} alt={c.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-sm">
                              No Image
                            </div>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-[#1c1d1f] line-clamp-2 leading-tight mb-1 group-hover:text-[#F44336]">
                          {c.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-1">{c.instructor || "ไม่ระบุผู้สอน"}</p>
                        <p className="text-sm font-bold text-[#1c1d1f] mb-1">
                          ฿{c.price.toLocaleString()}
                        </p>
                        {c.totalSeats <= 3 && c.totalSeats > 0 && (
                          <div className="inline-block bg-[#F44336]/10 text-[#F44336] text-xs font-bold px-2 py-1 mt-1">
                            เหลือเพียง {c.totalSeats} ที่นั่ง
                          </div>
                        )}
                        {c.totalSeats === 0 && (
                          <div className="inline-block bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 mt-1">
                            เต็มแล้ว
                          </div>
                        )}
                      </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        )}
      </section>

      {/* Categories/Features */}
      <section className="max-w-[1340px] mx-auto px-6 py-12 mb-12">
        <h2 className="text-2xl font-bold mb-6">เรียนรู้ทักษะใหม่ๆ กับเรา</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 border border-gray-200 p-6 flex flex-col items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer">
            <span className="font-bold text-[#1c1d1f]">ปั้นดินเผาพื้นฐาน</span>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-6 flex flex-col items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer">
            <span className="font-bold text-[#1c1d1f]">ศิลปะบำบัด</span>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-6 flex flex-col items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer">
            <span className="font-bold text-[#1c1d1f]">เซรามิกประยุกต์</span>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-6 flex flex-col items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer">
            <span className="font-bold text-[#1c1d1f]">Workshop พิเศษ</span>
          </div>
        </div>
      </section>

    </div>
  );
}

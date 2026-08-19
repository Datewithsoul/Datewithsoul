import Link from "next/link";
import { Search, Heart, LogOut, User as UserIcon, Calendar, Inbox } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { logout } from "./login/actions";
import Navbar from "@/components/navbar";
import ClassCalendar from "@/components/class-calendar";
import { getClassesForMonth } from "@/app/actions/calendar";
import { BookingStatus } from "@/app/generated/prisma";
export default async function Home() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rawUpcomingClasses = await prisma.classEvent.findMany({
    where: { date: { gte: today } },
    orderBy: { date: "asc" },
    include: {
      media: {
        where: { type: 'IMAGE' },
        orderBy: { order: 'asc' },
        take: 1
      },
      bookings: {
        where: {
          status: { notIn: [BookingStatus.CANCELLED] }
        },
        select: { seats: true }
      }
    }
  });

  const seenNames = new Set();
  const upcomingClasses = [];
  for (const c of rawUpcomingClasses) {
    if (!seenNames.has(c.name)) {
      seenNames.add(c.name);
      upcomingClasses.push(c);
      if (upcomingClasses.length >= 8) break; // keep the take 8 limit
    }
  }

  const categoryRecords = await prisma.classEvent.findMany({
    select: { category: true },
    distinct: ['category'],
    where: { category: { not: null } }
  });
  const categories = categoryRecords.map(c => c.category).filter(Boolean) as string[];

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
          classEvent: { date: { gte: today } },
          status: { in: [BookingStatus.BOOKING, BookingStatus.AWAITING_PAYMENT, BookingStatus.PAYMENT_REVIEW, BookingStatus.PAID] }
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
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FFC107]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-gray-100 animate-bounce relative z-10">
                    <Calendar size={28} className="text-gray-400 group-hover:text-[#F44336] transition-colors" />
                  </div>
                  <p className="text-gray-500 mb-5 font-medium relative z-10">คุณยังไม่มีคลาสเรียนที่กำลังจะมาถึง</p>
                  <Link href="/classes" className="relative z-10 inline-block border border-gray-200 bg-white font-bold px-6 py-2.5 rounded-full shadow-sm hover:shadow-md hover:border-[#F44336] hover:-translate-y-0.5 transition-all duration-300 active:scale-95 text-[#1c1d1f] hover:text-[#F44336]">
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
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center h-[160px] flex flex-col items-center justify-center group overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-gray-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="mb-3 relative z-10">
                    <Inbox size={32} className="text-gray-300 group-hover:text-gray-400 group-hover:scale-110 transition-all duration-500" />
                  </div>
                  <p className="text-gray-400 font-medium relative z-10">ไม่มีประวัติการจอง</p>
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
                        {booking.status === BookingStatus.BOOKING && <span className="bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">กำลังจอง</span>}
                        {booking.status === BookingStatus.AWAITING_PAYMENT && <span className="bg-yellow-100 border border-yellow-200 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">กำลังชำระเงิน</span>}
                        {booking.status === BookingStatus.PAYMENT_REVIEW && <span className="bg-orange-100 border border-orange-200 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">การตรวจสอบชำระเงิน</span>}
                        {booking.status === BookingStatus.PAID && <span className="bg-green-100 border border-green-200 text-green-700 px-3 py-1 rounded-full text-xs font-bold">ชำระเงินแล้ว</span>}
                        {booking.status === BookingStatus.CANCELLED && <span className="bg-gray-200 border border-gray-300 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">ยกเลิก</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Course Carousel Section grouped by category */}
      <section className="max-w-[1340px] mx-auto px-6 py-8 flex flex-col gap-12">
        {upcomingClasses.length === 0 ? (
          <div>
            <h2 className="text-2xl font-bold mb-6">คอร์สเรียนแนะนำสำหรับคุณ</h2>
            <div className="text-center p-12 border border-gray-200 bg-gray-50 rounded-2xl">
              <p className="text-lg text-gray-600">ยังไม่มีคลาสเรียนแนะนำในขณะนี้</p>
            </div>
          </div>
        ) : (
          Object.entries(
            upcomingClasses.reduce((acc, c) => {
              const cat = c.category || "เวิร์กชอป";
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(c);
              return acc;
            }, {} as Record<string, typeof upcomingClasses>)
          ).map(([category, classes]) => (
            <div key={category}>
              <h2 className="text-2xl font-bold mb-6">{category}</h2>
              <div className="relative px-12">
                <Carousel opts={{ align: "start" }} className="w-full">
                  <CarouselContent className="-ml-4">
                    {classes.map((c) => {
                      const bookedSeats = c.bookings.reduce((sum, b) => sum + b.seats, 0);
                      const totalCapacity = c.totalSeats + bookedSeats;

                      return (
                        <CarouselItem key={c.id} className="pl-4 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                          <Link href={`/classes/${c.id}`} className="block h-full">
                            <div className="bg-white rounded-2xl overflow-hidden flex flex-col h-full shadow-sm border border-gray-100">
                              <div className="relative aspect-video overflow-hidden bg-gray-100">
                                {c.media && c.media.length > 0 ? (
                                  <img src={c.media[0].url} alt={c.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium text-xs">
                                    ไม่มีรูปภาพ
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col flex-1 p-4">
                                <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                                  {c.totalSeats > 0 ? (
                                    <span className="bg-green-50 text-green-700 text-[9px] font-semibold px-2 py-0.5 rounded-full border border-green-200">
                                      เปิดรับสมัคร
                                    </span>
                                  ) : (
                                    <span className="bg-gray-100 text-gray-600 text-[9px] font-semibold px-2 py-0.5 rounded-full border border-gray-200">
                                      เต็มแล้ว
                                    </span>
                                  )}
                                  <span className="bg-blue-50 text-blue-700 text-[9px] font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                                    {c.category || "เวิร์กชอป"}
                                  </span>
                                </div>

                                <h3 className="font-bold text-sm md:text-base text-gray-900 leading-snug mb-1 line-clamp-2">
                                  {c.name}
                                </h3>
                                
                                {c.instructor && c.instructor !== "ไม่ระบุผู้สอน" && (
                                  <p className="text-gray-500 text-xs mb-3">
                                    ผู้สอน: {c.instructor}
                                  </p>
                                )}

                                <div className="mt-auto pt-3 border-t border-gray-100 flex flex-col gap-2">
                                  <div className="flex justify-between items-start text-xs">
                                    <div className="flex items-start gap-1">
                                      <Calendar className="w-3 h-3 shrink-0 mt-0.5 text-gray-400" />
                                      <div className="flex flex-col">
                                        <span className="font-medium text-gray-900">
                                          {c.date ? new Date(c.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }) : ''}
                                          {c.endDate && new Date(c.endDate).getTime() !== new Date(c.date).getTime() && (
                                            <> - {new Date(c.endDate).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}</>
                                          )}
                                        </span>
                                        <span className="text-[9px] text-gray-500 mt-0.5">
                                          {c.startTime} - {c.endTime}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                      <span className={c.totalSeats > 0 ? "text-green-600 font-medium text-[9px] bg-green-50 px-1.5 py-0.5 rounded border border-green-100" : "text-gray-500 font-medium text-[9px] bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200"}>
                                        จองแล้ว {bookedSeats}/{totalCapacity}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="font-bold text-lg text-gray-900">
                                    ฿{c.price.toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                  <CarouselPrevious className="hidden md:flex" />
                  <CarouselNext className="hidden md:flex" />
                </Carousel>
              </div>
            </div>
          ))
        )}
      </section>



    </div>
  );
}

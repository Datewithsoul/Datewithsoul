import Link from "next/link";
import { Search, Heart, LogOut, User as UserIcon, Calendar, Inbox } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { BookingStatus } from "@/app/generated/prisma";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { logout } from "./login/actions";
import Navbar from "@/components/navbar";
import ClassCalendar from "@/components/class-calendar";

function ClassCarousel({ classes }: { classes: any[] }) {
  if (!classes || classes.length === 0) return null;

  // Group classes by name
  const groupedMap = new Map<string, any>();
  for (const c of classes) {
    if (!groupedMap.has(c.name)) {
      const booked = c.bookings.reduce((sum: number, b: any) => sum + b.seats, 0);
      groupedMap.set(c.name, {
        ...c,
        allSchedules: [c],
        totalBookedSeats: booked,
        totalMaxSeats: c.totalSeats + booked,
        anyAvailable: c.totalSeats > 0,
        anyCompleted: c.status === "COMPLETED"
      });
    } else {
      const existing = groupedMap.get(c.name);
      existing.allSchedules.push(c);
      const booked = c.bookings.reduce((sum: number, b: any) => sum + b.seats, 0);
      existing.totalBookedSeats += booked;
      existing.totalMaxSeats += (c.totalSeats + booked);
      if (c.totalSeats > 0) existing.anyAvailable = true;
      if (c.status !== "COMPLETED") existing.anyCompleted = false;
    }
  }

  const groupedClasses = Array.from(groupedMap.values());

  return (
    <Carousel opts={{ align: "start" }} className="w-full">
      <CarouselContent className="-ml-4">
        {groupedClasses.map((c) => {
          // Format combined dates
          const dateStrs = Array.from(new Set(c.allSchedules.map((sch: any) => {
            const d = new Date(sch.date);
            let str = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
            if (sch.endDate && new Date(sch.endDate).getTime() !== d.getTime()) {
              const ed = new Date(sch.endDate);
              str += `-${ed.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}`;
            }
            return str;
          })));

          // Format combined times
          const timeStrs = Array.from(new Set(c.allSchedules.map((sch: any) => `${sch.startTime}-${sch.endTime}`)));

          return (
            <CarouselItem key={c.id} className="pl-4 basis-[60%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
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
                      {c.anyCompleted ? (
                        <span className="bg-gray-100 text-gray-600 text-[9px] font-semibold px-2 py-0.5 rounded-full border border-gray-200">
                          ปิดรับสมัคร
                        </span>
                      ) : c.anyAvailable ? (
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
                        <div className="flex items-start gap-1 w-2/3 pr-2">
                          <Calendar className="w-3 h-3 shrink-0 mt-0.5 text-gray-400" />
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 leading-tight">
                              {dateStrs.join(', ')}
                            </span>
                            <span className="text-[9px] text-gray-500 mt-0.5 leading-tight">
                              {timeStrs.join(', ')}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end shrink-0">
                          <span className={c.anyAvailable ? "text-green-600 font-medium text-[9px] bg-green-50 px-1.5 py-0.5 rounded border border-green-100" : "text-gray-500 font-medium text-[9px] bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200"}>
                            จองแล้ว {c.totalBookedSeats}/{c.totalMaxSeats}
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
  );
}
import { getClassesForMonth } from "@/app/actions/calendar";

export default async function Home() {
  // Calculate dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(today);
  const day = endOfWeek.getDay(); // 0 is Sunday
  const diff = endOfWeek.getDate() - day + (day === 0 ? 0 : 7); // end of week is next Sunday or today if Sunday
  endOfWeek.setDate(diff);
  endOfWeek.setHours(23, 59, 59, 999);

  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

  const baseInclude = {
    media: {
       where: { type: 'IMAGE' as const },
       orderBy: { order: 'asc' as const },
      take: 1
    },
    bookings: {
      where: {
         status: { notIn: [BookingStatus.CANCELLED] }
      },
      select: { seats: true }
    }
   };

  // Fetch This Week Classes
  let thisWeekClasses: any[] = [];
  try {
    thisWeekClasses = await prisma.classEvent.findMany({
      where: { 
        date: { gte: today, lte: endOfWeek },
        status: { not: "CANCELLED" }
      },
      orderBy: { date: "asc" },
      include: baseInclude
    });
  } catch (err: any) {
    console.error("DEBUG PRISMA ERROR:", err.message);
    throw err;
  }

  // Fetch This Month Classes
  const thisMonthClasses = await prisma.classEvent.findMany({
    where: { 
      date: { gte: today, lte: endOfMonth },
      status: { not: "CANCELLED" }
    },
    orderBy: { date: "asc" },
    include: baseInclude
  });

  // Fetch Popular (Almost Full)
  const popularClasses = await prisma.classEvent.findMany({
    where: { 
      date: { gte: today },
      status: { not: "CANCELLED" },
      totalSeats: { lte: 3, gt: 0 } // Only 1-3 seats remaining
    },
    orderBy: { totalSeats: "asc" },
    take: 8,
    include: baseInclude
  });

  // Fetch upcoming classes for category grouping
  const rawUpcomingClasses = await prisma.classEvent.findMany({
    where: { date: { gte: today }, status: { not: "CANCELLED" } },
    orderBy: { date: "asc" },
    include: baseInclude
  });

  const seenNames = new Set();
  const upcomingClasses = [];
  for (const c of rawUpcomingClasses) {
    if (!seenNames.has(c.name)) {
      seenNames.add(c.name);
      upcomingClasses.push(c);
      if (upcomingClasses.length >= 12) break; // Increase limit to 12 for categories
    }
  }

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
          status: { in: ["PENDING_PAYMENT", "PAYMENT_REVIEW", "CONFIRMED"] }
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
                        {booking.status === "PENDING_PAYMENT" && <span className="bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">กำลังจอง</span>}
                        {booking.status === "PENDING_PAYMENT" && <span className="bg-yellow-100 border border-yellow-200 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">กำลังชำระเงิน</span>}
                        {booking.status === "PAYMENT_REVIEW" && <span className="bg-orange-100 border border-orange-200 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">การตรวจสอบชำระเงิน</span>}
                        {booking.status === "CONFIRMED" && <span className="bg-green-100 border border-green-200 text-green-700 px-3 py-1 rounded-full text-xs font-bold">ชำระเงินแล้ว</span>}
                        {booking.status === "CANCELLED" && <span className="bg-gray-200 border border-gray-300 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">ยกเลิก</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Course Carousel Sections */}
      <section className="max-w-[1340px] mx-auto px-6 py-8 flex flex-col gap-12">
        
        {/* Popular / Almost Full */}
        {popularClasses.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-[#F44336]">🔥 รายการยอดนิยม (ใกล้เต็มแล้ว รีบจองเลย!)</h2>
            </div>
            <div className="relative px-12">
              <ClassCarousel classes={popularClasses} />
            </div>
          </div>
        )}

        {/* This Week */}
        {thisWeekClasses.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">📅 รายการสอนสัปดาห์นี้</h2>
            <div className="relative px-12">
              <ClassCarousel classes={thisWeekClasses} />
            </div>
          </div>
        )}

        {/* This Month */}
        {thisMonthClasses.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">🗓️ รายการสอนเดือนนี้</h2>
            <div className="relative px-12">
              <ClassCarousel classes={thisMonthClasses} />
            </div>
          </div>
        )}

        {/* Grouped by Category */}
        {upcomingClasses.length > 0 && (
          <div className="pt-8 border-t border-gray-100 mt-4 flex flex-col gap-12">
            {Object.entries(
              upcomingClasses.reduce((acc, c) => {
                const cat = c.category || "เวิร์กชอป";
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(c);
                return acc;
              }, {} as Record<string, typeof upcomingClasses>)
            ).map(([category, classes]) => (
              <div key={category}>
                <h2 className="text-2xl font-bold mb-6">🏷️ หมวดหมู่: {category}</h2>
                <div className="relative px-12">
                  <ClassCarousel classes={classes} />
                </div>
              </div>
            ))}
          </div>
        )}

      </section>
    </div>
  );
}

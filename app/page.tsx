import Link from "next/link";
import { ArrowRight, CalendarDays, Heart, LogOut, User as UserIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { logout } from "./login/actions";

export default async function Home() {
  const upcomingClasses = await prisma.classEvent.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    take: 8,
  });

  const recentBookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
    include: { classEvent: true, user: true },
  });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let dbUser = null;
  if (user) {
    dbUser = await prisma.user.findUnique({
      where: { email: user.email! }
    });
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#5D4037] font-sans overflow-x-hidden">
      {/* Header */}
      <header className="border-b-4 border-[#5D4037] bg-[#FFEB3B] py-4 px-8 sticky top-0 z-50 shadow-[0_4px_0_0_#5D4037]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#F44336] p-2 rounded-full border-2 border-[#5D4037] shadow-[2px_2px_0_0_#5D4037]">
              <Heart className="text-white" size={24} fill="currentColor" />
            </div>
            <span className="text-2xl font-black tracking-widest uppercase hidden md:inline">Date With Soul</span>
          </div>
          <nav className="flex items-center gap-6 font-bold uppercase tracking-wider text-sm">
            <Link href="/" className="hover:text-[#F44336] transition-colors hidden sm:block">หน้าแรก</Link>
            <Link href="/classes" className="hover:text-[#F44336] transition-colors hidden sm:block">คลาสเรียน</Link>
            
            {dbUser?.role === 'ADMIN' && (
              <Link href="/admin" className="text-[#F44336] hover:text-[#5D4037] transition-colors hidden sm:block">
                ระบบจัดการ (Admin)
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-4 ml-4 pl-4 border-l-4 border-[#5D4037]/20">
                <div className="flex items-center gap-2">
                  <UserIcon size={18} />
                  <span className="truncate max-w-[100px] sm:max-w-[150px]">{user.email}</span>
                </div>
                <form action={logout}>
                  <button type="submit" className="flex items-center gap-1 text-[#F44336] hover:text-[#5D4037]">
                    <LogOut size={18} /> ออกจากระบบ
                  </button>
                </form>
              </div>
            ) : (
              <Link href="/login" className="bg-white px-4 py-2 border-2 border-[#5D4037] rounded-lg shadow-[2px_2px_0_0_#5D4037] hover:translate-y-1 hover:shadow-none transition-all">
                เข้าสู่ระบบ / สมัครสมาชิก
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-8 overflow-hidden bg-[url('/dot-pattern.png')] bg-repeat">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-8 relative z-10">
          <div className="inline-block bg-[#F44336] text-white font-bold tracking-widest py-2 px-6 rounded-full border-4 border-[#5D4037] shadow-[4px_4px_0_0_#5D4037] rotate-[-2deg]">
            เวิร์กชอปใหม่พร้อมให้บริการแล้ว!
          </div>
          <h1 className="text-5xl md:text-8xl font-black leading-tight tracking-tight drop-shadow-[4px_4px_0_rgba(244,67,54,1)] text-[#FFEB3B] stroke-text">
            ค้นหาจิตวิญญาณ <br/> นักสร้างสรรค์ในตัวคุณ
          </h1>
          <p className="text-lg md:text-2xl font-bold max-w-2xl bg-white p-6 border-4 border-[#5D4037] shadow-[6px_6px_0_0_#5D4037] rounded-2xl rotate-[1deg] leading-relaxed">
            เข้าร่วมเวิร์กชอปปั้นดินเผาและศิลปะของเรา พักผ่อน สร้างสรรค์ผลงาน และเชื่อมต่อกับผู้คนที่มีความสนใจเหมือนกัน ในพื้นที่ที่อบอุ่นและเป็นกันเอง
          </p>
          <Link 
            href="/classes"
            className="mt-4 flex items-center gap-3 bg-[#FFEB3B] text-[#5D4037] text-2xl font-black tracking-widest px-10 py-5 rounded-2xl border-4 border-[#5D4037] shadow-[8px_8px_0_0_#5D4037] hover:translate-y-2 hover:shadow-[2px_2px_0_0_#5D4037] transition-all"
          >
            <CalendarDays size={28} />
            จองคลาสเรียน
            <ArrowRight size={28} />
          </Link>
        </div>
      </section>

      {/* Recommended Classes (Carousel) */}
      <section className="py-24 px-8 bg-[#FFEB3B] border-y-4 border-[#5D4037]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight drop-shadow-[2px_2px_0_rgba(255,255,255,1)]">
              คอร์สเรียนแนะนำ
            </h2>
            <Link href="/classes" className="font-bold tracking-widest border-b-4 border-[#5D4037] pb-1 hover:text-[#F44336] transition-colors">
              ดูทั้งหมด
            </Link>
          </div>

          {upcomingClasses.length === 0 ? (
            <div className="text-center p-12 border-4 border-[#5D4037] border-dashed rounded-3xl bg-white">
              <p className="text-xl font-bold">ยังไม่มีคลาสเรียนแนะนำในขณะนี้</p>
            </div>
          ) : (
            <div className="relative px-12">
              <Carousel opts={{ align: "start", loop: true }} className="w-full">
                <CarouselContent className="-ml-4">
                  {upcomingClasses.map((c) => (
                    <CarouselItem key={c.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                      <div className="bg-white border-4 border-[#5D4037] rounded-3xl p-6 shadow-[8px_8px_0_0_#5D4037] flex flex-col gap-4 h-full">
                        <div className="bg-[#FFEB3B] border-4 border-[#5D4037] rounded-2xl h-48 flex items-center justify-center font-black text-3xl text-[#5D4037]/20 overflow-hidden relative">
                          {c.imageUrl ? (
                            <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                          ) : (
                            "รูปภาพคอร์ส"
                          )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-black line-clamp-1">{c.name}</h3>
                          <p className="text-[#F44336] font-bold text-xl">฿{c.price.toLocaleString()}</p>
                        </div>
                        <div className="flex flex-col gap-2 font-bold text-sm bg-gray-50 p-4 border-2 border-[#5D4037] rounded-xl flex-1">
                          <div className="flex justify-between">
                            <span>วันที่:</span>
                            <span>{c.date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>ที่นั่ง:</span>
                            <span className="text-[#F44336]">ว่าง {c.totalSeats}</span>
                          </div>
                        </div>
                        <Link 
                          href={`/classes/${c.id}`}
                          className="mt-2 w-full text-center bg-[#F44336] text-white font-black tracking-widest py-3 border-4 border-[#5D4037] rounded-xl shadow-[4px_4px_0_0_#5D4037] hover:bg-[#FFEB3B] hover:text-[#5D4037] hover:translate-y-1 hover:shadow-[2px_2px_0_0_#5D4037] transition-all"
                        >
                          ดูรายละเอียด
                        </Link>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2 border-4 border-[#5D4037] bg-white h-12 w-12 hover:bg-[#FFEB3B]" />
                <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2 border-4 border-[#5D4037] bg-white h-12 w-12 hover:bg-[#FFEB3B]" />
              </Carousel>
            </div>
          )}
        </div>
      </section>

      {/* Recent Bookings */}
      <section className="py-24 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-black tracking-tight drop-shadow-[2px_2px_0_rgba(255,235,59,1)] mb-12 text-center">
            รายการจองล่าสุด
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentBookings.length === 0 ? (
              <div className="col-span-2 text-center text-gray-500 font-bold p-8">ยังไม่มีรายการจอง</div>
            ) : (
              recentBookings.map(b => (
                <div key={b.id} className="flex items-center gap-4 p-4 border-4 border-[#5D4037] rounded-2xl shadow-[4px_4px_0_0_#5D4037] bg-[#FFFDF5]">
                  <div className="bg-[#F44336] text-white p-3 rounded-full border-2 border-[#5D4037]">
                    <UserIcon size={24} />
                  </div>
                  <div>
                    <p className="font-black text-lg">{b.user.name}</p>
                    <p className="text-sm font-bold text-gray-600">
                      เพิ่งจองคอร์ส <span className="text-[#F44336]">{b.classEvent.name}</span> ไปเมื่อ {new Date(b.createdAt).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      
      <style dangerouslySetInnerHTML={{__html: `
        .stroke-text {
          -webkit-text-stroke: 3px #5D4037;
          text-shadow: 4px 4px 0 #F44336;
        }
      `}} />
    </div>
  );
}

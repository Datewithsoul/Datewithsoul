import Link from "next/link";
import { Search, Heart, LogOut, User as UserIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { logout } from "./login/actions";
import Navbar from "@/components/navbar";
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

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let dbUser = null;
  if (user) {
    dbUser = await prisma.user.findUnique({
      where: { email: user.email! }
    });
  }

  return (
    <div className="min-h-screen bg-white text-[#1c1d1f] font-sans overflow-x-hidden">
      <Navbar />

      {/* Hero Section (Carousel) */}
      <section className="max-w-[1340px] mx-auto px-6 py-6 md:py-12">
        {upcomingClasses.length > 0 ? (
          <Carousel opts={{ loop: true, align: "start" }} className="w-full relative group">
            <CarouselContent>
              {upcomingClasses.slice(0, 3).map((heroClass) => (
                <CarouselItem key={`hero-${heroClass.id}`}>
                  <div className="relative w-full h-[300px] md:h-[400px] bg-gray-100 flex items-center overflow-hidden">
                    {/* Background image */}
                    {heroClass.media && heroClass.media.length > 0 ? (
                      <img 
                        src={heroClass.media[0].url} 
                        alt={heroClass.name} 
                        className="absolute inset-0 w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="absolute inset-0 bg-[#FFEB3B]/20"></div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/20"></div>
                    
                    {/* Floating Text Box - Hidden on very small screens or styled differently */}
                    <div className="relative z-10 bg-white p-6 md:p-8 w-[90%] mx-auto md:mx-0 md:max-w-[440px] md:ml-12 shadow-lg border border-gray-100 flex flex-col justify-center">
                      <h1 className="text-xl md:text-3xl font-bold mb-2 md:mb-4 text-[#1c1d1f] leading-tight line-clamp-2">
                        {heroClass.name}
                      </h1>
                      <p className="hidden md:block text-sm md:text-base text-gray-700 mb-6 leading-relaxed line-clamp-3">
                        {heroClass.description || "เข้าร่วมเวิร์กชอปปั้นดินเผาและศิลปะของเรา พักผ่อน สร้างสรรค์ผลงาน ในพื้นที่ที่อบอุ่นและเป็นกันเอง"}
                      </p>
                      <Link 
                        href={`/classes/${heroClass.id}`}
                        className="inline-block bg-[#F44336] text-white font-bold text-center px-6 py-3 hover:bg-[#d32f2f] transition-colors"
                      >
                        ดูรายละเอียดคลาส
                      </Link>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {upcomingClasses.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md border-black opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex" />
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md border-black opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex" />
              </>
            )}
          </Carousel>
        ) : (
          <div className="relative w-full h-[300px] md:h-[400px] bg-gray-100 flex items-center overflow-hidden">
            <div className="absolute inset-0 bg-[#FFEB3B]/20"></div>
            <div className="relative z-10 bg-white p-6 md:p-8 w-[90%] mx-auto md:mx-0 md:max-w-[440px] md:ml-12 shadow-lg border border-gray-100">
              <h1 className="text-2xl md:text-4xl font-bold mb-4 text-[#1c1d1f] leading-tight">
                ค้นหาจิตวิญญาณ<br/>นักสร้างสรรค์
              </h1>
              <p className="hidden md:block text-lg text-gray-700 mb-6 leading-relaxed">
                เข้าร่วมเวิร์กชอปปั้นดินเผาและศิลปะของเรา พักผ่อน สร้างสรรค์ผลงาน ในพื้นที่ที่อบอุ่นและเป็นกันเอง
              </p>
              <Link 
                href="/classes"
                className="block md:inline-block bg-[#F44336] text-white text-center font-bold px-6 py-3 hover:bg-[#d32f2f] transition-colors"
              >
                ดูคลาสเรียนทั้งหมด
              </Link>
            </div>
          </div>
        )}
      </section>

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

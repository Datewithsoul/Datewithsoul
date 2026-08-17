import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Heart, MapPin, Calendar, Users } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

export default async function ClassesPage() {
  const upcomingClasses = await prisma.classEvent.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    include: {
      media: {
        orderBy: { order: 'asc' }
      }
    }
  });

  return (
    <div className="min-h-screen bg-white text-[#1c1d1f] font-sans pb-24">
      {/* Simple Header */}
      <header className="border-b border-gray-100 bg-white py-4 px-6 sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="text-[#F44336]" size={28} fill="currentColor" />
            <span className="text-xl font-bold tracking-tight text-[#F44336]">Date With Soul</span>
          </Link>
          <nav className="flex gap-4 font-semibold text-sm text-gray-700">
            <Link href="/" className="hover:text-black">หน้าหลัก</Link>
          </nav>
        </div>
      </header>

      <section className="pt-12 pb-6 px-6 max-w-[1280px] mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          คลาสเรียนและเวิร์กชอปที่เปิดรับ
        </h1>
        <p className="text-gray-600 mb-10">ค้นหาแรงบันดาลใจและสร้างสรรค์ผลงานศิลปะในแบบของคุณ</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 gap-y-10">
          {upcomingClasses.length === 0 ? (
            <div className="col-span-full text-center p-12 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-xl font-semibold text-gray-600">ยังไม่มีคลาสเรียนที่จัดตารางไว้ในขณะนี้</p>
            </div>
          ) : (
            upcomingClasses.map((c) => (
              <div key={c.id} className="group flex flex-col gap-3">
                {/* Image Carousel (Airbnb style) */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-200">
                  {c.media && c.media.length > 0 ? (
                    <Carousel opts={{ align: "start", loop: true }} className="w-full h-full">
                      <CarouselContent className="h-full">
                        {c.media.map((m) => (
                          <CarouselItem key={m.id} className="h-full relative cursor-pointer">
                            <Link href={`/classes/${c.id}`} className="w-full h-full block">
                              {m.type === "VIDEO" ? (
                                <video 
                                  src={m.url} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <img 
                                  src={m.url} 
                                  alt={c.name}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </Link>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {c.media.length > 1 && (
                        <>
                          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-none shadow-sm opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-black" />
                          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white border-none shadow-sm opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-black" />
                        </>
                      )}
                    </Carousel>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 font-semibold bg-gray-100">
                      ไม่มีรูปภาพ
                    </div>
                  )}
                  
                </div>

                {/* Details */}
                <Link href={`/classes/${c.id}`} className="block">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-[17px] text-[#222222] line-clamp-1 group-hover:underline">
                      {c.name}
                    </h3>
                  </div>
                  <p className="text-[#717171] text-sm mb-1">{c.instructor || "ไม่ระบุผู้สอน"}</p>
                  <p className="text-[#717171] text-sm mb-2">
                    {c.date.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })} 
                    {c.endDate && c.endDate.getTime() !== c.date.getTime() && (
                      <> - {c.endDate.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}</>
                    )}
                  </p>
                  
                  <div className="flex items-center justify-between mt-1">
                    <p className="font-semibold text-[15px] text-[#222222]">
                      ฿{c.price.toLocaleString()}
                    </p>
                    {c.totalSeats > 0 ? (
                      <span className="text-xs font-semibold text-[#F44336] bg-[#F44336]/10 px-2 py-1 rounded-md">
                        เหลือ {c.totalSeats} ที่
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                        เต็มแล้ว
                      </span>
                    )}
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

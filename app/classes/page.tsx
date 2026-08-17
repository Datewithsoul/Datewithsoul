import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Heart } from "lucide-react";

export default async function ClassesPage() {
  const upcomingClasses = await prisma.classEvent.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
  });

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#5D4037] font-sans">
      <header className="border-b-4 border-[#5D4037] bg-[#FFEB3B] py-4 px-8 sticky top-0 z-50 shadow-[0_4px_0_0_#5D4037]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-[#F44336] p-2 rounded-full border-2 border-[#5D4037] shadow-[2px_2px_0_0_#5D4037]">
              <Heart className="text-white" size={24} fill="currentColor" />
            </div>
            <span className="text-2xl font-black tracking-widest uppercase">Date With Soul</span>
          </Link>
        </div>
      </header>

      <section className="py-24 px-8 max-w-6xl mx-auto">
        <h1 className="text-6xl font-black tracking-tight drop-shadow-[4px_4px_0_rgba(244,67,54,1)] text-[#FFEB3B] stroke-text mb-12">
          คลาสเรียนทั้งหมด
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingClasses.length === 0 ? (
            <div className="col-span-full text-center p-12 border-4 border-[#5D4037] border-dashed rounded-3xl">
              <p className="text-xl font-bold">ยังไม่มีคลาสเรียนที่จัดตารางไว้ในขณะนี้</p>
            </div>
          ) : (
            upcomingClasses.map((c) => (
              <div key={c.id} className="bg-white border-4 border-[#5D4037] rounded-3xl p-6 shadow-[8px_8px_0_0_#5D4037] flex flex-col gap-4 group hover:-translate-y-2 transition-transform">
                <div>
                  <h3 className="text-2xl font-black line-clamp-1">{c.name}</h3>
                  <p className="text-[#F44336] font-bold text-xl">฿{c.price.toLocaleString()}</p>
                </div>
                
                {c.description && (
                  <p className="font-medium text-sm line-clamp-2">{c.description}</p>
                )}

                <div className="flex flex-col gap-2 font-bold text-sm bg-[#FFEB3B]/20 p-4 border-2 border-[#5D4037] rounded-xl mt-auto">
                  <div className="flex justify-between">
                    <span>วันที่:</span>
                    <span>{c.date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>เวลา:</span>
                    <span>{c.startTime} - {c.endTime}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t-2 border-[#5D4037]/20">
                    <span>ที่นั่งว่าง:</span>
                    <span className="bg-[#F44336] text-white px-2 py-1 rounded-md border-2 border-[#5D4037] shadow-[2px_2px_0_0_#5D4037]">
                      {c.totalSeats} ที่
                    </span>
                  </div>
                </div>
                
                <Link 
                  href={`/book/${c.id}`}
                  className="mt-2 w-full text-center bg-[#FFEB3B] text-[#5D4037] font-black tracking-widest py-3 border-4 border-[#5D4037] rounded-xl shadow-[4px_4px_0_0_#5D4037] hover:bg-[#F44336] hover:text-white transition-colors"
                >
                  จองเลย
                </Link>
              </div>
            ))
          )}
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

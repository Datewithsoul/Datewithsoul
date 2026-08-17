import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, User, ArrowLeft } from "lucide-react";

export default async function ClassDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: classId } = await params;
  const classEvent = await prisma.classEvent.findUnique({
    where: { id: classId }
  });

  if (!classEvent) {
    notFound();
  }

  // Use a fallback image if no image was uploaded
  const imageUrl = classEvent.imageUrl || "/placeholder-class.jpg";

  return (
    <main className="min-h-screen bg-[#FFFDF7]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        <Link href="/" className="inline-flex items-center gap-2 mb-6 text-[#5D4037] font-bold hover:underline">
          <ArrowLeft size={20} />
          กลับไปหน้าหลัก
        </Link>

        <div className="bg-white rounded-3xl border-4 border-[#5D4037] shadow-[8px_8px_0_0_#5D4037] overflow-hidden">
          {/* Media Section */}
          <div className="w-full relative h-[400px] bg-yellow-100 border-b-4 border-[#5D4037]">
            {classEvent.videoUrl ? (
              <video 
                src={classEvent.videoUrl} 
                className="w-full h-full object-cover"
                controls 
                poster={classEvent.imageUrl || undefined}
              />
            ) : (
              <img 
                src={imageUrl} 
                alt={classEvent.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="p-8 md:p-12">
            <h1 className="text-4xl md:text-5xl font-black text-[#5D4037] tracking-tight drop-shadow-[2px_2px_0_rgba(255,235,59,1)] mb-4">
              {classEvent.name}
            </h1>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 bg-[#FFEB3B] text-[#5D4037] px-4 py-2 rounded-full border-2 border-[#5D4037] shadow-[2px_2px_0_0_#5D4037] font-bold">
                <Calendar size={18} />
                {classEvent.date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="flex items-center gap-2 bg-[#FFEB3B] text-[#5D4037] px-4 py-2 rounded-full border-2 border-[#5D4037] shadow-[2px_2px_0_0_#5D4037] font-bold">
                <Clock size={18} />
                {classEvent.startTime} - {classEvent.endTime}
              </div>
              <div className="flex items-center gap-2 bg-[#FFEB3B] text-[#5D4037] px-4 py-2 rounded-full border-2 border-[#5D4037] shadow-[2px_2px_0_0_#5D4037] font-bold">
                <Users size={18} />
                รับ {classEvent.totalSeats} ท่าน
              </div>
              <div className="flex items-center gap-2 bg-[#FFEB3B] text-[#5D4037] px-4 py-2 rounded-full border-2 border-[#5D4037] shadow-[2px_2px_0_0_#5D4037] font-bold">
                <User size={18} />
                ผู้สอน: {classEvent.instructor}
              </div>
            </div>

            <div className="prose prose-lg text-[#5D4037] mb-12 max-w-none">
              <h2 className="font-bold text-2xl mb-4 border-b-4 border-[#FFEB3B] inline-block">รายละเอียดกิจกรรม</h2>
              <p className="whitespace-pre-wrap">{classEvent.description || "ไม่มีรายละเอียด"}</p>
            </div>

            <div className="bg-[#FFFDF7] p-6 rounded-2xl border-4 border-[#5D4037] shadow-[4px_4px_0_0_#5D4037] flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">ราคา</p>
                <p className="text-4xl font-black text-[#F44336]">
                  ฿{classEvent.price.toLocaleString()}
                </p>
              </div>
              <Link href={`/book/${classEvent.id}`} className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-[#F44336] text-white text-xl font-black px-12 py-4 rounded-full border-4 border-[#5D4037] shadow-[6px_6px_0_0_#5D4037] hover:translate-y-1 hover:shadow-[2px_2px_0_0_#5D4037] transition-all uppercase tracking-widest">
                  จองที่นั่ง (Book Now)
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

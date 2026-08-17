import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { submitBooking } from "./actions";
import { createClient } from "@/utils/supabase/server";

export default async function BookClassPage({ params }: { params: Promise<{ classId: string }> }) {
  const { classId } = await params;
  const classEvent = await prisma.classEvent.findUnique({
    where: { id: classId },
  });

  if (!classEvent) {
    return notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?error=กรุณาเข้าสู่ระบบก่อนทำการจอง`);
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! }
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

      <section className="py-24 px-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/classes"
            className="p-3 bg-white border-4 border-[#5D4037] rounded-full shadow-[4px_4px_0_0_#5D4037] hover:translate-y-1 hover:shadow-[2px_2px_0_0_#5D4037] transition-all"
          >
            <ArrowLeft size={24} className="text-[#5D4037]" />
          </Link>
          <h1 className="text-5xl font-black tracking-tight drop-shadow-[2px_2px_0_rgba(244,67,54,1)] text-[#FFEB3B] stroke-text">
            ยืนยันการจอง
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Class Details */}
          <div className="bg-[#FFEB3B] border-4 border-[#5D4037] rounded-3xl p-8 shadow-[8px_8px_0_0_#5D4037] h-fit">
            <h2 className="text-3xl font-black mb-6">{classEvent.name}</h2>
            <div className="flex flex-col gap-4 font-bold text-lg">
              <div className="flex justify-between border-b-2 border-[#5D4037]/20 pb-2">
                <span>วันที่</span>
                <span>{classEvent.date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between border-b-2 border-[#5D4037]/20 pb-2">
                <span>เวลา</span>
                <span>{classEvent.startTime} - {classEvent.endTime}</span>
              </div>
              <div className="flex justify-between border-b-2 border-[#5D4037]/20 pb-2">
                <span>ราคาต่อที่นั่ง</span>
                <span className="text-[#F44336]">฿{classEvent.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mt-4 text-2xl font-black">
                <span>รวมทั้งสิ้น</span>
                <span className="text-[#F44336]">฿{classEvent.price.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white border-4 border-[#5D4037] rounded-3xl p-8 shadow-[8px_8px_0_0_#5D4037]">
            <h2 className="text-2xl font-black uppercase mb-6">ข้อมูลผู้จอง</h2>
            <form action={submitBooking} className="flex flex-col gap-6">
              <input type="hidden" name="classEventId" value={classEvent.id} />
              <input type="hidden" name="totalPrice" value={classEvent.price} />
              
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="font-bold text-[#5D4037] text-sm">ชื่อ-นามสกุล</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  required
                  defaultValue={dbUser?.name || ""}
                  className="p-4 border-4 border-[#5D4037] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FFEB3B] transition-all bg-gray-50 font-bold"
                  placeholder="เช่น สมปอง นักปั้น"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="font-bold text-[#5D4037] text-sm">อีเมล</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required
                  defaultValue={user.email}
                  readOnly
                  className="p-4 border-4 border-[#5D4037] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FFEB3B] transition-all bg-gray-200 font-bold cursor-not-allowed text-gray-500"
                  placeholder="email@example.com"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="seats" className="font-bold text-[#5D4037] text-sm">จำนวนที่นั่งที่ต้องการ</label>
                <input 
                  type="number" 
                  id="seats" 
                  name="seats" 
                  min="1"
                  max={classEvent.totalSeats}
                  defaultValue="1"
                  required
                  className="p-4 border-4 border-[#5D4037] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FFEB3B] transition-all bg-gray-50 font-bold"
                />
              </div>

              <button 
                type="submit"
                className="mt-4 bg-[#F44336] text-white p-5 rounded-xl font-black text-xl border-4 border-[#5D4037] shadow-[6px_6px_0_0_#5D4037] hover:translate-y-1 hover:shadow-[2px_2px_0_0_#5D4037] transition-all tracking-widest"
              >
                ยืนยันการจอง
              </button>
            </form>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{__html: `
        .stroke-text {
          -webkit-text-stroke: 2px #5D4037;
          text-shadow: 3px 3px 0 #5D4037;
        }
      `}} />
    </div>
  );
}

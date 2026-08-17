import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { submitBooking } from "./actions";
import { createClient } from "@/utils/supabase/server";

import Navbar from "@/components/navbar";

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
    <div className="min-h-screen bg-white text-[#222222] font-sans pb-24">
      <Navbar />

      <section className="pt-12 px-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8 border-b border-gray-200 pb-4">
          <Link 
            href={`/classes/${classEvent.id}`}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-[#222222]" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            ยืนยันการจอง
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Class Details */}
          <div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 h-fit">
              <h2 className="text-2xl font-semibold mb-6">{classEvent.name}</h2>
              <div className="flex flex-col gap-4 text-[#222222]">
                <div className="flex justify-between border-b border-gray-200 pb-3">
                  <span className="text-gray-600">วันที่</span>
                  <span className="font-semibold">{classEvent.date.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-3">
                  <span className="text-gray-600">เวลา</span>
                  <span className="font-semibold">{classEvent.startTime} - {classEvent.endTime}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-3">
                  <span className="text-gray-600">ราคาต่อที่นั่ง</span>
                  <span className="font-semibold text-[#F44336]">฿{classEvent.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mt-2 text-xl font-bold">
                  <span>รวมทั้งสิ้น</span>
                  <span className="text-[#F44336]">฿{classEvent.price.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <h2 className="text-xl font-semibold mb-6">ข้อมูลผู้จอง</h2>
            <form action={submitBooking} className="flex flex-col gap-5">
              <input type="hidden" name="classEventId" value={classEvent.id} />
              <input type="hidden" name="totalPrice" value={classEvent.price} />
              
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="font-semibold text-sm text-gray-700">ชื่อ-นามสกุล</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  required
                  defaultValue={dbUser?.name || ""}
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="ชื่อ-นามสกุล"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="font-semibold text-sm text-gray-700">อีเมล</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  required
                  defaultValue={user.email}
                  readOnly
                  className="p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="seats" className="font-semibold text-sm text-gray-700">จำนวนที่นั่งที่ต้องการ</label>
                <input 
                  type="number" 
                  id="seats" 
                  name="seats" 
                  min="1"
                  max={classEvent.totalSeats}
                  defaultValue="1"
                  required
                  className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                />
              </div>

              <button 
                type="submit"
                className="mt-6 bg-[#E51D53] hover:bg-[#D70444] text-white font-bold py-3.5 rounded-lg text-lg transition-colors w-full"
              >
                ยืนยันการจอง
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

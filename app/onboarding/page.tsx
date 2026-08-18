"use client";

import { useActionState } from "react";
import { submitOnboarding } from "./actions";
import { Heart, User, Phone, Mail } from "lucide-react";

export default function OnboardingPage() {
  const [state, action, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await submitOnboarding(formData);
    },
    null
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col items-center mb-8">
          <Heart className="text-[#F44336] mb-4" size={48} fill="currentColor" />
          <h1 className="text-2xl font-bold text-[#222222] text-center">ยินดีต้อนรับสู่ Date With Soul</h1>
          <p className="text-gray-500 text-center mt-2">กรุณากรอกข้อมูลเพิ่มเติมให้ครบถ้วนเพื่อเริ่มใช้งาน</p>
        </div>

        {state?.error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
            {state.error}
          </div>
        )}

        <form action={action} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <User size={16} /> ชื่อ-นามสกุล
            </label>
            <input 
              type="text" 
              id="name"
              name="name"
              required
              placeholder="ชื่อ-นามสกุล ของคุณ"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="phone" className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <Phone size={16} /> เบอร์โทรศัพท์
            </label>
            <input 
              type="tel" 
              id="phone"
              name="phone"
              required
              placeholder="08X-XXX-XXXX"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <Mail size={16} /> อีเมล
            </label>
            <input 
              type="email" 
              id="email"
              name="email"
              required
              placeholder="example@email.com"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
            />
            <p className="text-xs text-gray-500">อีเมลใช้สำหรับส่งข้อมูลยืนยันการจองคลาสและใบเสร็จ</p>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-[#FFC107] hover:bg-[#FFB300] text-[#222222] font-bold py-3.5 px-6 rounded-full mt-4 transition-all transform active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
          >
            {isPending ? "กำลังบันทึก..." : "บันทึกข้อมูลและเริ่มใช้งาน"}
          </button>
        </form>
      </div>
    </div>
  );
}

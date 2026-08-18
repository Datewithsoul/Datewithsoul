"use client";

import { useActionState } from "react";
import { updateProfile } from "./actions";
import { User, Phone, Mail } from "lucide-react";

interface SettingsFormProps {
  initialName: string;
  initialPhone: string;
  initialEmail: string;
  role: string;
  image: string | null;
}

export default function SettingsForm({ initialName, initialPhone, initialEmail, role, image }: SettingsFormProps) {
  const [state, action, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await updateProfile(formData);
    },
    null
  );

  return (
    <div className="border border-gray-200 rounded-2xl p-8">
      <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-gray-100">ข้อมูลส่วนตัว</h2>
      
      <div className="flex items-center gap-6 mb-8">
        {image ? (
          <img 
            src={image} 
            alt={initialName} 
            className="w-24 h-24 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center font-bold text-3xl">
            {initialName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-xl font-bold">{initialName}</p>
          <p className="text-gray-500">{role === 'ADMIN' ? 'ผู้ดูแลระบบ (Admin)' : 'ผู้ใช้งานทั่วไป'}</p>
        </div>
      </div>
      
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-6 text-sm">
          {state.error}
        </div>
      )}
      
      {state?.success && (
        <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-lg mb-6 text-sm">
          {state.success}
        </div>
      )}
      
      <form action={action} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <User size={16} /> ชื่อ-นามสกุล
          </label>
          <input 
            type="text" 
            id="name"
            name="name"
            defaultValue={initialName}
            required
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
            defaultValue={initialPhone}
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
            defaultValue={initialEmail}
            required
            placeholder="example@email.com"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
          />
          <p className="text-xs text-gray-500">อีเมลใช้สำหรับส่งข้อมูลยืนยันการจองคลาสและใบเสร็จ</p>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button 
            type="submit" 
            disabled={isPending}
            className="bg-[#FFC107] hover:bg-[#FFB300] text-[#222222] font-bold py-2.5 px-6 rounded-full transition-all transform active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
          >
            {isPending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
          </button>
        </div>
      </form>
    </div>
  );
}

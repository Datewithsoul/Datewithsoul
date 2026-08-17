import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import { User, Mail } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! }
  });

  if (!dbUser) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans">
      <Navbar />
      
      <main className="max-w-[800px] mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">ตั้งค่าผู้ใช้</h1>
        
        <div className="border border-gray-200 rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-gray-100">ข้อมูลส่วนตัว</h2>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center font-bold text-3xl">
              {dbUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-bold">{dbUser.name}</p>
              <p className="text-gray-500">{dbUser.role === 'ADMIN' ? 'ผู้ดูแลระบบ (Admin)' : 'ผู้ใช้งานทั่วไป'}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <User size={16} /> ชื่อ-นามสกุล
              </label>
              <input 
                type="text" 
                value={dbUser.name}
                readOnly
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <Mail size={16} /> อีเมล
              </label>
              <input 
                type="email" 
                value={dbUser.email || ""}
                readOnly
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">อีเมลใช้สำหรับเข้าสู่ระบบและรับการแจ้งเตือน ไม่สามารถแก้ไขได้</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

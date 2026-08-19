import { adminLogin } from "./actions";
import { Lock } from "lucide-react";

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f1ec] px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-[#ddd4c8]">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[#ece7e1] text-[#3d3229] rounded-full flex items-center justify-center">
            <Lock size={32} />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-[#3d3229] mb-2">เข้าสู่ระบบผู้ดูแล</h1>
        <p className="text-[#6a5d50] text-center mb-8">กรุณากรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบจัดการ</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100 text-center">
            {error}
          </div>
        )}

        <form action={adminLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#3d3229] mb-1.5">ชื่อผู้ใช้ หรือ อีเมล</label>
            <input 
              type="text" 
              name="email"
              required 
              placeholder="admin หรือ admin@example.com"
              className="w-full px-4 py-2 border border-[#ddd4c8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a6d1f]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#3d3229] mb-1.5">รหัสผ่าน</label>
            <input 
              type="password" 
              name="password"
              required
              className="w-full px-4 py-2 border border-[#ddd4c8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8a6d1f]"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-[#3d3229] hover:bg-[#2c241d] text-white font-semibold py-2.5 rounded-lg transition-colors mt-4"
          >
            เข้าสู่ระบบ
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-[#ddd4c8] text-center">
          <a href="/" className="text-sm text-[#8a6d1f] hover:underline">
            &larr; กลับไปหน้าเว็บไซต์หลัก
          </a>
        </div>
      </div>
    </div>
  );
}

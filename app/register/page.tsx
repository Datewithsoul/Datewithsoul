import Link from "next/link";
import { Heart } from "lucide-react";
import { signup } from "../login/actions";

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#5D4037] font-sans flex flex-col">
      <header className="border-b-4 border-[#5D4037] bg-[#FFEB3B] py-4 px-8 shadow-[0_4px_0_0_#5D4037]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-[#F44336] p-2 rounded-full border-2 border-[#5D4037] shadow-[2px_2px_0_0_#5D4037]">
              <Heart className="text-white" size={24} fill="currentColor" />
            </div>
            <span className="text-2xl font-black tracking-widest uppercase">Date With Soul</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8 bg-[url('/dot-pattern.png')] bg-repeat">
        <div className="bg-white border-4 border-[#5D4037] rounded-3xl p-8 shadow-[8px_8px_0_0_#5D4037] w-full max-w-md my-8">
          <h1 className="text-4xl font-black mb-6 text-center tracking-tight drop-shadow-[2px_2px_0_rgba(255,235,59,1)] stroke-text">
            สมัครสมาชิก
          </h1>

          {searchParams.error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 rounded-xl mb-6 font-bold text-sm text-center">
              {searchParams.error}
            </div>
          )}

          <form action={signup} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="font-bold text-[#5D4037]">ชื่อ-นามสกุล</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required
                className="p-4 border-4 border-[#5D4037] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FFEB3B] transition-all font-bold"
                placeholder="สมปอง นักปั้น"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="font-bold text-[#5D4037]">อีเมล</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required
                className="p-4 border-4 border-[#5D4037] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FFEB3B] transition-all font-bold"
                placeholder="email@example.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="font-bold text-[#5D4037]">รหัสผ่าน</label>
              <input 
                type="password" 
                id="password" 
                name="password" 
                required
                className="p-4 border-4 border-[#5D4037] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FFEB3B] transition-all font-bold"
                placeholder="********"
              />
            </div>

            <button 
              type="submit"
              className="mt-4 bg-[#F44336] text-white p-4 rounded-xl font-black text-xl border-4 border-[#5D4037] shadow-[4px_4px_0_0_#5D4037] hover:translate-y-1 hover:shadow-[2px_2px_0_0_#5D4037] transition-all tracking-widest"
            >
              ลงทะเบียน
            </button>
          </form>

          <div className="mt-8 text-center font-bold">
            มีบัญชีอยู่แล้ว? <Link href="/login" className="text-[#2196F3] underline hover:text-[#5D4037]">เข้าสู่ระบบ</Link>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .stroke-text {
          -webkit-text-stroke: 2px #5D4037;
        }
      `}} />
    </div>
  );
}

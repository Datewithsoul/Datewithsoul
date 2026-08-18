"use client";

import { User } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function UserMenu({ user, isAdmin }: { user: any, isAdmin: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-black">เข้าสู่ระบบ</Link>
        <Link href="/register" className="text-sm font-semibold bg-[#222222] text-white px-4 py-2 rounded-full hover:bg-black transition-colors">สมัครสมาชิก</Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center justify-center bg-white rounded-full border border-gray-200 hover:shadow-md transition-all text-gray-600 hover:text-black overflow-hidden"
        style={{ width: "36px", height: "36px" }}
      >
        {user.image ? (
          <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          <User size={18} />
        )}
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 mb-1 bg-gray-50/50">
            <p className="text-sm font-semibold text-[#222222] truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">บัญชีผู้ใช้ LINE</p>
          </div>
          <Link href="/bookings" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">ประวัติการจอง</Link>
          <Link href="/settings" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">ตั้งค่าผู้ใช้</Link>
          {isAdmin && (
            <Link href="/admin" onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm font-semibold text-[#F44336] hover:bg-red-50 transition-colors mt-1">หน้าจัดการ (Admin)</Link>
          )}
          <div className="border-t border-gray-100 mt-1 pt-1"></div>
          <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-50 text-gray-700 hover:text-black transition-colors">ออกจากระบบ</button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Heart, Menu, X, User, BookOpen, Settings, ShieldCheck, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import CartButton from "./cart-button";

const navLinks = [
  { href: "/classes", label: "คลาสเรียน" },
  { href: "/schedule", label: "ตารางเรียน" },
  { href: "/how-it-works", label: "วิธีการจอง" },
  { href: "/bookings", label: "ตรวจสอบสถานะการจอง" },
  { href: "/contact", label: "ติดต่อเรา" },
];

export default function NavbarClient({
  user,
  isAdmin,
}: {
  user: any;
  isAdmin: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setMenuOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="max-w-[1280px] mx-auto flex h-14 md:h-16 items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Heart className="text-[#F44336] w-6 h-6 md:w-7 md:h-7" fill="currentColor" />
            <span className="text-base md:text-xl font-bold tracking-tight text-[#F44336] leading-none">
              Date With Soul
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-gray-700 hover:text-black transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/classes"
              className="text-sm font-bold bg-[#F44336] text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors shadow-sm"
            >
              จองคลาส
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 md:gap-4">
            <CartButton />

            {/* Desktop: user menu or auth links */}
            <div className="hidden md:block">
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center justify-center bg-white rounded-full border border-gray-200 hover:shadow-md transition-all text-gray-600 hover:text-black overflow-hidden w-9 h-9"
                    aria-label="เมนูผู้ใช้"
                  >
                    {user.image ? (
                      <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={18} />
                    )}
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100 mb-1 bg-gray-50/50">
                        <p className="text-sm font-semibold text-[#222222] truncate">{user.name}</p>
                        <p className="text-xs text-gray-500">บัญชีผู้ใช้ LINE</p>
                      </div>
                      <Link href="/bookings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                        <BookOpen size={14} /> ประวัติการจอง
                      </Link>
                      <Link href="/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                        <Settings size={14} /> ตั้งค่าผู้ใช้
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#F44336] hover:bg-red-50 transition-colors">
                          <ShieldCheck size={14} /> หน้าจัดการ (Admin)
                        </Link>
                      )}
                      <div className="border-t border-gray-100 mt-1 pt-1" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                        <LogOut size={14} /> ออกจากระบบ
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login" className="text-sm font-semibold text-gray-700 hover:text-black transition-colors">
                    เข้าสู่ระบบ
                  </Link>
                  <Link href="/register" className="text-sm font-semibold bg-[#222222] text-white px-4 py-2 rounded-full hover:bg-black transition-colors">
                    สมัครสมาชิก
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile: avatar (if logged in) + hamburger */}
            <div className="flex items-center gap-2 md:hidden">
              {user && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 overflow-hidden text-gray-600 shrink-0">
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={16} />
                  )}
                </div>
              )}
              <button
                className="p-1.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            {/* User info banner */}
            {user && (
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div className="w-9 h-9 rounded-full border border-gray-200 overflow-hidden shrink-0 text-gray-500 flex items-center justify-center bg-white">
                  {user.image ? (
                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#222222] truncate">{user.name}</p>
                  <p className="text-xs text-gray-500">บัญชีผู้ใช้ LINE</p>
                </div>
              </div>
            )}

            <nav className="flex flex-col divide-y divide-gray-100">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center px-4 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <>
                  <Link href="/bookings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <BookOpen size={16} className="text-gray-400" /> ประวัติการจอง
                  </Link>
                  <Link href="/settings" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings size={16} className="text-gray-400" /> ตั้งค่าผู้ใช้
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3.5 text-sm font-semibold text-[#F44336] hover:bg-red-50 transition-colors">
                      <ShieldCheck size={16} /> หน้าจัดการ (Admin)
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LogOut size={16} className="text-gray-400" /> ออกจากระบบ
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center px-4 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                    เข้าสู่ระบบ
                  </Link>
                  <div className="px-4 py-3">
                    <Link
                      href="/register"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-center w-full py-2.5 rounded-full bg-[#222222] text-white text-sm font-semibold hover:bg-black transition-colors"
                    >
                      สมัครสมาชิก
                    </Link>
                  </div>
                </>
              )}
            </nav>
            {/* Mobile: จองคลาส CTA */}
            <div className="px-4 py-3 border-t border-gray-100">
              <Link
                href="/classes"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-full py-3 rounded-full bg-[#F44336] text-white text-sm font-bold hover:bg-red-600 transition-colors"
              >
                จองคลาส
              </Link>
            </div>
          </div>

        )}
      </header>
    </>
  );
}

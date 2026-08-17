import Link from "next/link";
import { ArrowRight, Users, Heart, Sparkles, AlertCircle, CheckCircle } from "lucide-react";

// Four user avatars for social proof (replaces emoji avatars)
const AVATAR_COLORS = [
  { bg: "var(--brand-yellow)", color: "var(--brand-brown)" },
  { bg: "var(--brand-red)", color: "#fff" },
  { bg: "var(--brand-brown)", color: "#fff" },
  { bg: "var(--brand-brown-light)", color: "var(--brand-brown)" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Halftone dot strip at top */}
      <div className="halftone-yellow-bg h-3 w-full" aria-hidden />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <div>
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-6"
              style={{
                backgroundColor: "var(--brand-yellow)",
                border: "var(--pop-outline)",
                boxShadow: "3px 3px 0px var(--brand-brown)",
                color: "var(--brand-brown)",
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              คลาสกลุ่มเล็ก ไม่เกิน 10 คน
            </div>

            {/* Heading — chunky pop art */}
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-black leading-none tracking-tight mb-6"
              style={{ color: "var(--brand-brown)" }}
            >
              เริ่มต้น
              <br />
              <span
                style={{
                  color: "var(--brand-red)",
                  WebkitTextStroke: "2px var(--brand-brown)",
                }}
              >
                ความสัมพันธ์
              </span>
              <br />
              ที่ดีกับ
              <span className="relative inline-block" style={{ color: "var(--brand-brown)" }}>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 h-4"
                  style={{ backgroundColor: "var(--brand-yellow)", zIndex: -1 }}
                />
                ตัวเอง
              </span>
            </h1>

            <p
              className="text-lg leading-relaxed mb-8 max-w-lg font-medium"
              style={{ color: "var(--brand-brown-mid)" }}
            >
              คลาสที่จะช่วยให้คุณรู้จักตัวเองลึกขึ้น เข้าใจความรู้สึก
              และเติบโตจากข้างใน บรรยากาศอบอุ่น ปลอดภัย ไม่ตัดสิน
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#schedule"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base pop-btn-primary"
              >
                ดูตารางคลาส
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#how-to-book"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-base pop-btn-outline"
              >
                วิธีจองคลาส
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 mt-10">
              <div className="flex -space-x-3">
                {AVATAR_COLORS.map((av, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white"
                    style={{ border: "var(--pop-outline)", backgroundColor: av.bg }}
                  >
                    <Users className="w-4 h-4" style={{ color: av.color }} />
                  </div>
                ))}
              </div>
              <p className="text-sm font-semibold" style={{ color: "var(--brand-brown)" }}>
                <span className="font-black text-base">200+</span> คนเข้าร่วมแล้ว
              </p>
            </div>
          </div>

          {/* Right — decorative pop art block */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              {/* Main yellow block */}
              <div
                className="w-80 h-80 rounded-3xl flex flex-col items-center justify-center gap-5 halftone-yellow-bg"
                style={{
                  border: "var(--pop-outline)",
                  boxShadow: "var(--pop-shadow-lg)",
                }}
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{
                    backgroundColor: "var(--brand-brown)",
                    border: "var(--pop-outline)",
                  }}
                >
                  <Heart className="w-10 h-10" color="#fff" fill="#fff" strokeWidth={1.5} />
                </div>
                <p
                  className="font-black text-2xl text-center px-6 leading-snug"
                  style={{ color: "var(--brand-brown)" }}
                >
                  เวลาคุณภาพ
                  <br />
                  กับตัวเอง
                </p>
              </div>

              {/* Floating tag — red (replaces "ที่นั่งจำกัด!" with icon) */}
              <div
                className="absolute -top-4 -right-4 flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-sm text-white rotate-6"
                style={{
                  backgroundColor: "var(--brand-red)",
                  border: "var(--pop-outline)",
                  boxShadow: "3px 3px 0 var(--brand-brown)",
                }}
              >
                <AlertCircle className="w-4 h-4" />
                ที่นั่งจำกัด!
              </div>

              {/* Floating tag — bottom (replaces ✦ with CheckCircle) */}
              <div
                className="absolute -bottom-4 -left-4 flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-sm -rotate-3"
                style={{
                  backgroundColor: "var(--brand-yellow)",
                  border: "var(--pop-outline)",
                  boxShadow: "3px 3px 0 var(--brand-brown)",
                  color: "var(--brand-brown)",
                }}
              >
                <CheckCircle className="w-4 h-4" />
                เปิดรับสมัครแล้ว
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Halftone dot strip at bottom */}
      <div
        className="h-3 w-full"
        style={{
          backgroundImage: "radial-gradient(circle, var(--brand-brown) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          backgroundColor: "var(--brand-brown-light)",
        }}
        aria-hidden
      />
    </section>
  );
}

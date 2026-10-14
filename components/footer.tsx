import Link from "next/link";
import { Heart, MessageCircle, ArrowRight, Sparkles } from "lucide-react";

const LINE_OA_URL = "https://line.me/R/ti/p/@073wlzuq";

const linkGroups = [
  {
    title: "คลาสเรียน",
    links: [
      { href: "/classes", label: "คลาสทั้งหมด" },
      { href: "/schedule", label: "ตารางเรียน" },
      { href: "/cart", label: "ตะกร้าของฉัน" },
    ],
  },
  {
    title: "บัญชีของฉัน",
    links: [
      { href: "/bookings", label: "ตรวจสอบสถานะการจอง" },
      { href: "/settings", label: "ตั้งค่าบัญชี" },
      { href: "/login", label: "เข้าสู่ระบบ" },
      { href: "/register", label: "สมัครสมาชิก" },
    ],
  },
  {
    title: "ช่วยเหลือ",
    links: [
      { href: "/how-it-works", label: "วิธีจองคลาส" },
      { href: "/faq", label: "คำถามที่พบบ่อย" },
      { href: "/contact", label: "ติดต่อเรา" },
    ],
  },
];

const legalLinks = [
  { href: "/terms", label: "เงื่อนไขการจอง" },
  { href: "/privacy", label: "นโยบายความเป็นส่วนตัว" },
];

export function Footer() {
  return (
    <footer className="mt-auto" style={{ backgroundColor: "var(--brand-brown)" }}>
      {/* CTA band */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundColor: "var(--brand-yellow)",
          borderTop: "var(--pop-outline)",
          borderBottom: "var(--pop-outline)",
        }}
      >
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: "radial-gradient(circle, var(--brand-brown) 1.2px, transparent 1.2px)",
            backgroundSize: "14px 14px",
          }}
          aria-hidden
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <p
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 bg-white"
              style={{ border: "var(--pop-outline)", color: "var(--brand-brown)" }}
            >
              <Sparkles className="w-3 h-3" />
              เริ่มต้นการเดินทาง
            </p>
            <h2
              className="text-2xl md:text-3xl font-bold leading-tight"
              style={{ color: "var(--brand-brown)" }}
            >
              พร้อมมีเดตกับหัวใจตัวเองหรือยัง?
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/classes"
              className="pop-btn-red inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-base"
            >
              จองคลาสเลย
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href={LINE_OA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="pop-btn-outline inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-base"
            >
              <MessageCircle className="w-4 h-4" style={{ color: "#06C755" }} />
              คุยกับเราทาง LINE
            </a>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-x-6 gap-y-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <span
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: "var(--brand-yellow)",
                  border: "2.5px solid white",
                  boxShadow: "3px 3px 0 var(--brand-red)",
                }}
              >
                <Heart className="w-4 h-4" style={{ color: "var(--brand-brown)" }} fill="currentColor" />
              </span>
              <span className="font-bold text-white text-lg">
                Date with <span style={{ color: "var(--brand-yellow)" }}>Soul Love</span>
              </span>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              พื้นที่ปลอดภัยสำหรับการเดินทางสู่ตัวเอง คลาสกลุ่มเล็ก บรรยากาศอบอุ่น
              เรียนรู้เรื่องความสัมพันธ์และการเข้าใจตนเองผ่านประสบการณ์จริง
            </p>
            <a
              href={LINE_OA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 w-fit px-4 py-2 rounded-full text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: "#06C755", border: "2px solid white" }}
            >
              <MessageCircle className="w-4 h-4" />
              @073wlzuq
            </a>
            <p className="text-white/50 text-xs">ตอบกลับภายใน 24 ชม. (จันทร์ – เสาร์)</p>
          </div>

          {/* Link groups */}
          {linkGroups.map((group) => (
            <nav
              key={group.title}
              aria-label={group.title}
              className="md:col-span-2 lg:col-span-2 md:first-of-type:col-start-6 flex flex-col gap-3 last:col-span-2 md:last:col-span-2"
            >
              <h3
                className="text-sm font-bold w-fit pb-1"
                style={{ color: "var(--brand-yellow)", borderBottom: "2px solid var(--brand-yellow)" }}
              >
                {group.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1.5 text-sm text-white/75 hover:text-white transition-colors"
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full transition-transform group-hover:scale-150"
                        style={{ backgroundColor: "var(--brand-yellow)" }}
                        aria-hidden
                      />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/55">
          <p>© {new Date().getFullYear()} Date with Soul Love. สงวนลิขสิทธิ์</p>
          <nav aria-label="ข้อกฎหมาย" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="flex items-center gap-1.5">
            Made with
            <Heart className="w-3.5 h-3.5" style={{ color: "var(--brand-red)" }} fill="currentColor" />
            for every soul
          </p>
        </div>
      </div>
    </footer>
  );
}

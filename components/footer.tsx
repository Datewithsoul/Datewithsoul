import Link from "next/link";
import { Heart } from "lucide-react";

const links = [
  { href: "/classes", label: "คลาสทั้งหมด" },
  { href: "/schedule", label: "ตารางคลาส" },
  { href: "/how-it-works", label: "วิธีจองคลาส" },
  { href: "/contact", label: "ติดต่อเรา" },
  { href: "/faq", label: "คำถามที่พบบ่อย" },
  { href: "/terms", label: "เงื่อนไขการจอง" },
  { href: "/privacy", label: "นโยบายความเป็นส่วนตัว" },
];

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--brand-brown)",
        borderTop: "var(--pop-outline)",
      }}
    >
      {/* Halftone strip */}
      <div
        className="h-2"
        style={{
          backgroundImage: "radial-gradient(circle, var(--brand-yellow) 1.5px, transparent 1.5px)",
          backgroundSize: "16px 16px",
          backgroundColor: "var(--brand-brown)",
        }}
        aria-hidden
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: "var(--brand-yellow)",
                  border: "2px solid white",
                  boxShadow: "2px 2px 0 rgba(255,255,255,0.3)",
                }}
              >
                <Heart
                  className="w-4 h-4"
                  style={{ color: "var(--brand-brown)" }}
                  fill="currentColor"
                />
              </div>
              <span className="font-black text-white text-base">
                Date with{" "}
                <span style={{ color: "var(--brand-yellow)" }}>Soul Love</span>
              </span>
            </Link>
            <p className="text-white/45 text-sm text-center md:text-left max-w-xs font-medium">
              พื้นที่ปลอดภัยสำหรับการเดินทางสู่ตัวเอง
            </p>
          </div>

          {/* Nav */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/60 hover:text-white text-sm font-semibold transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div
          className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/30 text-xs font-medium"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <p>© {new Date().getFullYear()} Date with Soul Love. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made with
            <Heart className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" />
            for everyone who dares to know themselves
          </p>
        </div>
      </div>
    </footer>
  );
}

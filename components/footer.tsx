import Link from "next/link";
import { Noto_Serif_Thai, Playfair_Display } from "next/font/google";
import { Heart, MessageCircle, ArrowUpRight } from "lucide-react";

const serifThai = Noto_Serif_Thai({ subsets: ["thai", "latin"], weight: ["400", "500", "600"] });
const display = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"], weight: ["400", "500"] });

const LINE_OA_URL = "https://line.me/R/ti/p/@073wlzuq";

// Deep antique gold (readable on white) derived from the brand yellow, with brand brown text
const GOLD = "oklch(0.62 0.12 75)";
const GOLD_SOFT = "oklch(0.62 0.12 75 / 0.45)";
const INK = "var(--brand-brown)";

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

function Ornament() {
  return (
    <div className="flex items-center justify-center gap-4" aria-hidden>
      <span className="h-px w-16 sm:w-24" style={{ background: `linear-gradient(to right, transparent, ${GOLD})` }} />
      <Heart className="w-3.5 h-3.5" style={{ color: GOLD }} strokeWidth={1.25} />
      <span className="h-px w-16 sm:w-24" style={{ background: `linear-gradient(to left, transparent, ${GOLD})` }} />
    </div>
  );
}

export function Footer() {
  return (
    <footer
      className="relative mt-auto overflow-hidden bg-white"
      style={{
        color: INK,
        backgroundImage: `radial-gradient(ellipse 80% 50% at 50% 0%, oklch(0.88 0.17 88 / 0.10), transparent 70%)`,
      }}
    >
      <div className="h-px w-full" style={{ background: `linear-gradient(to right, transparent, ${GOLD}, transparent)` }} />

      {/* Invitation */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-14 text-center">
        <Ornament />
        <p className="mt-6 text-[11px] tracking-[0.35em] uppercase" style={{ color: GOLD }}>
          Begin your journey
        </p>
        <h2 className={`${serifThai.className} mt-4 text-3xl sm:text-4xl leading-snug font-medium`}>
          พร้อมมีเดตกับหัวใจตัวเองหรือยัง?
        </h2>
        <p className="mt-4 text-sm sm:text-base leading-relaxed opacity-70">
          คลาสกลุ่มเล็กในบรรยากาศอบอุ่น ที่ออกแบบมาเพื่อให้คุณได้กลับมาเข้าใจตัวเองอย่างแท้จริง
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/classes"
            className="group inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold tracking-wide text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{ backgroundColor: INK }}
          >
            จองคลาสเลย
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
          <a
            href={LINE_OA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-medium tracking-wide transition-colors hover:bg-[oklch(0.62_0.12_75/0.06)]"
            style={{ border: `1px solid ${GOLD_SOFT}`, color: GOLD }}
          >
            <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
            คุยกับเราทาง LINE
          </a>
        </div>
      </div>

      {/* Directory */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px w-full" style={{ backgroundColor: "oklch(0.35 0.065 55 / 0.12)" }} />
        <div className="grid grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr] gap-x-8 gap-y-12 py-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-5">
            <Link href="/" className="w-fit">
              <span className={`${display.className} text-2xl tracking-wide`}>
                Date with <em className="italic" style={{ color: GOLD }}>Soul Love</em>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs opacity-65">
              พื้นที่ปลอดภัยสำหรับการเดินทางสู่ตัวเอง เรียนรู้เรื่องความสัมพันธ์
              และการเข้าใจตนเองผ่านประสบการณ์จริง
            </p>
            <div className="flex flex-col gap-1 text-sm">
              <span className="text-[11px] tracking-[0.25em] uppercase opacity-50">LINE Official</span>
              <a
                href={LINE_OA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit font-medium transition-colors hover:text-[oklch(0.62_0.12_75)]"
              >
                @073wlzuq
              </a>
              <span className="text-xs opacity-50">ตอบกลับภายใน 24 ชม. · จันทร์ – เสาร์</span>
            </div>
          </div>

          {/* Link groups */}
          {linkGroups.map((group) => (
            <nav key={group.title} aria-label={group.title} className="flex flex-col gap-5">
              <h3 className={`${serifThai.className} text-sm font-medium tracking-wide`} style={{ color: GOLD }}>
                {group.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="relative text-sm opacity-70 hover:opacity-100 transition-opacity after:absolute after:left-0 after:-bottom-0.5 after:h-px after:w-0 after:bg-current after:transition-all after:duration-300 hover:after:w-full"
                    >
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
      <div style={{ borderTop: "1px solid oklch(0.35 0.065 55 / 0.12)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs" style={{ color: "oklch(0.35 0.065 55 / 0.6)" }}>
          <p className="tracking-wide">© {new Date().getFullYear()} Date with Soul Love · สงวนลิขสิทธิ์</p>
          <nav aria-label="ข้อกฎหมาย" className="flex items-center gap-6">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-[var(--brand-brown)]">
                {link.label}
              </Link>
            ))}
          </nav>
          <p className={`${display.className} italic text-sm`} style={{ color: GOLD_SOFT }}>
            for every soul
          </p>
        </div>
      </div>
    </footer>
  );
}

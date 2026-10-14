import Navbar from "@/components/navbar";
import Link from "next/link";
import { MessageCircle, Clock, Sparkles, HelpCircle, CreditCard, CalendarDays, ArrowUpRight } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/site/page-hero";
import { Reveal } from "@/components/motion/reveal";

export const metadata = {
  title: "ติดต่อเรา | Date with Soul Love",
  description: "ติดต่อ Date with Soul Love ผ่าน LINE Official Account",
};

const LINE_OA_URL = "https://line.me/R/ti/p/@073wlzuq";
const LINE_ID = "@073wlzuq";

const topics = [
  { icon: Sparkles, title: "แนะนำคลาส", desc: "ยังเลือกไม่ได้? บอกเราว่าคุณสนใจเรื่องอะไร เราช่วยแนะนำคลาสที่เหมาะกับคุณ" },
  { icon: CreditCard, title: "การชำระเงิน", desc: "สอบถามเรื่องสลิป ยอดชำระ หรือสถานะการตรวจสอบการชำระเงิน" },
  { icon: CalendarDays, title: "เปลี่ยนรอบ / ยกเลิก", desc: "ต้องการเปลี่ยนวันเรียนหรือยกเลิกการจอง ทักมาได้เลย" },
];

const selfHelp = [
  { icon: HelpCircle, label: "คำถามที่พบบ่อย", href: "/faq" },
  { icon: CreditCard, label: "ตรวจสอบสถานะการจอง", href: "/bookings" },
  { icon: CalendarDays, label: "วิธีการจอง", href: "/how-it-works" },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-brand-brown">
      <Navbar />

      <PageHero
        eyebrow="Get in touch"
        title="ติดต่อเรา"
        highlight="anytime"
        description="ทีมงานพร้อมดูแลทุกคำถาม ไม่ว่าจะเป็นเรื่องคลาส การจอง หรือข้อสงสัยอื่นๆ"
      />

      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-24">
        {/* Primary: LINE */}
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-lux-line bg-brand-brown p-8 text-white sm:p-12">
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl"
              style={{ background: "var(--brand-yellow)" }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full opacity-20 blur-3xl"
              style={{ background: "var(--brand-red)" }}
              aria-hidden
            />

            <div className="relative grid items-center gap-10 md:grid-cols-[1.3fr_1fr]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-brand-yellow">LINE Official Account</p>
                <h2 className="mt-4 text-3xl font-semibold leading-snug sm:text-4xl">
                  คุยกับเราได้ทันที <span className="font-display italic font-normal text-brand-yellow">ทาง LINE</span>
                </h2>
                <p className="mt-4 max-w-md leading-relaxed text-white/70">
                  ช่องทางที่เร็วที่สุดในการติดต่อทีมงาน และเป็นช่องทางเดียวกับที่ระบบใช้แจ้งสถานะการจองของคุณ
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm text-white/60">
                  <Clock className="h-4 w-4" />
                  ตอบกลับภายใน 24 ชม. · จันทร์ – เสาร์
                </div>
              </div>

              <div className="flex flex-col items-start gap-4 md:items-end">
                <p className="font-display text-4xl tracking-wide text-white sm:text-5xl">{LINE_ID}</p>
                <a
                  href={LINE_OA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 rounded-full bg-[#06C755] px-8 py-4 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-12px_#06C755]"
                >
                  <MessageCircle className="h-5 w-5" />
                  เพิ่มเพื่อนใน LINE
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Topics */}
        <section className="mt-20 md:mt-28">
          <Reveal>
            <SectionHeading eyebrow="We can help with" title="เรื่องที่เราช่วยได้" className="mb-10" />
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {topics.map(({ icon: Icon, title, desc }, i) => (
              <Reveal key={title} delay={i * 100} className="h-full">
                <div className="h-full rounded-2xl border border-lux-line bg-white p-7 transition-all duration-500 hover:-translate-y-1 hover:border-lux-gold-soft hover:shadow-[0_20px_40px_-24px_oklch(0.35_0.065_55/0.35)]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lux-cream text-lux-gold">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-lux-muted">{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Self help */}
        <Reveal className="mt-20 rounded-3xl border border-lux-line bg-lux-cream p-8 text-center sm:p-10 md:mt-28">
          <p className="font-display text-lg italic text-lux-gold">Before you message us</p>
          <h2 className="mt-2 text-2xl font-semibold">อาจมีคำตอบรอคุณอยู่แล้ว</h2>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            {selfHelp.map(({ icon: Icon, label, href }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-2 rounded-full border border-lux-line bg-white px-5 py-2.5 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-brand-brown"
              >
                <Icon className="h-4 w-4 text-lux-gold" />
                {label}
              </Link>
            ))}
          </div>
        </Reveal>
      </main>
    </div>
  );
}

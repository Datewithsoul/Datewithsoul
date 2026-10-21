import Navbar from "@/components/navbar";
import Link from "next/link";
import {
  LogIn,
  CalendarDays,
  ClipboardPenLine,
  QrCode,
  BadgeCheck,
  MessageCircle,
  CreditCard,
  HelpCircle,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { PageHero, SectionHeading } from "@/components/site/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "วิธีการจอง",
  description:
    "ขั้นตอนการจองคลาสเรียนและเวิร์กชอปของ Date with Soul Love",
  path: "/how-it-works",
});

const steps = [
  {
    icon: LogIn,
    title: "เข้าสู่ระบบด้วย LINE",
    description: "เข้าสู่ระบบก่อนเริ่มจอง เพื่อให้ระบบบันทึกการจองและแจ้งสถานะให้คุณทาง LINE ได้ทันที",
  },
  {
    icon: CalendarDays,
    title: "เลือกคลาสและรอบเวลา",
    description: "เลือกคลาส วันที่ และช่วงเวลาที่สะดวก จะจองทีละคลาสหรือใส่ตะกร้าหลายคลาสพร้อมกันก็ได้",
  },
  {
    icon: ClipboardPenLine,
    title: "กรอกข้อมูลผู้จอง",
    description: "ตรวจสอบชื่อ อีเมล และเบอร์โทร เลือกจำนวนที่นั่ง ใส่โค้ดส่วนลด (ถ้ามี) แล้วกดยืนยันการจอง",
  },
  {
    icon: QrCode,
    title: "ชำระเงินภายใน 10 นาที",
    description: "สแกน QR พร้อมเพย์ตามยอดที่แสดง แล้วอัปโหลดสลิปในหน้าชำระเงิน ระบบจะกันที่นั่งไว้ให้ระหว่างนี้",
  },
  {
    icon: BadgeCheck,
    title: "รับการยืนยัน",
    description: "แอดมินตรวจสลิปแล้วสถานะจะเปลี่ยนเป็นยืนยันแล้ว พร้อมแจ้งเตือนทาง LINE และเตือนก่อนวันเรียน",
  },
];

const faqs = [
  {
    q: "จองได้กี่ที่นั่ง?",
    a: "เลือกจำนวนที่นั่งได้ตามที่ระบบแสดงในรอบนั้น หากที่นั่งไม่พอ ให้เลือกรอบอื่นหรือติดต่อเรา",
  },
  {
    q: "ชำระเงินด้วยวิธีใดได้บ้าง?",
    a: "ชำระผ่าน QR พร้อมเพย์ที่แสดงในหน้าชำระเงิน แล้วอัปโหลดสลิปในระบบภายในเวลาที่กำหนด",
  },
  {
    q: "หากต้องการยกเลิก ทำอย่างไร?",
    a: "เปิดหน้าตรวจสอบสถานะการจองเพื่อดูรายการ หากต้องการยกเลิกหรือเปลี่ยนรอบ กดส่งคำขอได้จากหน้านั้น หรือติดต่อเราผ่าน LINE Official Account",
  },
  {
    q: "ไม่ได้รับการยืนยันทาง LINE ทำอย่างไร?",
    a: "ระบบจะแจ้งเตือนเมื่อแอดมินตรวจสอบสลิปแล้ว ระหว่างนี้ดูสถานะล่าสุดได้ที่หน้าตรวจสอบสถานะการจอง หากมีปัญหาให้ติดต่อ LINE Official Account",
  },
];

const quickLinks = [
  { icon: CalendarDays, label: "ดูตารางเรียน", href: "/schedule", desc: "รอบคลาสที่กำลังจะมาถึง" },
  { icon: CreditCard, label: "ตรวจสอบสถานะการจอง", href: "/bookings", desc: "ติดตามการชำระเงินและการยืนยัน" },
  { icon: MessageCircle, label: "ติดต่อเรา", href: "/contact", desc: "พูดคุยกับทีมงานทาง LINE" },
  { icon: HelpCircle, label: "คำถามที่พบบ่อย", href: "/faq", desc: "คำตอบสำหรับข้อสงสัยทั่วไป" },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-brand-brown">
      <Navbar />

      <PageHero
        eyebrow="How it works"
        title="จองคลาสง่ายๆ"
        highlight="in 5 steps"
        description="จองได้ด้วยตัวเองผ่านระบบ ตั้งแต่เลือกคลาสจนถึงได้รับการยืนยัน ใช้เวลาไม่กี่นาที"
      >
        <Link
          href="/classes"
          className="group inline-flex items-center gap-2 rounded-full bg-brand-brown px-8 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
        >
          ดูคลาสที่เปิดจอง
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
        </Link>
      </PageHero>

      {/* Steps */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <SectionHeading eyebrow="The journey" title="ขั้นตอนการจอง" className="mb-14 md:mb-20" />
        </Reveal>

        <ol className="relative">
          {/* Center spine on desktop, left spine on mobile */}
          <span className="absolute bottom-6 left-7 top-6 w-px bg-linear-to-b from-lux-gold via-lux-gold-soft to-transparent md:left-1/2" aria-hidden />

          {steps.map((step, i) => {
            const Icon = step.icon;
            const right = i % 2 === 1;
            return (
              <li key={step.title} className="relative grid grid-cols-[3.5rem_1fr] gap-5 pb-12 last:pb-0 md:grid-cols-[1fr_4rem_1fr] md:gap-8">
                {/* Node */}
                <Reveal delay={60} className="relative z-10 md:col-start-2 md:row-start-1">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-lux-gold-soft bg-white text-lux-gold shadow-sm md:h-16 md:w-16">
                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                  </span>
                </Reveal>

                {/* Card */}
                <Reveal
                  delay={140}
                  className={right ? "md:col-start-3 md:row-start-1" : "md:col-start-1 md:row-start-1 md:text-right"}
                >
                  <div className="rounded-2xl border border-lux-line bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-lux-gold-soft hover:shadow-[0_20px_40px_-24px_oklch(0.35_0.065_55/0.35)]">
                    <p className="font-display text-sm italic text-lux-gold">Step {String(i + 1).padStart(2, "0")}</p>
                    <h3 className="mt-1 text-xl font-semibold">{step.title}</h3>
                    <p className="mt-2 leading-relaxed text-lux-muted">{step.description}</p>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Quick links */}
      <section className="border-y border-lux-line bg-lux-cream px-4 py-16 sm:px-6 md:py-20">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <SectionHeading eyebrow="Shortcuts" title="ลิงก์ที่เป็นประโยชน์" className="mb-10" />
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {quickLinks.map(({ icon: Icon, label, href, desc }, i) => (
              <Reveal key={href} delay={i * 80}>
                <Link
                  href={href}
                  className="group flex items-center gap-4 rounded-2xl border border-lux-line bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-lux-gold-soft hover:shadow-md"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lux-cream text-lux-gold transition-colors group-hover:bg-brand-brown group-hover:text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{label}</span>
                    <span className="block text-sm text-lux-muted">{desc}</span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-lux-muted transition-all group-hover:rotate-45 group-hover:text-brand-brown" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
        <Reveal>
          <SectionHeading eyebrow="Questions" title="คำถามที่พบบ่อย" className="mb-10" />
        </Reveal>
        <div className="divide-y divide-lux-line border-y border-lux-line">
          {faqs.map((item, i) => (
            <Reveal key={item.q} delay={i * 70}>
              <details className="faq group py-2">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-semibold transition-colors hover:text-lux-gold [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-lux-line transition-all duration-300 group-open:rotate-45 group-open:border-lux-gold group-open:text-lux-gold">
                    <Plus className="h-4 w-4" />
                  </span>
                </summary>
                <p className="faq-body pb-5 pr-12 leading-relaxed text-lux-muted">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 text-center">
          <Link href="/faq" className="inline-flex items-center gap-1.5 text-sm font-semibold text-lux-gold underline-offset-4 hover:underline">
            ดูคำถามทั้งหมด <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}

import Navbar from "@/components/navbar";
import Link from "next/link";
import { MessageCircle, Plus, ArrowUpRight } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/site/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "คำถามที่พบบ่อย (FAQ)",
  description:
    "คำถามที่พบบ่อยเกี่ยวกับการจองคลาส การชำระเงิน และการยกเลิก",
  path: "/faq",
});

const faqCategories = [
  {
    category: "การจองคลาส",
    items: [
      {
        q: "จะจองคลาสได้อย่างไร?",
        a: "เลือกคลาสที่ต้องการจากหน้าคลาสเรียน กดปุ่ม 'จองเลย' เลือกจำนวนที่นั่ง กรอกข้อมูล แล้วทำการชำระเงินผ่านระบบ",
      },
      {
        q: "จองได้กี่ที่นั่งสูงสุด?",
        a: "สูงสุด 4 ที่นั่งต่อการจองหนึ่งครั้ง หากต้องการจำนวนมากกว่านี้ กรุณาติดต่อเราโดยตรงผ่าน LINE",
      },
      {
        q: "จองแล้วจะได้รับการยืนยันอย่างไร?",
        a: "หลังชำระเงินและทีมงานตรวจสอบสลิปแล้ว คุณจะได้รับข้อความยืนยันผ่าน LINE และสถานะจะอัปเดตในระบบ",
      },
      {
        q: "ตรวจสอบสถานะการจองได้ที่ไหน?",
        a: "เข้าสู่ระบบแล้วไปที่หน้า 'ตรวจสอบสถานะการจอง' หรือเมนู 'ประวัติการจอง' ในโปรไฟล์ของคุณ",
      },
    ],
  },
  {
    category: "การชำระเงิน",
    items: [
      {
        q: "ชำระเงินด้วยวิธีใดได้บ้าง?",
        a: "รับชำระผ่านการโอนเงินธนาคารและ PromptPay จากนั้นอัปโหลดสลิปยืนยันในระบบ",
      },
      {
        q: "ต้องชำระเงินภายในกี่วัน?",
        a: "กรุณาชำระเงินและอัปโหลดสลิปภายใน 24 ชั่วโมงหลังทำการจอง มิเช่นนั้นการจองจะถูกยกเลิกอัตโนมัติ",
      },
      {
        q: "ส่งสลิปชำระเงินอย่างไร?",
        a: "หลังโอนเงินแล้ว ไปที่หน้าชำระเงินในระบบ กดอัปโหลดรูปสลิป แล้วกดยืนยัน ทีมงานจะตรวจสอบภายใน 24 ชั่วโมง",
      },
      {
        q: "สลิปถูกปฏิเสธ ต้องทำอย่างไร?",
        a: "กรุณาติดต่อทีมงานผ่าน LINE พร้อมแนบรูปสลิปและรหัสการจอง เราจะช่วยตรวจสอบให้",
      },
    ],
  },
  {
    category: "การเปลี่ยนรอบเรียน",
    items: [
      {
        q: "ขอเปลี่ยนรอบเรียนได้หรือไม่?",
        a: "สามารถส่งคำขอเปลี่ยนรอบเรียนได้จากหน้าประวัติการจอง โดยทีมงานจะตรวจสอบที่นั่งว่างและแจ้งผลให้ทราบ",
      },
    ],
  },
  {
    category: "การเข้าเรียน",
    items: [
      {
        q: "คลาสจัดที่ไหน?",
        a: "สถานที่จัดคลาสจะแจ้งให้ทราบหลังยืนยันการจองแล้ว โดยทั่วไปจัดในกรุงเทพมหานคร",
      },
      {
        q: "ต้องเตรียมอะไรมาบ้าง?",
        a: "รายละเอียดสิ่งที่ต้องเตรียมจะแจ้งไปพร้อมกับข้อความยืนยันการจอง หรือสามารถสอบถามผ่าน LINE ได้เลย",
      },
      {
        q: "สายสามารถเข้าเรียนได้ไหม?",
        a: "กรุณาตรงเวลาเพื่อไม่รบกวนผู้เรียนคนอื่น หากมีเหตุฉุกเฉินกรุณาแจ้งล่วงหน้าผ่าน LINE",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-brand-brown">
      <Navbar />

      <PageHero
        eyebrow="Help center"
        title="คำถามที่พบบ่อย"
        highlight="FAQ"
        description="หาคำตอบที่ต้องการได้ที่นี่ หรือติดต่อเราโดยตรงหากยังสงสัย"
      >
        <nav aria-label="หมวดคำถาม" className="flex flex-wrap justify-center gap-2">
          {faqCategories.map((cat, i) => (
            <a
              key={cat.category}
              href={`#faq-${i}`}
              className="rounded-full border border-lux-line bg-white/80 px-5 py-2 text-sm font-medium backdrop-blur transition-all hover:-translate-y-0.5 hover:border-lux-gold hover:text-lux-gold"
            >
              {cat.category}
            </a>
          ))}
        </nav>
      </PageHero>

      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
        <div className="flex flex-col gap-16">
          {faqCategories.map((cat, ci) => (
            <section key={cat.category} id={`faq-${ci}`} className="scroll-mt-28">
              <Reveal>
                <SectionHeading align="left" eyebrow={`Topic ${String(ci + 1).padStart(2, "0")}`} title={cat.category} className="mb-6" />
              </Reveal>
              <div className="divide-y divide-lux-line border-y border-lux-line">
                {cat.items.map((item, i) => (
                  <Reveal key={item.q} delay={i * 60}>
                    <details className="faq group py-1">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-semibold transition-colors hover:text-lux-gold [&::-webkit-details-marker]:hidden">
                        {item.q}
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-lux-line transition-all duration-300 group-open:rotate-45 group-open:border-lux-gold group-open:text-lux-gold">
                          <Plus className="h-4 w-4" />
                        </span>
                      </summary>
                      <p className="faq-body pb-6 pr-12 leading-relaxed text-lux-muted">{item.a}</p>
                    </details>
                  </Reveal>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA */}
        <Reveal className="relative mt-20 overflow-hidden rounded-[2rem] bg-brand-brown p-10 text-center text-white sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-yellow opacity-25 blur-3xl" aria-hidden />
          <p className="relative font-display text-lg italic text-brand-yellow">Still curious?</p>
          <h2 className="relative mt-2 text-2xl font-semibold sm:text-3xl">ยังไม่พบคำตอบที่ต้องการ?</h2>
          <p className="relative mt-3 text-white/70">ติดต่อเราโดยตรง ทีมงานยินดีช่วยเหลือเสมอ</p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="https://line.me/R/ti/p/@073wlzuq"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#06C755] px-7 py-3.5 font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-12px_#06C755]"
            >
              <MessageCircle className="h-5 w-5" />
              ติดต่อผ่าน LINE
            </a>
            <Link
              href="/how-it-works"
              className="group inline-flex items-center gap-1.5 rounded-full border border-white/25 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
            >
              ดูวิธีการจอง <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
            </Link>
          </div>
        </Reveal>
      </main>
    </div>
  );
}

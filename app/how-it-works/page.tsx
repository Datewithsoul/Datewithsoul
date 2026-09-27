import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HowToBook } from "@/components/how-to-book";
import Link from "next/link";
import { MessageCircle, Calendar, CreditCard, HelpCircle, ChevronRight } from "lucide-react";

export const metadata = {
  title: "วิธีการจอง | Date with Soul Love",
  description: "ขั้นตอนการจองคลาสเรียนและเวิร์กชอปของ Date with Soul Love",
};

const faqs = [
  {
    q: "จองได้กี่ที่นั่ง?",
    a: "เลือกจำนวนที่นั่งได้ตามจำนวนที่ระบบแสดงในรอบนั้น หากที่นั่งไม่พอ ให้เลือกรอบอื่นหรือติดต่อเรา",
  },
  {
    q: "ชำระเงินด้วยวิธีใดได้บ้าง?",
    a: "ชำระผ่าน QR พร้อมเพย์ที่แสดงในหน้าชำระเงิน แล้วอัปโหลดสลิปในระบบภายในเวลาที่กำหนด",
  },
  {
    q: "หากต้องการยกเลิก ทำอย่างไร?",
    a: "เปิดหน้าประวัติการจองเพื่อตรวจสอบสถานะ หากต้องการยกเลิกหรือขอความช่วยเหลือ ให้ติดต่อเราผ่าน LINE Official Account",
  },
  {
    q: "ไม่ได้รับการยืนยันทางอีเมล/LINE ทำอย่างไร?",
    a: "ระบบจะแจ้งเตือนเมื่อแอดมินตรวจสอบสลิปแล้ว ระหว่างนี้ดูสถานะล่าสุดได้ที่หน้าประวัติการจอง หากมีปัญหาให้ติดต่อ LINE Official Account",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="py-14 md:py-20 text-center px-4" style={{ backgroundColor: "var(--brand-yellow)" }}>
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full font-black text-sm mb-4 bg-white"
            style={{ border: "var(--pop-outline)", color: "var(--brand-brown)" }}
          >
            <HelpCircle className="w-4 h-4" />
            คู่มือการจอง
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-4" style={{ color: "var(--brand-brown)" }}>
            วิธีการจองคลาส<br />
            <span style={{ color: "var(--brand-red)" }}>ง่ายมาก!</span>
          </h1>
          <p className="text-base md:text-lg font-medium max-w-xl mx-auto" style={{ color: "var(--brand-brown)" }}>
            จองผ่านระบบได้ด้วยตัวเอง ตั้งแต่เลือกคลาสจนถึงส่งสลิปชำระเงิน
          </p>
          <Link
            href="/classes"
            className="pop-btn-red inline-flex items-center gap-2 mt-7 px-6 py-3 rounded-full text-sm"
          >
            ดูคลาสที่เปิดจอง <ChevronRight className="w-4 h-4" />
          </Link>
        </section>

        {/* Steps */}
        <HowToBook />

        {/* Quick links */}
        <section className="py-10 px-4 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-black text-center mb-6" style={{ color: "var(--brand-brown)" }}>
              ลิงก์ที่เป็นประโยชน์
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Calendar, label: "ดูตารางเรียน", href: "/schedule", desc: "คลาสที่จะมาถึงทั้งหมด" },
                { icon: CreditCard, label: "ตรวจสอบสถานะการจอง", href: "/bookings", desc: "ดูสถานะการจองของคุณ" },
                { icon: MessageCircle, label: "ติดต่อเรา", href: "/contact", desc: "LINE, Instagram, อีเมล" },
                { icon: HelpCircle, label: "FAQ", href: "/faq", desc: "คำถามที่พบบ่อย" },
              ].map(({ icon: Icon, label, href, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl group hover:-translate-y-0.5 transition-transform"
                  style={{ border: "var(--pop-outline)", boxShadow: "3px 3px 0 var(--brand-brown)" }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "var(--brand-yellow)", border: "1.5px solid var(--brand-brown)" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: "var(--brand-brown)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm" style={{ color: "var(--brand-brown)" }}>{label}</p>
                    <p className="text-xs font-medium" style={{ color: "var(--brand-brown-mid)" }}>{desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0 opacity-40" style={{ color: "var(--brand-brown)" }} />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ preview */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-8" style={{ color: "var(--brand-brown)" }}>
              คำถามที่พบบ่อย
            </h2>
            <div className="flex flex-col gap-4">
              {faqs.map((item) => (
                <div
                  key={item.q}
                  className="rounded-2xl bg-white p-5"
                  style={{ border: "var(--pop-outline)", boxShadow: "3px 3px 0 var(--brand-brown)" }}
                >
                  <p className="font-black mb-1.5" style={{ color: "var(--brand-brown)" }}>Q: {item.q}</p>
                  <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--brand-brown-mid)" }}>{item.a}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 font-bold text-sm underline underline-offset-4"
                style={{ color: "var(--brand-red)" }}
              >
                ดู FAQ ทั้งหมด <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

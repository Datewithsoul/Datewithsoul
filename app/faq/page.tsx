import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { MessageCircle, HelpCircle, ChevronDown } from "lucide-react";

export const metadata = {
  title: "คำถามที่พบบ่อย (FAQ) | Date with Soul Love",
  description: "คำถามที่พบบ่อยเกี่ยวกับการจองคลาส การชำระเงิน และการยกเลิก",
};

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
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="py-14 text-center px-4" style={{ backgroundColor: "var(--brand-yellow)" }}>
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full font-black text-sm mb-4 bg-white"
            style={{ border: "var(--pop-outline)", color: "var(--brand-brown)" }}
          >
            <HelpCircle className="w-4 h-4" />
            FAQ
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-3" style={{ color: "var(--brand-brown)" }}>
            คำถามที่<span style={{ color: "var(--brand-red)" }}>พบบ่อย</span>
          </h1>
          <p className="text-base font-medium max-w-md mx-auto" style={{ color: "var(--brand-brown)" }}>
            หาคำตอบที่ต้องการได้ที่นี่ หรือติดต่อเราโดยตรงหากยังสงสัย
          </p>
        </section>

        {/* FAQ list */}
        <section className="py-14 px-4">
          <div className="max-w-3xl mx-auto flex flex-col gap-10">
            {faqCategories.map((cat) => (
              <div key={cat.category}>
                <h2 className="text-2xl font-black mb-5" style={{ color: "var(--brand-brown)" }}>
                  {cat.category}
                </h2>
                <div className="flex flex-col gap-3">
                  {cat.items.map((item, i) => (
                    <details
                      key={i}
                      className="group rounded-2xl bg-white overflow-hidden"
                      style={{ border: "var(--pop-outline)", boxShadow: "3px 3px 0 var(--brand-brown)" }}
                    >
                      <summary className="flex items-center justify-between gap-3 p-5 cursor-pointer list-none font-black" style={{ color: "var(--brand-brown)" }}>
                        <span>{item.q}</span>
                        <ChevronDown className="w-4 h-4 shrink-0 transition-transform group-open:rotate-180" style={{ color: "var(--brand-brown)" }} />
                      </summary>
                      <div className="px-5 pb-5 text-sm font-medium leading-relaxed" style={{ color: "var(--brand-brown-mid)" }}>
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          className="py-12 px-4 text-center"
          style={{ backgroundColor: "var(--brand-brown)" }}
        >
          <h2 className="text-2xl font-black text-white mb-3">ยังไม่พบคำตอบที่ต้องการ?</h2>
          <p className="text-white/70 font-medium mb-6">ติดต่อเราโดยตรง ทีมงานยินดีช่วยเหลือเสมอ</p>
          <a
            href="https://line.me/R/ti/p/@073wlzuq"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-black text-white"
            style={{ backgroundColor: "#06C755" }}
          >
            <MessageCircle className="w-5 h-5" />
            ติดต่อผ่าน LINE
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}

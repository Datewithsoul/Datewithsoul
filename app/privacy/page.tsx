import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { Shield, MessageCircle } from "lucide-react";

export const metadata = {
  title: "นโยบายความเป็นส่วนตัว | Date with Soul Love",
  description: "นโยบายความเป็นส่วนตัวของ Date with Soul Love",
};

export default function PrivacyPage() {
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
            <Shield className="w-4 h-4" />
            ความเป็นส่วนตัว
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-3" style={{ color: "var(--brand-brown)" }}>
            นโยบายความ<span style={{ color: "var(--brand-red)" }}>เป็นส่วนตัว</span>
          </h1>
          <p className="text-sm font-medium" style={{ color: "var(--brand-brown)" }}>
            อัปเดตล่าสุด: สิงหาคม 2026
          </p>
        </section>

        {/* Content */}
        <section className="py-14 px-4">
          <div className="max-w-3xl mx-auto">
            <div
              className="rounded-2xl bg-white p-8 flex flex-col gap-8"
              style={{ border: "var(--pop-outline)", boxShadow: "var(--pop-shadow)" }}
            >
              <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--brand-brown-mid)" }}>
                Date with Soul Love ให้ความสำคัญกับความเป็นส่วนตัวของผู้ใช้บริการ นโยบายนี้อธิบายวิธีที่เราเก็บรวบรวม ใช้ และปกป้องข้อมูลส่วนบุคคลของคุณ
              </p>

              {[
                {
                  title: "1. ข้อมูลที่เราเก็บรวบรวม",
                  content: [
                    "ข้อมูลบัญชี LINE: ชื่อแสดง, รูปโปรไฟล์, LINE User ID (จากการล็อกอินด้วย LINE Login)",
                    "ข้อมูลการจอง: ชื่อ, เบอร์โทรศัพท์, จำนวนที่นั่ง, ประวัติการจอง",
                    "ข้อมูลการชำระเงิน: สลิปการโอนเงิน (ไม่เก็บข้อมูลบัตรเครดิต/บัตรเดบิต)",
                    "ข้อมูลการใช้งาน: หน้าที่เยี่ยมชม, เวลาใช้งาน (ผ่าน cookies และ analytics)",
                  ],
                },
                {
                  title: "2. วัตถุประสงค์การใช้ข้อมูล",
                  content: [
                    "เพื่อดำเนินการจองและยืนยันการจอง",
                    "เพื่อส่งการแจ้งเตือนและอัปเดตเกี่ยวกับการจองผ่าน LINE",
                    "เพื่อตรวจสอบการชำระเงิน",
                    "เพื่อส่งข่าวสารและโปรโมชั่น (สามารถยกเลิกรับได้ทุกเมื่อ)",
                    "เพื่อปรับปรุงบริการและประสบการณ์ผู้ใช้",
                  ],
                },
                {
                  title: "3. การเปิดเผยข้อมูลแก่บุคคลที่สาม",
                  content: [
                    "เราไม่ขายหรือเช่าข้อมูลส่วนบุคคลของคุณแก่บุคคลภายนอก",
                    "เราอาจแชร์ข้อมูลกับผู้ให้บริการที่ช่วยดำเนินธุรกิจ (เช่น Supabase, Vercel) ภายใต้ข้อตกลงการรักษาความลับ",
                    "เราอาจเปิดเผยข้อมูลหากกฎหมายกำหนด",
                  ],
                },
                {
                  title: "4. การรักษาความปลอดภัยของข้อมูล",
                  content: [
                    "ข้อมูลทั้งหมดถูกส่งผ่าน HTTPS (SSL/TLS)",
                    "ข้อมูลถูกเก็บในเซิร์ฟเวอร์ที่มีการรักษาความปลอดภัยสูง",
                    "เราทบทวนและอัปเดตมาตรการรักษาความปลอดภัยอย่างสม่ำเสมอ",
                  ],
                },
                {
                  title: "5. สิทธิ์ของคุณ",
                  content: [
                    "คุณมีสิทธิ์เข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลของคุณ",
                    "คุณมีสิทธิ์ถอนความยินยอมในการรับข่าวสารได้ทุกเมื่อ",
                    "หากต้องการใช้สิทธิ์ กรุณาติดต่อเราผ่าน LINE หรืออีเมล",
                  ],
                },
                {
                  title: "6. คุกกี้ (Cookies)",
                  content: [
                    "เราใช้คุกกี้เพื่อปรับปรุงประสบการณ์การใช้งานและวิเคราะห์การใช้งานเว็บไซต์",
                    "คุณสามารถตั้งค่าเบราว์เซอร์เพื่อปฏิเสธคุกกี้ได้ แต่อาจส่งผลต่อการทำงานของบางฟีเจอร์",
                  ],
                },
              ].map((section) => (
                <div key={section.title}>
                  <h2 className="text-xl font-black mb-3" style={{ color: "var(--brand-brown)" }}>
                    {section.title}
                  </h2>
                  <ul className="flex flex-col gap-2">
                    {section.content.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm font-medium leading-relaxed" style={{ color: "var(--brand-brown-mid)" }}>
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "var(--brand-yellow)", border: "1px solid var(--brand-brown)" }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div
                className="rounded-xl p-4 flex items-start gap-3"
                style={{ backgroundColor: "var(--brand-yellow)", border: "var(--pop-outline)" }}
              >
                <MessageCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "var(--brand-brown)" }} />
                <p className="text-sm font-bold" style={{ color: "var(--brand-brown)" }}>
                  หากมีคำถามเกี่ยวกับนโยบายนี้ ติดต่อเราได้ที่{" "}
                  <a href="mailto:hello@datewithsoullove.com" className="underline" style={{ color: "var(--brand-red)" }}>
                    hello@datewithsoullove.com
                  </a>
                  {" "}หรือ{" "}
                  <a href="https://line.me/R/ti/p/@073wlzuq" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--brand-red)" }}>
                    LINE Official Account
                  </a>
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm font-medium">
              <Link href="/terms" className="underline underline-offset-4" style={{ color: "var(--brand-red)" }}>
                เงื่อนไขการจอง
              </Link>
              <Link href="/faq" className="underline underline-offset-4" style={{ color: "var(--brand-red)" }}>
                FAQ
              </Link>
              <Link href="/contact" className="underline underline-offset-4" style={{ color: "var(--brand-red)" }}>
                ติดต่อเรา
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

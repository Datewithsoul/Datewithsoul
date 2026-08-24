import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { FileText, MessageCircle } from "lucide-react";

export const metadata = {
  title: "เงื่อนไขการจอง | Date with Soul Love",
  description: "เงื่อนไขและข้อกำหนดในการจองคลาสเรียนของ Date with Soul Love",
};

export default function TermsPage() {
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
            <FileText className="w-4 h-4" />
            ข้อกำหนด
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-3" style={{ color: "var(--brand-brown)" }}>
            เงื่อนไข<span style={{ color: "var(--brand-red)" }}>การจอง</span>
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
              {[
                {
                  title: "1. การจองและยืนยัน",
                  content: [
                    "การจองจะสมบูรณ์เมื่อทีมงานได้รับการชำระเงินและยืนยันการจองแล้วเท่านั้น",
                    "กรุณาชำระเงินและส่งสลิปภายใน 24 ชั่วโมงหลังทำการจอง มิฉะนั้นการจองจะถูกยกเลิกอัตโนมัติ",
                    "ทีมงานจะยืนยันการจองผ่าน LINE Official Account ภายใน 24 ชั่วโมงทำการ (จันทร์–เสาร์)",
                  ],
                },
                {
                  title: "2. การชำระเงิน",
                  content: [
                    "ชำระเงินผ่านการโอนเงินธนาคารหรือ PromptPay ตามบัญชีที่ระบุในระบบ",
                    "ต้องอัปโหลดสลิปยืนยันการชำระเงินผ่านระบบหลังโอนเงินทุกครั้ง",
                    "ราคาที่แสดงในระบบเป็นราคาสุดท้าย รวม VAT แล้ว",
                  ],
                },
                {
                  title: "3. การยกเลิกและการเปลี่ยนแปลง",
                  content: [
                    "ยกเลิกก่อนวันเรียนมากกว่า 7 วัน: คืนเงิน 100%",
                    "ยกเลิกก่อนวันเรียน 3–7 วัน: คืนเงิน 50%",
                    "ยกเลิกน้อยกว่า 3 วันก่อนวันเรียน: ไม่สามารถคืนเงินได้",
                    "หากคลาสถูกยกเลิกโดยทางร้าน จะคืนเงินเต็มจำนวนภายใน 7 วันทำการ",
                  ],
                },
                {
                  title: "4. พฤติกรรมในคลาส",
                  content: [
                    "ผู้เข้าร่วมควรเคารพซึ่งกันและกันและสร้างบรรยากาศที่ดีในการเรียน",
                    "ห้ามบันทึกภาพหรือวิดีโอผู้เข้าร่วมคนอื่นโดยไม่ได้รับอนุญาต",
                    "ทางร้านขอสงวนสิทธิ์ในการปฏิเสธการเข้าร่วมหากพฤติกรรมไม่เหมาะสม",
                  ],
                },
                {
                  title: "5. ข้อจำกัดความรับผิดชอบ",
                  content: [
                    "ทางร้านไม่รับผิดชอบต่อความเสียหายหรือบาดเจ็บที่เกิดขึ้นระหว่างกิจกรรม ยกเว้นกรณีที่เกิดจากความประมาทของทางร้านโดยตรง",
                    "ผู้เข้าร่วมควรแจ้งข้อจำกัดทางร่างกายหรือสุขภาพก่อนเข้าคลาส",
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
                  มีข้อสงสัยเกี่ยวกับเงื่อนไข กรุณาติดต่อเราผ่าน{" "}
                  <a href="https://line.me/R/ti/p/@073wlzuq" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "var(--brand-red)" }}>
                    LINE Official Account
                  </a>
                  {" "}ก่อนทำการจอง
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm font-medium">
              <Link href="/privacy" className="underline underline-offset-4" style={{ color: "var(--brand-red)" }}>
                นโยบายความเป็นส่วนตัว
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

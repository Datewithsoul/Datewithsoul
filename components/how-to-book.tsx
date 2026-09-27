import { LogIn, Calendar, ClipboardPenLine, CreditCard, CheckCircle, Pin, Heart, Sparkles } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: LogIn,
    title: "เข้าสู่ระบบ",
    description: "เข้าสู่ระบบด้วย LINE ก่อนเริ่มจอง เพื่อให้ระบบบันทึกการจองและติดตามสถานะให้คุณได้",
    bg: "var(--brand-yellow)",
    color: "var(--brand-brown)",
  },
  {
    step: "02",
    icon: Calendar,
    title: "เลือกคลาสและรอบเวลา",
    description: "เลือกคลาส วันที่ และช่วงเวลาที่ต้องการ จากนั้นกดจองคลาสเพื่อเริ่มกรอกข้อมูล",
    bg: "#06C755",
    color: "#fff",
  },
  {
    step: "03",
    icon: ClipboardPenLine,
    title: "กรอกข้อมูลผู้จอง",
    description: "ตรวจสอบชื่อ-นามสกุล อีเมล และเบอร์โทร เลือกจำนวนที่นั่ง แล้วกดยืนยันการจอง",
    bg: "var(--brand-yellow)",
    color: "var(--brand-brown)",
  },
  {
    step: "04",
    icon: CreditCard,
    title: "ชำระเงินภายใน 10 นาที",
    description: "สแกน QR พร้อมเพย์ตามยอดที่ระบบแสดง แล้วอัปโหลดสลิปในหน้าชำระเงิน",
    bg: "var(--brand-red)",
    color: "#fff",
  },
  {
    step: "05",
    icon: CheckCircle,
    title: "รอแอดมินตรวจสอบ",
    description: "เมื่อสลิปผ่านการตรวจสอบ สถานะจะเปลี่ยนเป็นยืนยันแล้ว ดูความคืบหน้าได้ที่ประวัติการจอง",
    bg: "var(--brand-brown)",
    color: "#fff",
  },
];

export function HowToBook() {
  return (
    <section id="how-to-book" className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full font-black text-sm mb-4"
            style={{
              backgroundColor: "var(--brand-yellow)",
              border: "var(--pop-outline)",
              boxShadow: "3px 3px 0 var(--brand-brown)",
              color: "var(--brand-brown)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            ขั้นตอนการจอง
          </div>
          <h2
            className="text-4xl md:text-5xl font-black leading-tight mb-3"
            style={{ color: "var(--brand-brown)" }}
          >
            วิธีจองคลาส{" "}
            <span style={{ color: "var(--brand-red)" }}>ง่ายมาก!</span>
          </h2>
          <p className="font-medium" style={{ color: "var(--brand-brown-mid)" }}>
            ตั้งแต่เลือกคลาสจนถึงยืนยันการชำระเงิน
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="pop-card rounded-2xl bg-white p-6 flex flex-col items-center text-center"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: step.bg,
                    border: "var(--pop-outline)",
                    boxShadow: "3px 3px 0 var(--brand-brown)",
                  }}
                >
                  <Icon className="w-7 h-7" style={{ color: step.color }} strokeWidth={2} />
                </div>
                <span
                  className="text-xs font-black tracking-widest uppercase mb-1"
                  style={{ color: "var(--brand-brown-mid)" }}
                >
                  ขั้นตอน {step.step}
                </span>
                <h3
                  className="font-black text-base mb-2 leading-tight"
                  style={{ color: "var(--brand-brown)" }}
                >
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed font-medium" style={{ color: "var(--brand-brown-mid)" }}>
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Note */}
        <div
          className="mt-10 rounded-2xl p-6"
          style={{
            backgroundColor: "var(--brand-yellow)",
            border: "var(--pop-outline)",
            boxShadow: "var(--pop-shadow)",
          }}
        >
          <p
            className="flex items-start justify-center gap-2 font-bold text-sm text-center flex-wrap"
            style={{ color: "var(--brand-brown)" }}
          >
            <Pin className="w-4 h-4 flex-shrink-0 mt-0.5" />
            มีข้อสงสัยสามารถสอบถามได้ที่{" "}
            <a
              href="https://line.me/R/ti/p/@073wlzuq"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 font-black"
              style={{ color: "var(--brand-red)" }}
            >
              LINE Official Account
            </a>{" "}
            ได้เลยนะคะ ยินดีตอบทุกคำถาม
            <Heart className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--brand-red)" }} fill="currentColor" />
          </p>
        </div>
      </div>
    </section>
  );
}

import { MessageCircle, Sparkles } from "lucide-react";

export function Contact() {
  return (
    <section id="contact" className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Left — CTA block */}
          <div
            className="rounded-3xl p-8 md:p-10"
            style={{
              backgroundColor: "var(--brand-brown)",
              border: "var(--pop-outline)",
              boxShadow: "var(--pop-shadow-lg)",
            }}
          >
            <div
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-black text-xs mb-5"
              style={{
                backgroundColor: "var(--brand-yellow)",
                border: "var(--pop-outline)",
                color: "var(--brand-brown)",
              }}
            >
              <Sparkles className="w-3 h-3" />
              ติดต่อเรา
            </div>

            <h2
              className="text-3xl md:text-4xl font-black leading-tight mb-4 text-white"
            >
              มีคำถาม?{" "}
              <span style={{ color: "var(--brand-yellow)" }}>
                คุยกับเราได้เลย
              </span>
            </h2>

            <p className="text-white/70 font-medium leading-relaxed mb-8 text-base">
              ทีมงานพร้อมช่วยคุณเสมอ ตอบคำถาม แนะนำคลาส
              และช่วยให้คุณเลือกสิ่งที่เหมาะสมที่สุด
            </p>

            {/* LINE primary CTA */}
            <a
              href="https://line.me/R/ti/p/@073wlzuq"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl font-black text-base text-white pop-btn-red"
              style={{ backgroundColor: "#06C755", borderColor: "white" }}
            >
              <MessageCircle className="w-5 h-5" />
              เพิ่มเพื่อนใน LINE
            </a>

            <p className="text-white/40 text-xs mt-3 font-medium">
              ตอบรับภายใน 24 ชม. (จันทร์ – เสาร์)
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

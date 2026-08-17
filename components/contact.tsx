import { MessageCircle, Mail, MapPin, Sparkles } from "lucide-react";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const contacts = [
  {
    icon: MessageCircle,
    label: "LINE Official",
    value: "@datewithsoullove",
    href: "https://line.me/R/ti/p/@datewithsoullove",
    iconBg: "#06C755",
    iconColor: "#fff",
  },
  {
    icon: InstagramIcon,
    label: "Instagram",
    value: "@datewithsoullove",
    href: "https://instagram.com/datewithsoullove",
    iconBg: "#E1306C",
    iconColor: "#fff",
  },
  {
    icon: Mail,
    label: "อีเมล",
    value: "hello@datewithsoullove.com",
    href: "mailto:hello@datewithsoullove.com",
    iconBg: "var(--brand-yellow)",
    iconColor: "var(--brand-brown)",
  },
  {
    icon: MapPin,
    label: "สถานที่",
    value: "กรุงเทพมหานคร (แจ้งก่อนวันจริง)",
    href: null,
    iconBg: "var(--brand-brown-light)",
    iconColor: "var(--brand-brown)",
  },
];

export function Contact() {
  return (
    <section id="contact" className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
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
              href="https://line.me/R/ti/p/@datewithsoullove"
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

          {/* Right — contact cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contacts.map((item, i) => {
              const Icon = item.icon;
              const inner = (
                <div
                  className="flex items-center gap-4 p-4 rounded-xl bg-white transition-transform"
                  style={{ border: "var(--pop-outline)", boxShadow: "3px 3px 0 var(--brand-brown)" }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: item.iconBg,
                      border: "1.5px solid var(--brand-brown)",
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: item.iconColor }} />
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-xs font-bold uppercase tracking-wide mb-0.5"
                      style={{ color: "var(--brand-brown-mid)" }}
                    >
                      {item.label}
                    </p>
                    <p
                      className="font-bold text-sm break-all"
                      style={{ color: "var(--brand-brown)" }}
                    >
                      {item.value}
                    </p>
                  </div>
                </div>
              );

              return item.href ? (
                <a
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:-translate-y-0.5 transition-transform"
                >
                  {inner}
                </a>
              ) : (
                <div key={i}>{inner}</div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

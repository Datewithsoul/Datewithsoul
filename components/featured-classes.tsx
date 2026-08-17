import Link from "next/link";
import { Clock, Users, Sun, Flower2, Leaf, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type ClassData = {
  id: number;
  Icon: LucideIcon;
  iconBg: string;
  name: string;
  subname: string;
  description: string;
  duration: string;
  seats: number;
  price: string;
  badge: string;
  BadgeIcon: LucideIcon;
  badgeBg: string;
  badgeColor: string;
  accentBg: string;
};

const classes: ClassData[] = [
  {
    id: 1,
    Icon: Sun,
    iconBg: "var(--brand-yellow)",
    name: "รู้จักตัวเอง",
    subname: "Self Discovery",
    description:
      "เดินทางเข้าไปรู้จักตัวเองผ่านกิจกรรมและการสะท้อนคิด เหมาะสำหรับผู้ที่อยากเริ่มต้นเข้าใจความต้องการของตัวเอง",
    duration: "2 ชั่วโมง",
    seats: 10,
    price: "฿1,500",
    badge: "เหมาะสำหรับผู้เริ่มต้น",
    BadgeIcon: Sparkles,
    badgeBg: "var(--brand-yellow)",
    badgeColor: "var(--brand-brown)",
    accentBg: "var(--brand-yellow)",
  },
  {
    id: 2,
    Icon: Flower2,
    iconBg: "var(--brand-red)",
    name: "ความสัมพันธ์กับตัวเอง",
    subname: "Inner Child",
    description:
      "สำรวจความรู้สึกที่ค้างอยู่ข้างใน เยียวยา Inner Child และสร้างความสัมพันธ์ที่อบอุ่นกับตัวเอง",
    duration: "3 ชั่วโมง",
    seats: 8,
    price: "฿2,200",
    badge: "ยอดนิยม",
    BadgeIcon: TrendingUp,
    badgeBg: "var(--brand-red)",
    badgeColor: "#fff",
    accentBg: "var(--brand-red)",
  },
  {
    id: 3,
    Icon: Leaf,
    iconBg: "var(--brand-brown)",
    name: "ความสงบภายใน",
    subname: "Mindful Living",
    description:
      "เรียนรู้เครื่องมือ Mindfulness ง่าย ๆ ที่นำไปใช้ในชีวิตประจำวัน ลดความเครียด เพิ่มความตระหนักรู้",
    duration: "2.5 ชั่วโมง",
    seats: 10,
    price: "฿1,800",
    badge: "ผ่อนคลาย",
    BadgeIcon: Leaf,
    badgeBg: "var(--brand-brown-light)",
    badgeColor: "var(--brand-brown)",
    accentBg: "var(--brand-brown)",
  },
];

export function FeaturedClasses() {
  return (
    <section id="classes" className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
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
            คลาสของเรา
          </div>
          <h2
            className="text-4xl md:text-5xl font-black mb-4 leading-tight"
            style={{ color: "var(--brand-brown)" }}
          >
            เลือกคลาส
            <span style={{ color: "var(--brand-red)" }}>ที่ใช่</span>
            <br />
            สำหรับคุณ
          </h2>
          <p
            className="max-w-md mx-auto text-base font-medium"
            style={{ color: "var(--brand-brown-mid)" }}
          >
            แต่ละคลาสออกแบบมาเพื่อช่วยให้คุณเดินทางเข้าใจตัวเองในแบบที่แตกต่างกัน
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {classes.map((cls) => {
            const Icon = cls.Icon;
            const BadgeIcon = cls.BadgeIcon;
            return (
              <article
                key={cls.id}
                className="pop-card rounded-2xl bg-white flex flex-col overflow-hidden"
              >
                {/* Color accent top bar */}
                <div className="h-2" style={{ backgroundColor: cls.accentBg }} />

                <div className="p-6 flex flex-col flex-1">
                  {/* Icon + badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: cls.iconBg,
                        border: "var(--pop-outline)",
                      }}
                    >
                      <Icon className="w-7 h-7" color="#fff" strokeWidth={2} />
                    </div>
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black"
                      style={{
                        backgroundColor: cls.badgeBg,
                        color: cls.badgeColor,
                        border: "var(--pop-outline)",
                      }}
                    >
                      <BadgeIcon className="w-3 h-3" />
                      {cls.badge}
                    </span>
                  </div>

                  {/* Name */}
                  <h3
                    className="font-black text-xl leading-tight mb-0.5"
                    style={{ color: "var(--brand-brown)" }}
                  >
                    {cls.name}
                  </h3>
                  <p
                    className="font-semibold text-sm mb-3"
                    style={{ color: "var(--brand-brown-mid)" }}
                  >
                    {cls.subname}
                  </p>

                  <p
                    className="text-sm leading-relaxed flex-1 mb-5"
                    style={{ color: "var(--brand-brown-mid)" }}
                  >
                    {cls.description}
                  </p>

                  {/* Meta */}
                  <div
                    className="flex items-center gap-4 text-sm font-semibold mb-5 pb-4"
                    style={{
                      color: "var(--brand-brown-mid)",
                      borderBottom: "2px dashed var(--brand-brown-light)",
                    }}
                  >
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {cls.duration}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      ไม่เกิน {cls.seats} คน
                    </span>
                  </div>

                  {/* Price + CTA */}
                  <div className="flex items-center justify-between">
                    <span
                      className="font-black text-2xl"
                      style={{ color: "var(--brand-brown)" }}
                    >
                      {cls.price}
                    </span>
                    <Link
                      href="#schedule"
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm pop-btn-primary"
                    >
                      ดูตาราง
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

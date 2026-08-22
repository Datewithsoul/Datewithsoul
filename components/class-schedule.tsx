"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Sun,
  Flower2,
  Leaf,
  CalendarDays,
  Zap,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type TimeSlot = {
  time: string;
  seats: number;
  maxSeats: number;
};

type ClassItem = {
  id: number;
  name: string;
  Icon: LucideIcon;
  iconBg: string;
  date: string;
  dateObj: Date;
  slots: TimeSlot[];
  price: string;
};

const MOCK_CLASSES: ClassItem[] = [
  {
    id: 1,
    name: "รู้จักตัวเอง — Self Discovery",
    Icon: Sun,
    iconBg: "var(--brand-yellow)",
    date: "16 สิงหาคม 2026",
    dateObj: new Date(2026, 7, 16),
    slots: [
      { time: "10:00 - 12:00", seats: 8, maxSeats: 10 },
      { time: "14:00 - 16:00", seats: 3, maxSeats: 10 },
    ],
    price: "฿1,500",
  },
  {
    id: 2,
    name: "ความสัมพันธ์กับตัวเอง — Inner Child",
    Icon: Flower2,
    iconBg: "var(--brand-red)",
    date: "22 สิงหาคม 2026",
    dateObj: new Date(2026, 7, 22),
    slots: [{ time: "10:00 - 13:00", seats: 5, maxSeats: 8 }],
    price: "฿2,200",
  },
  {
    id: 3,
    name: "ความสงบภายใน — Mindful Living",
    Icon: Leaf,
    iconBg: "var(--brand-brown)",
    date: "30 สิงหาคม 2026",
    dateObj: new Date(2026, 7, 30),
    slots: [{ time: "13:00 - 15:30", seats: 0, maxSeats: 10 }],
    price: "฿1,800",
  },
  {
    id: 4,
    name: "รู้จักตัวเอง — Self Discovery",
    Icon: Sun,
    iconBg: "var(--brand-yellow)",
    date: "13 กันยายน 2026",
    dateObj: new Date(2026, 8, 13),
    slots: [
      { time: "10:00 - 12:00", seats: 10, maxSeats: 10 },
      { time: "14:00 - 16:00", seats: 10, maxSeats: 10 },
    ],
    price: "฿1,500",
  },
  {
    id: 5,
    name: "ความสัมพันธ์กับตัวเอง — Inner Child",
    Icon: Flower2,
    iconBg: "var(--brand-red)",
    date: "20 กันยายน 2026",
    dateObj: new Date(2026, 8, 20),
    slots: [{ time: "10:00 - 13:00", seats: 2, maxSeats: 8 }],
    price: "฿2,200",
  },
];

const MONTHS = [
  "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน",
  "พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม",
  "กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
];

function SlotRow({ slot }: { slot: TimeSlot }) {
  const pct = slot.seats / slot.maxSeats;
  const isFull = slot.seats === 0;
  const isFew = !isFull && pct <= 0.3;

  return (
    <div
      className="flex items-center justify-between px-3 py-2.5 rounded-lg"
      style={{
        backgroundColor: isFull ? "#f5f5f5" : "var(--brand-brown-light)",
        border: "1.5px solid var(--brand-brown)",
      }}
    >
      <span
        className="flex items-center gap-1.5 text-sm font-bold"
        style={{ color: isFull ? "#aaa" : "var(--brand-brown)" }}
      >
        <Clock className="w-3.5 h-3.5" />
        {slot.time}
      </span>

      {isFull ? (
        <span
          className="px-2.5 py-0.5 rounded-full text-xs font-black"
          style={{ backgroundColor: "#ccc", color: "#666", border: "1.5px solid #aaa" }}
        >
          เต็มแล้ว
        </span>
      ) : isFew ? (
        <span
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black text-white"
          style={{
            backgroundColor: "var(--brand-red)",
            border: "1.5px solid var(--brand-brown)",
          }}
        >
          <Zap className="w-3 h-3" />
          เหลือ {slot.seats} ที่!
        </span>
      ) : (
        <span className="text-xs font-semibold" style={{ color: "var(--brand-brown-mid)" }}>
          {slot.seats} ที่นั่งว่าง
        </span>
      )}
    </div>
  );
}

function BookingStatus({ slots }: { slots: TimeSlot[] }) {
  const allFull = slots.every((s) => s.seats === 0);
  const anyFew = slots.some((s) => s.seats > 0 && s.seats / s.maxSeats <= 0.3);

  if (allFull || !anyFew) return null;
  return (
    <div
      className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-black text-white"
      style={{ backgroundColor: "var(--brand-red)", border: "var(--pop-outline)" }}
    >
      <Zap className="w-3.5 h-3.5" />
      ที่นั่งใกล้เต็ม — จองด่วน!
    </div>
  );
}

export function ClassSchedule() {
  const now = new Date(2026, 7, 17);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const filtered = MOCK_CLASSES.filter(
    (c) => c.dateObj.getFullYear() === year && c.dateObj.getMonth() === month
  );

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  return (
    <section id="schedule" className="py-16 md:py-24 halftone-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
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
            ตารางคลาส
          </div>
          <h2
            className="text-4xl md:text-5xl font-black"
            style={{ color: "var(--brand-brown)" }}
          >
            คลาสประจำเดือน
          </h2>
        </div>

        {/* Month navigator */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <button
            onClick={prevMonth}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white font-bold transition-all"
            style={{
              border: "var(--pop-outline)",
              boxShadow: "3px 3px 0 var(--brand-brown)",
              color: "var(--brand-brown)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translate(-1px,-1px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "4px 4px 0 var(--brand-brown)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "3px 3px 0 var(--brand-brown)";
            }}
            aria-label="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            className="px-8 py-2 rounded-full bg-white font-black text-xl min-w-[200px] text-center"
            style={{
              border: "var(--pop-outline)",
              boxShadow: "3px 3px 0 var(--brand-brown)",
              color: "var(--brand-brown)",
            }}
          >
            {MONTHS[month]} {year + 543}
          </div>

          <button
            onClick={nextMonth}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white font-bold transition-all"
            style={{
              border: "var(--pop-outline)",
              boxShadow: "3px 3px 0 var(--brand-brown)",
              color: "var(--brand-brown)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translate(-1px,-1px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "4px 4px 0 var(--brand-brown)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "3px 3px 0 var(--brand-brown)";
            }}
            aria-label="เดือนถัดไป"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <div
            className="max-w-md mx-auto text-center py-16 px-8 rounded-2xl bg-white"
            style={{ border: "var(--pop-outline)", boxShadow: "var(--pop-shadow-lg)" }}
          >
            <CalendarDays
              className="w-12 h-12 mx-auto mb-4"
              style={{ color: "var(--brand-brown-mid)" }}
            />
            <p className="text-2xl font-black mb-2" style={{ color: "var(--brand-brown)" }}>
              ยังไม่มีคลาสเดือนนี้
            </p>
            <p className="text-sm font-medium" style={{ color: "var(--brand-brown-mid)" }}>
              ลองเลือกเดือนอื่น หรือติดตามประกาศใหม่ผ่าน LINE
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((cls) => {
              const allFull = cls.slots.every((s) => s.seats === 0);
              const Icon = cls.Icon;
              return (
                <article key={cls.id} className="pop-card rounded-2xl bg-white flex flex-col">
                  <div className="p-5 flex flex-col flex-1 gap-3">
                    {/* Class name + icon */}
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          backgroundColor: cls.iconBg,
                          border: "1.5px solid var(--brand-brown)",
                        }}
                      >
                        <Icon className="w-5 h-5" color="#fff" strokeWidth={2} />
                      </div>
                      <h3
                        className="font-black text-base leading-snug"
                        style={{ color: "var(--brand-brown)" }}
                      >
                        {cls.name}
                      </h3>
                    </div>

                    {/* Date */}
                    <p
                      className="flex items-center gap-2 font-bold text-sm"
                      style={{ color: "var(--brand-brown)" }}
                    >
                      <CalendarDays
                        className="w-4 h-4 flex-shrink-0"
                        style={{ color: "var(--brand-brown-mid)" }}
                      />
                      {cls.date}
                    </p>

                    {/* Time slots */}
                    <div className="space-y-2">
                      {cls.slots.map((slot, i) => (
                        <SlotRow key={i} slot={slot} />
                      ))}
                    </div>

                    {/* Urgent badge */}
                    <BookingStatus slots={cls.slots} />

                    {/* Price */}
                    <p className="font-black text-3xl" style={{ color: "var(--brand-brown)" }}>
                      {cls.price}
                    </p>

                    {/* Book Now button */}
                    {allFull ? (
                      <div
                        className="w-full py-3 rounded-full text-center text-sm font-black"
                        style={{
                          backgroundColor: "#f5f5f5",
                          border: "3px solid var(--brand-brown)",
                          color: "var(--brand-brown)",
                          opacity: 0.6,
                          cursor: "not-allowed",
                        }}
                      >
                        Class Full / คลาสเต็มแล้ว
                      </div>
                    ) : (
                      <a
                        href="https://line.me/R/ti/p/@datewithsoullove"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 rounded-full text-center text-sm pop-btn-primary block"
                      >
                        Book Now / จองเลย
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

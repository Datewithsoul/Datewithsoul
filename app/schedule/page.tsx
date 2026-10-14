import { prisma } from "@/lib/prisma";
import { ClassEventStatus, BookingStatus } from "@/app/generated/prisma";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { CalendarDays, Clock, MapPin, ArrowUpRight } from "lucide-react";
import { PageHero, Eyebrow } from "@/components/site/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "ตารางเรียน | Date with Soul Love",
  description: "ดูตารางคลาสเรียนและเวิร์กชอปทั้งหมดของเรา",
};

export default async function SchedulePage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const classes = await prisma.classEvent.findMany({
    where: {
      date: { gte: today },
      status: { notIn: [ClassEventStatus.CANCELLED, ClassEventStatus.DRAFT] },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    include: {
      media: { take: 1, orderBy: { order: "asc" } },
      bookings: {
        where: { status: { notIn: [BookingStatus.CANCELLED] } },
        select: { seats: true },
      },
    },
  });

  const grouped = classes.reduce(
    (acc, c) => {
      const key = c.date.toLocaleDateString("th-TH", { year: "numeric", month: "long" });
      (acc[key] ??= []).push(c);
      return acc;
    },
    {} as Record<string, typeof classes>
  );
  const months = Object.entries(grouped);
  const openCount = classes.filter((c) => c.totalSeats > 0 && c.status !== "COMPLETED").length;

  return (
    <div className="min-h-screen bg-white font-sans text-brand-brown">
      <Navbar />

      <PageHero
        eyebrow="Schedule"
        title="ตารางเรียน"
        highlight="รายเดือน"
        description="ดูรอบคลาสที่กำลังจะมาถึง เลือกวันที่สะดวก แล้วจองที่นั่งของคุณได้เลย"
      >
        <div className="mx-auto grid max-w-md grid-cols-3 divide-x divide-lux-line rounded-2xl border border-lux-line bg-white/80 py-4 backdrop-blur">
          {[
            { value: classes.length, label: "รอบทั้งหมด" },
            { value: openCount, label: "เปิดรับสมัคร" },
            { value: months.length, label: "เดือน" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-heading text-3xl font-semibold">{s.value}</p>
              <p className="mt-0.5 text-xs text-lux-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </PageHero>

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-24">
        {months.length === 0 ? (
          <Reveal className="mx-auto max-w-lg rounded-3xl border border-lux-line bg-lux-cream p-12 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm animate-float">
              <CalendarDays className="h-7 w-7 text-lux-gold" />
            </div>
            <h2 className="text-xl font-semibold">ยังไม่มีคลาสที่กำหนดการไว้</h2>
            <p className="mt-2 text-lux-muted">ติดตามตารางใหม่ได้ที่ LINE Official Account ของเรา</p>
          </Reveal>
        ) : (
          <div className="flex flex-col gap-20">
            {months.map(([month, items]) => (
              <section key={month}>
                <Reveal className="mb-10 flex items-end justify-between gap-4 border-b border-lux-line pb-5">
                  <div>
                    <Eyebrow>Month</Eyebrow>
                    <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">{month}</h2>
                  </div>
                  <span className="shrink-0 text-sm text-lux-muted">{items.length} รอบ</span>
                </Reveal>

                {/* Timeline */}
                <ol className="relative ml-3 border-l border-lux-line sm:ml-[5.5rem]">
                  {items.map((c, i) => {
                    const booked = c.bookings.reduce((sum, b) => sum + b.seats, 0);
                    const capacity = c.totalSeats + booked;
                    const isCompleted = c.status === "COMPLETED";
                    const isFull = c.totalSeats <= 0;
                    const isUrgent = !isFull && !isCompleted && c.totalSeats <= 3;
                    const closed = isCompleted || isFull;

                    return (
                      <Reveal as="li" key={c.id} delay={Math.min(i, 4) * 80} className="relative pb-6 pl-8 last:pb-0 sm:pl-10">
                        {/* Date — beside the line on desktop */}
                        <div className="absolute -left-[5.5rem] top-1 hidden w-16 text-right sm:block">
                          <p className="font-heading text-3xl font-semibold leading-none">{c.date.getDate()}</p>
                          <p className="mt-1 text-xs text-lux-muted">
                            {c.date.toLocaleDateString("th-TH", { weekday: "short" })}
                          </p>
                        </div>

                        {/* Node */}
                        <span
                          className={cn(
                            "absolute -left-[7px] top-2 h-3.5 w-3.5 rounded-full border-2 border-white ring-1",
                            closed ? "bg-lux-line ring-lux-line" : "bg-lux-gold ring-lux-gold"
                          )}
                          aria-hidden
                        >
                          {!closed && <span className="absolute inset-0 rounded-full bg-lux-gold animate-status-ping" />}
                        </span>

                        <Link
                          href={`/classes/${c.id}`}
                          className={cn(
                            "group flex flex-col gap-4 rounded-2xl border border-lux-line bg-white p-4 transition-all duration-500 sm:flex-row sm:items-center sm:p-5",
                            closed ? "opacity-70" : "hover:-translate-y-1 hover:border-lux-gold-soft hover:shadow-[0_20px_40px_-24px_oklch(0.35_0.065_55/0.35)]"
                          )}
                        >
                          <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl bg-lux-cream sm:h-24 sm:w-32">
                            {c.media[0] ? (
                              <img src={c.media[0].url} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                              <div className="flex h-full items-center justify-center font-display text-sm italic text-lux-gold">Soul Love</div>
                            )}
                            {/* Date chip on mobile */}
                            <span className="absolute left-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-xs font-semibold backdrop-blur sm:hidden">
                              {c.date.toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-heading text-lg font-semibold leading-snug transition-colors group-hover:text-brand-red">
                                {c.name}
                              </h3>
                              {isCompleted ? (
                                <span className="rounded-full bg-lux-cream px-2.5 py-0.5 text-[11px] font-semibold text-lux-muted">ปิดรับสมัคร</span>
                              ) : isFull ? (
                                <span className="rounded-full bg-lux-cream px-2.5 py-0.5 text-[11px] font-semibold text-lux-muted">เต็มแล้ว</span>
                              ) : isUrgent ? (
                                <span className="rounded-full bg-brand-red px-2.5 py-0.5 text-[11px] font-semibold text-white">เหลือ {c.totalSeats} ที่</span>
                              ) : null}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-lux-muted">
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-lux-gold" />
                                {c.startTime} – {c.endTime}
                              </span>
                              {c.locationName && (
                                <span className="flex items-center gap-1.5">
                                  <MapPin className="h-3.5 w-3.5 text-lux-gold" />
                                  <span className="truncate">{c.locationName}</span>
                                </span>
                              )}
                              <span>
                                จองแล้ว {booked}/{capacity}
                              </span>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end">
                            <p className="font-heading text-xl font-semibold">฿{c.price.toLocaleString()}</p>
                            {!closed && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-brand-brown px-4 py-1.5 text-xs font-semibold text-white transition-colors group-hover:bg-brand-red">
                                จองเลย <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:rotate-45" />
                              </span>
                            )}
                          </div>
                        </Link>
                      </Reveal>
                    );
                  })}
                </ol>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

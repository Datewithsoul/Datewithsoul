import { prisma } from "@/lib/prisma";
import { BookingStatus, ClassEventStatus, Prisma } from "@/app/generated/prisma";
import Link from "next/link";
import { CalendarDays, X } from "lucide-react";
import Navbar from "@/components/navbar";
import { PageHero, SectionHeading } from "@/components/site/page-hero";
import { ClassCard, categoryAnchorId } from "@/components/site/class-card";
import { Reveal } from "@/components/motion/reveal";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "คลาสเรียน",
  description:
    "รวมคลาสและเวิร์กชอปทำความรู้จักตัวเอง ความสัมพันธ์ และจิตวิทยาความรักของ Date with Soul Love ดูรอบเรียน ที่นั่งว่าง และจองออนไลน์ได้ทันที",
  path: "/classes",
});

export default async function ClassesPage(props: { searchParams: Promise<{ date?: string }> }) {
  const searchParams = await props.searchParams;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let dateFilter: Prisma.DateTimeFilter = { gte: today };
  let filterDate: Date | null = null;

  if (searchParams?.date) {
    const d = new Date(searchParams.date);
    if (!isNaN(d.getTime())) {
      const nextDay = new Date(d);
      nextDay.setDate(d.getDate() + 1);
      dateFilter = { gte: d, lt: nextDay };
      filterDate = d;
    }
  }

  const rawUpcomingClasses = await prisma.classEvent.findMany({
    where: { date: dateFilter, status: { notIn: [ClassEventStatus.CANCELLED, ClassEventStatus.DRAFT] } },
    orderBy: { date: "asc" },
    include: {
      media: { orderBy: { order: "asc" } },
      bookings: {
        where: { status: { notIn: [BookingStatus.CANCELLED] } },
        select: { seats: true },
      },
    },
  });

  // One card per class name (the detail page lets people pick the round)
  const seenNames = new Set<string>();
  const upcomingClasses = [];
  for (const c of rawUpcomingClasses) {
    if (!seenNames.has(c.name)) {
      seenNames.add(c.name);
      upcomingClasses.push(c);
    }
  }

  const byCategory = upcomingClasses.reduce(
    (acc, c) => {
      const cat = c.category || "เวิร์กชอป";
      (acc[cat] ??= []).push(c);
      return acc;
    },
    {} as Record<string, typeof upcomingClasses>
  );
  const categories = Object.keys(byCategory);

  return (
    <div className="min-h-screen bg-white font-sans text-brand-brown">
      <Navbar />

      <PageHero
        eyebrow={filterDate ? "Classes on this day" : "Our classes"}
        title={filterDate ? `คลาสวันที่ ${filterDate.toLocaleDateString("th-TH", { day: "numeric", month: "long" })}` : "คลาสเรียน"}
        highlight={filterDate ? undefined : "& Workshops"}
        description={
          filterDate
            ? "รายการคลาสที่เปิดสอนในวันที่คุณเลือก"
            : "คลาสกลุ่มเล็กในบรรยากาศอบอุ่น ออกแบบมาเพื่อให้คุณได้กลับมาเข้าใจตัวเองและความสัมพันธ์อย่างแท้จริง"
        }
      >
        {filterDate ? (
          <Link
            href="/classes"
            className="inline-flex items-center gap-2 rounded-full border border-lux-line bg-white px-5 py-2.5 text-sm font-medium transition-colors hover:border-brand-brown"
          >
            <X className="h-4 w-4" /> ดูคลาสทั้งหมด
          </Link>
        ) : (
          categories.length > 1 && (
            <nav aria-label="หมวดหมู่คลาส" className="flex flex-wrap justify-center gap-2">
              {categories.map((cat) => (
                <a
                  key={cat}
                  href={`#${categoryAnchorId(cat)}`}
                  className="rounded-full border border-lux-line bg-white/80 px-5 py-2 text-sm font-medium backdrop-blur transition-all hover:-translate-y-0.5 hover:border-lux-gold hover:text-lux-gold"
                >
                  {cat}
                  <span className="ml-1.5 text-xs text-lux-muted">{byCategory[cat].length}</span>
                </a>
              ))}
            </nav>
          )
        )}
      </PageHero>

      <main className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 md:py-24">
        {upcomingClasses.length === 0 ? (
          <Reveal className="mx-auto max-w-lg rounded-3xl border border-lux-line bg-lux-cream p-12 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm animate-float">
              <CalendarDays className="h-7 w-7 text-lux-gold" />
            </div>
            <h2 className="text-xl font-semibold">ยังไม่มีคลาสในช่วงนี้</h2>
            <p className="mt-2 text-lux-muted">ติดตามรอบใหม่ได้ทาง LINE Official Account ของเรา</p>
            <Link href="/schedule" className="mt-6 inline-block rounded-full bg-brand-brown px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
              ดูตารางเรียน
            </Link>
          </Reveal>
        ) : (
          <div className="flex flex-col gap-20 md:gap-28">
            {categories.map((cat, ci) => (
              <section key={cat} id={categoryAnchorId(cat)} className="scroll-mt-24">
                <Reveal>
                  <SectionHeading
                    align="left"
                    eyebrow={`Collection ${String(ci + 1).padStart(2, "0")}`}
                    title={cat}
                    className="mb-10 border-b border-lux-line pb-6"
                  />
                </Reveal>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
                  {byCategory[cat].map((c, i) => (
                    <Reveal key={c.id} delay={(i % 4) * 90} className="h-full">
                      <ClassCard
                        c={{
                          ...c,
                          bookedSeats: c.bookings.reduce((sum, b) => sum + b.seats, 0),
                        }}
                      />
                    </Reveal>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  User,
  Hourglass,
  Check,
  ChevronRight,
  ShieldCheck,
  BellRing,
  RefreshCcw,
} from "lucide-react";
import type { Metadata } from "next";
import { BookingStatus, ClassEventStatus } from "@/app/generated/prisma";
import ShareButton from "@/components/share-button";
import Navbar from "@/components/navbar";
import AddToCartButton from "@/components/add-to-cart-button";
import MediaGallery from "@/components/media-gallery";
import { ClassLocationMap } from "@/components/class-location-map";
import { Reveal } from "@/components/motion/reveal";
import { ClassCard, categoryAnchorId } from "@/components/site/class-card";
import { SectionHeading } from "@/components/site/page-hero";
import { expireStaleBookings } from "@/lib/expire-bookings";
import { RoundPicker } from "./round-picker";
import { MobileBookBar } from "./mobile-book-bar";
import { ReadMore } from "./read-more";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://datewithsoul.vercel.app";

function cleanDescription(value: string | null, fallback: string) {
  const description = value?.replace(/\s+/g, " ").trim();
  if (!description) return fallback;
  return description.length > 160 ? `${description.slice(0, 157)}...` : description;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const classEvent = await prisma.classEvent.findUnique({
    where: { id },
    select: {
      name: true,
      description: true,
      media: {
        where: { type: "IMAGE" },
        orderBy: { order: "asc" },
        take: 1,
        select: { url: true },
      },
    },
  });

  if (!classEvent) return {};

  const description = cleanDescription(
    classEvent.description,
    "ดูรายละเอียดและจองคลาสกับ Date with Soul Love"
  );
  const imageUrl = classEvent.media[0]?.url || `${siteUrl}/`;
  const pageUrl = `${siteUrl}/classes/${id}`;

  return {
    title: `${classEvent.name} | Date with Soul Love`,
    description,
    openGraph: {
      type: "website",
      locale: "th_TH",
      url: pageUrl,
      siteName: "Date with Soul Love",
      title: classEvent.name,
      description,
      images: [{ url: imageUrl, alt: classEvent.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: classEvent.name,
      description,
      images: [imageUrl],
    },
  };
}


function minutesOf(time: string) {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function durationLabel(start: string, end: string, date: Date, endDate: Date | null) {
  const days = endDate ? Math.round((endDate.getTime() - date.getTime()) / 86_400_000) + 1 : 1;
  const minutes = minutesOf(end) - minutesOf(start);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const perDay = minutes > 0 ? [hours ? `${hours} ชม.` : "", rest ? `${rest} นาที` : ""].filter(Boolean).join(" ") : `${start} – ${end}`;
  return days > 1 ? `${days} วัน · วันละ ${perDay}` : perDay;
}

export default async function ClassDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: classId } = await params;
  // Release seats from unpaid bookings so the seat count shown is current
  await expireStaleBookings().catch((error) => console.error("Failed to expire bookings", error));

  const classEvent = await prisma.classEvent.findUnique({
    where: { id: classId },
    include: {
      media: { orderBy: { order: "asc" } },
      bookings: { where: { status: { not: BookingStatus.CANCELLED } }, select: { seats: true } },
    },
  });

  if (!classEvent) {
    notFound();
  }

  const bookedSeats = classEvent.bookings.reduce((sum, b) => sum + b.seats, 0);
  const capacity = classEvent.totalSeats + bookedSeats;
  const filledPct = capacity > 0 ? Math.round((bookedSeats / capacity) * 100) : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Other rounds of the same class
  const roundsData = await prisma.classEvent.findMany({
    where: {
      name: classEvent.name,
      status: { notIn: [ClassEventStatus.CANCELLED, ClassEventStatus.DRAFT] },
      OR: [{ date: { gte: today } }, { id: classEvent.id }],
    },
    include: { bookings: { where: { status: { not: BookingStatus.CANCELLED } }, select: { seats: true } } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
  const rounds = roundsData.map((r) => ({
    id: r.id,
    date: r.date,
    endDate: r.endDate,
    startTime: r.startTime,
    endTime: r.endTime,
    totalSeats: r.totalSeats,
    maxSeats: r.totalSeats + r.bookings.reduce((sum, b) => sum + b.seats, 0),
  }));

  // Related: other upcoming classes, one card per class name, same category first
  const relatedRaw = await prisma.classEvent.findMany({
    where: {
      name: { not: classEvent.name },
      date: { gte: today },
      status: { notIn: [ClassEventStatus.CANCELLED, ClassEventStatus.DRAFT] },
    },
    orderBy: { date: "asc" },
    take: 24,
    include: {
      media: { orderBy: { order: "asc" } },
      bookings: { where: { status: { not: BookingStatus.CANCELLED } }, select: { seats: true } },
    },
  });
  const seen = new Set<string>();
  const related = relatedRaw
    .filter((c) => {
      if (seen.has(c.name)) return false;
      seen.add(c.name);
      return true;
    })
    .sort((a, b) => Number(b.category === classEvent.category) - Number(a.category === classEvent.category))
    .slice(0, 4);

  const classEndDate = classEvent.endDate ?? classEvent.date;
  const isPastClass = classEndDate < today;
  const unavailable = isPastClass
    ? "ผ่านวันเรียนแล้ว"
    : classEvent.status === "COMPLETED"
      ? "ปิดรับสมัครแล้ว"
      : classEvent.totalSeats <= 0
        ? "ที่นั่งเต็มแล้ว"
        : undefined;

  const category = classEvent.category || "เวิร์กชอป";
  const hasInstructor = !!classEvent.instructor && classEvent.instructor !== "ไม่ระบุผู้สอน";
  const multiDay = !!classEvent.endDate && classEvent.endDate.getTime() !== classEvent.date.getTime();
  const dateLabel =
    classEvent.date.toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "long", year: "numeric" }) +
    (multiDay ? ` – ${classEvent.endDate!.toLocaleDateString("th-TH", { day: "numeric", month: "long" })}` : "");
  const shortDate = classEvent.date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  const description = classEvent.description?.trim() || "";

  const facts = [
    { icon: Hourglass, label: "ระยะเวลา", value: durationLabel(classEvent.startTime, classEvent.endTime, classEvent.date, classEvent.endDate) },
    ...(hasInstructor ? [{ icon: User, label: "ผู้สอน", value: classEvent.instructor }] : []),
    { icon: MapPin, label: "สถานที่", value: classEvent.locationName || "แจ้งหลังยืนยันการจอง" },
    { icon: Users, label: "ขนาดกลุ่ม", value: `สูงสุด ${capacity} ท่าน` },
  ];

  // Structured data for Google rich results (Event)
  const toIso = (d: Date, time: string) => `${d.toISOString().slice(0, 10)}T${time}:00+07:00`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: classEvent.name,
    description: description.slice(0, 500) || undefined,
    startDate: toIso(classEvent.date, classEvent.startTime),
    endDate: toIso(classEndDate, classEvent.endTime),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    image: classEvent.media.filter((m) => m.type === "IMAGE").map((m) => m.url).slice(0, 3),
    location: {
      "@type": "Place",
      name: classEvent.locationName || "Date with Soul Love",
      address: classEvent.locationName || "Bangkok, Thailand",
    },
    organizer: { "@type": "Organization", name: "Date with Soul Love", url: siteUrl },
    ...(hasInstructor ? { performer: { "@type": "Person", name: classEvent.instructor } } : {}),
    offers: {
      "@type": "Offer",
      price: classEvent.price,
      priceCurrency: "THB",
      availability: unavailable ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      url: `${siteUrl}/classes/${classEvent.id}`,
    },
  };

  return (
    <main className="min-h-screen bg-white pb-28 font-sans text-brand-brown lg:pb-0">
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="mx-auto max-w-[1180px] px-4 pt-6 sm:px-6 md:pt-10">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-lux-muted animate-fade-up">
          <Link href="/classes" className="transition-colors hover:text-brand-brown">คลาสเรียน</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/classes#${categoryAnchorId(category)}`} className="transition-colors hover:text-brand-brown">{category}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="truncate text-brand-brown">{classEvent.name}</span>
        </nav>

        {/* Title */}
        <header className="stagger mb-8">
          <Link
            href={`/classes#${categoryAnchorId(category)}`}
            className="block w-fit text-[11px] font-semibold uppercase tracking-[0.3em] text-lux-gold transition-opacity hover:opacity-70"
          >
            {category}
          </Link>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">{classEvent.name}</h1>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-lux-muted">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-lux-gold" />
                {dateLabel}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-lux-gold" />
                {classEvent.startTime} – {classEvent.endTime}
              </span>
              {classEvent.locationName && (
                <a href="#location" className="flex items-center gap-1.5 transition-colors hover:text-brand-brown">
                  <MapPin className="h-4 w-4 text-lux-gold" />
                  {classEvent.locationName}
                </a>
              )}
            </div>
            <ShareButton
              title={classEvent.name}
              className="flex w-fit items-center gap-2 rounded-full border border-lux-line px-4 py-2 text-sm font-medium transition-colors hover:border-brand-brown"
            />
          </div>
        </header>

        <div className="animate-fade-up" style={{ "--delay": "200ms" } as React.CSSProperties}>
          <MediaGallery media={classEvent.media} classNameTitle={classEvent.name} />
        </div>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
          {/* Details */}
          <div className="min-w-0">
            {/* Key facts */}
            <div
              className={`grid grid-cols-2 gap-3 border-b border-lux-line pb-10 sm:gap-4 [&>*:last-child:nth-child(odd)]:col-span-2 ${
                facts.length === 3 ? "sm:grid-cols-3 sm:[&>*:last-child:nth-child(odd)]:col-span-1" : ""
              }`}
            >
              {facts.map(({ icon: Icon, label, value }, i) => (
                <Reveal key={label} delay={i * 80} className="rounded-2xl border border-lux-line bg-lux-cream/60 p-4 sm:p-5">
                  <Icon className="h-5 w-5 text-lux-gold" strokeWidth={1.5} />
                  <p className="mt-3 text-xs text-lux-muted">{label}</p>
                  <p className="mt-0.5 font-semibold leading-snug">{value}</p>
                </Reveal>
              ))}
            </div>

            {/* About */}
            <Reveal className="border-b border-lux-line py-10">
              <SectionHeading align="left" eyebrow="About this class" title="เกี่ยวกับคลาสนี้" className="mb-6" />
              <ReadMore text={description || "รายละเอียดคลาสจะอัปเดตเร็วๆ นี้"} collapsible={description.length > 500} />
            </Reveal>

            {/* Instructor */}
            {hasInstructor && (
              <Reveal className="border-b border-lux-line py-10">
                <SectionHeading align="left" eyebrow="Your guide" title="ผู้สอน" className="mb-6" />
                <div className="flex items-center gap-5">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-brown font-heading text-2xl text-brand-yellow">
                    {classEvent.instructor.trim().charAt(0)}
                  </span>
                  <div>
                    <p className="font-heading text-xl font-semibold">{classEvent.instructor}</p>
                    <p className="text-sm text-lux-muted">ผู้นำกิจกรรม · {category}</p>
                  </div>
                </div>
              </Reveal>
            )}

            {/* What you'll learn */}
            {classEvent.learningOutcomes.length > 0 && (
              <div className="border-b border-lux-line py-10">
                <Reveal>
                  <SectionHeading align="left" eyebrow="What you will gain" title="สิ่งที่คุณจะได้เรียนรู้" className="mb-6" />
                </Reveal>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {classEvent.learningOutcomes.map((outcome, idx) => (
                    <Reveal as="li" key={idx} delay={Math.min(idx, 7) * 70} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-brand-brown">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      <span className="leading-relaxed">{outcome}</span>
                    </Reveal>
                  ))}
                </ul>
              </div>
            )}

            {/* Location */}
            {(classEvent.locationName || classEvent.googleMapUrl) && (
              <Reveal className="border-b border-lux-line py-10">
                <div id="location" className="scroll-mt-28">
                  <SectionHeading align="left" eyebrow="Location" title="สถานที่จัดคลาส" className="mb-6" />
                  <ClassLocationMap locationName={classEvent.locationName} googleMapUrl={classEvent.googleMapUrl} />
                </div>
              </Reveal>
            )}

            {/* Requirements */}
            {classEvent.requirements.length > 0 && (
              <Reveal className="py-10">
                <SectionHeading align="left" eyebrow="Good to know" title="ข้อกำหนดในการเข้าเรียน" className="mb-6" />
                <ul className="flex flex-col gap-3">
                  {classEvent.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3 leading-relaxed text-brand-brown/85">
                      <span className="mt-2.5 h-1 w-3 shrink-0 rounded-full bg-lux-gold" aria-hidden />
                      {req}
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
          </div>

          {/* Booking card */}
          <aside className="relative">
            <div
              id="booking-card"
              className="sticky top-24 rounded-3xl border border-lux-line bg-white p-6 shadow-[0_30px_60px_-30px_oklch(0.35_0.065_55/0.4)] animate-slide-in-right sm:p-7"
              style={{ "--delay": "300ms" } as React.CSSProperties}
            >
              <div className="flex items-end justify-between gap-3">
                <p className="font-heading text-3xl font-semibold">
                  ฿{classEvent.price.toLocaleString()}
                  <span className="ml-1 text-sm font-normal text-lux-muted">/ ท่าน</span>
                </p>
                {!unavailable && classEvent.totalSeats <= 3 && (
                  <span className="rounded-full bg-brand-red px-3 py-1 text-xs font-semibold text-white animate-pop-in">
                    เหลือ {classEvent.totalSeats} ที่สุดท้าย
                  </span>
                )}
              </div>

              {/* Seat meter */}
              <div className="mt-5">
                <div className="mb-1.5 flex justify-between text-xs text-lux-muted">
                  <span>จองแล้ว {bookedSeats}/{capacity} ที่นั่ง</span>
                  {!unavailable && <span>ว่าง {classEvent.totalSeats} ที่</span>}
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-lux-cream">
                  <div
                    className="h-full rounded-full animate-grow-x"
                    style={{
                      width: `${filledPct}%`,
                      background: filledPct >= 80 ? "var(--brand-red)" : "linear-gradient(90deg, var(--brand-yellow), var(--lux-gold))",
                      "--delay": "600ms",
                    } as React.CSSProperties}
                  />
                </div>
              </div>

              <div className="my-6 h-px bg-lux-line" />

              <RoundPicker currentId={classEvent.id} rounds={rounds} />

              <div className="mt-6 flex flex-col gap-3">
                {unavailable ? (
                  <div className="rounded-2xl border border-lux-line bg-lux-cream px-4 py-4 text-center">
                    <p className="font-semibold">{unavailable}</p>
                    {rounds.length > 1 && <p className="mt-1 text-xs text-lux-muted">ลองเลือกรอบอื่นด้านบน</p>}
                  </div>
                ) : (
                  <>
                    <Link
                      href={`/book/${classEvent.id}`}
                      className="group relative flex items-center justify-center overflow-hidden rounded-full bg-brand-red py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-14px_var(--brand-red)] active:translate-y-0"
                    >
                      <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/25 transition-transform duration-700 group-hover:translate-x-[300%]" aria-hidden />
                      จองที่นั่ง
                    </Link>
                    <AddToCartButton classEvent={classEvent} mediaUrl={classEvent.media[0]?.url} variant="lux" />
                  </>
                )}
              </div>

              {/* Reassurance */}
              <ul className="mt-6 flex flex-col gap-2.5 border-t border-lux-line pt-5 text-sm text-lux-muted">
                <li className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-lux-gold" /> ชำระผ่านพร้อมเพย์ภายใน 10 นาทีหลังจอง
                </li>
                <li className="flex items-center gap-2.5">
                  <RefreshCcw className="h-4 w-4 shrink-0 text-lux-gold" /> ขอเปลี่ยนรอบหรือยกเลิกได้จากหน้าการจอง
                </li>
                <li className="flex items-center gap-2.5">
                  <BellRing className="h-4 w-4 shrink-0 text-lux-gold" /> แจ้งยืนยันและเตือนก่อนวันเรียนทาง LINE
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20 border-t border-lux-line bg-lux-cream/50 py-16 md:mt-28 md:py-24">
          <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
            <Reveal className="mb-10 flex items-end justify-between gap-4">
              <SectionHeading align="left" eyebrow="You may also like" title="คลาสอื่นที่น่าสนใจ" />
              <Link href="/classes" className="hidden shrink-0 text-sm font-semibold text-lux-gold underline-offset-4 hover:underline sm:block">
                ดูทั้งหมด
              </Link>
            </Reveal>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((c, i) => (
                <Reveal key={c.id} delay={i * 90} className="h-full">
                  <ClassCard c={{ ...c, bookedSeats: c.bookings.reduce((sum, b) => sum + b.seats, 0) }} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <MobileBookBar
        price={classEvent.price}
        dateLabel={`${shortDate} · ${classEvent.startTime} – ${classEvent.endTime}`}
        seatsLeft={classEvent.totalSeats}
        bookHref={`/book/${classEvent.id}`}
        disabledLabel={unavailable}
      />
    </main>
  );
}

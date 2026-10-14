import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { CalendarDays, Clock, MapPin, ArrowUpRight, Ticket } from "lucide-react";
import { BookingStatus } from "@/app/generated/prisma";
import CancelBookingButton from "@/components/cancel-booking-button";
import PaymentCountdown from "@/components/payment-countdown";
import { ChangeRequestButtons } from "@/components/change-request-buttons";
import { Reveal } from "@/components/motion/reveal";
import { StatusBadge } from "@/components/motion/status-badge";
import { PageHero, SectionHeading } from "@/components/site/page-hero";
import { cn } from "@/lib/utils";
import { Sk } from "@/components/skeletons";

const IN_PROGRESS: BookingStatus[] = [
  BookingStatus.PENDING_PAYMENT,
  BookingStatus.PAYMENT_REVIEW,
  BookingStatus.CHANGE_REQUESTED,
  BookingStatus.CANCELLATION_REQUESTED,
];

export default async function BookingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    redirect("/login");
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: dbUser.id },
    include: {
      classEvent: {
        include: {
          media: { take: 1, orderBy: { order: "asc" } },
        },
      },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const availableClasses = await prisma.classEvent.findMany({
    where: {
      status: "PUBLISHED",
      date: { gt: new Date() },
      totalSeats: { gt: 0 },
    },
    select: { id: true, name: true, date: true, startTime: true },
    orderBy: { date: "asc" },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const inProgress = bookings.filter((b) => IN_PROGRESS.includes(b.status));
  const upcoming = bookings
    .filter((b) => b.status === BookingStatus.CONFIRMED && b.classEvent.date >= today)
    .sort((a, b) => a.classEvent.date.getTime() - b.classEvent.date.getTime());
  const history = bookings.filter((b) => !inProgress.includes(b) && !upcoming.includes(b));

  const sections = [
    { key: "active", eyebrow: "In progress", title: "กำลังดำเนินการ", items: inProgress },
    { key: "upcoming", eyebrow: "Upcoming", title: "คลาสที่กำลังจะมาถึง", items: upcoming },
    { key: "history", eyebrow: "History", title: "ประวัติการจอง", items: history },
  ].filter((s) => s.items.length > 0);

  const firstName = dbUser.name.split(" ")[0];

  return (
    <div className="min-h-screen bg-white font-sans text-brand-brown">
      <Navbar />

      <PageHero
        eyebrow="My bookings"
        title={`สวัสดี ${firstName}`}
        description="ติดตามสถานะการจอง การชำระเงิน และคลาสที่กำลังจะมาถึงของคุณได้ที่นี่"
      >
        <div className="mx-auto grid max-w-lg grid-cols-3 divide-x divide-lux-line rounded-2xl border border-lux-line bg-white/80 py-4 backdrop-blur">
          {[
            { value: bookings.length, label: "การจองทั้งหมด" },
            { value: inProgress.length, label: "รอดำเนินการ" },
            { value: upcoming.length, label: "คลาสที่จะมาถึง" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-heading text-3xl font-semibold">{s.value}</p>
              <p className="mt-0.5 text-xs text-lux-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </PageHero>

      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-20">
        {bookings.length === 0 ? (
          <Reveal className="mx-auto max-w-lg rounded-3xl border border-lux-line bg-lux-cream p-12 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm animate-float">
              <Ticket className="h-7 w-7 text-lux-gold" />
            </div>
            <h2 className="text-xl font-semibold">ยังไม่มีประวัติการจอง</h2>
            <p className="mt-2 text-lux-muted">เริ่มค้นหาและจองคลาสที่คุณสนใจได้เลย</p>
            <Link
              href="/classes"
              className="mt-6 inline-block rounded-full bg-brand-brown px-7 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              ดูคลาสเรียนทั้งหมด
            </Link>
          </Reveal>
        ) : (
          <div className="flex flex-col gap-20">
            {sections.map((section) => (
              <section key={section.key}>
                <Reveal>
                  <SectionHeading
                    align="left"
                    eyebrow={section.eyebrow}
                    title={`${section.title} (${section.items.length})`}
                    className="mb-8 border-b border-lux-line pb-5"
                  />
                </Reveal>

                <div className="flex flex-col gap-5">
                  {section.items.map((booking, index) => {
                    const c = booking.classEvent;
                    const muted = section.key === "history";
                    const payHref = booking.bookingGroupId ? `/payment/group/${booking.bookingGroupId}` : `/payment/${booking.id}`;

                    return (
                      <Reveal key={booking.id} delay={Math.min(index, 5) * 80}>
                        <article
                          className={cn(
                            "group flex flex-col overflow-hidden rounded-3xl border border-lux-line bg-white transition-all duration-500 sm:flex-row",
                            muted ? "opacity-80 hover:opacity-100" : "hover:-translate-y-1 hover:border-lux-gold-soft hover:shadow-[0_24px_48px_-28px_oklch(0.35_0.065_55/0.4)]"
                          )}
                        >
                          {/* Image */}
                          <Link href={`/classes/${c.id}`} className="relative h-48 shrink-0 overflow-hidden bg-lux-cream sm:h-auto sm:w-60">
                            {c.media[0] ? (
                              <>
                              <Sk className="absolute inset-0 rounded-none" />
                              <img src={c.media[0].url} alt={c.name} loading="lazy" className={cn("relative h-full w-full object-cover transition-transform duration-700 group-hover:scale-105", muted && "grayscale-40")} />
                              </>
                            ) : (
                              <div className="flex h-full items-center justify-center font-display italic text-lux-gold">Soul Love</div>
                            )}
                            <span className="absolute bottom-3 left-3 rounded-xl bg-white/90 px-3 py-1.5 text-center backdrop-blur">
                              <span className="block font-heading text-xl font-semibold leading-none">{c.date.getDate()}</span>
                              <span className="block text-[10px] text-lux-muted">{c.date.toLocaleDateString("th-TH", { month: "short" })}</span>
                            </span>
                          </Link>

                          {/* Details */}
                          <div className="flex flex-1 flex-col p-6">
                            <div className="flex items-start justify-between gap-3">
                              <Link href={`/classes/${c.id}`} className="min-w-0">
                                <h3 className="font-heading text-xl font-semibold leading-snug transition-colors hover:text-brand-red">{c.name}</h3>
                              </Link>
                              <StatusBadge status={booking.status} />
                            </div>

                            <div className="mb-6 mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-lux-muted">
                              <span className="flex items-center gap-1.5">
                                <CalendarDays className="h-4 w-4 text-lux-gold" />
                                {c.date.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-lux-gold" />
                                {c.startTime} – {c.endTime}
                              </span>
                              {c.locationName && (
                                <span className="flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4 text-lux-gold" />
                                  {c.locationName}
                                </span>
                              )}
                            </div>

                            <div className="mt-auto flex flex-col gap-4 border-t border-lux-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-xs uppercase tracking-[0.15em] text-lux-muted">
                                  {booking.id.split("-")[0].toUpperCase()} · จองเมื่อ {booking.createdAt.toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                                </p>
                                <p className="mt-1 font-semibold">
                                  {booking.seats} ที่นั่ง · <span className="font-heading text-lg">฿{booking.totalPrice.toLocaleString()}</span>
                                </p>
                              </div>

                              {booking.status === BookingStatus.PENDING_PAYMENT && (
                                <div className="flex flex-wrap items-center gap-3">
                                  <PaymentCountdown createdAt={booking.createdAt} />
                                  <CancelBookingButton bookingId={booking.id} />
                                  <Link
                                    href={payHref}
                                    className="group/pay inline-flex items-center gap-1.5 rounded-full bg-brand-brown px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-brand-red"
                                  >
                                    ชำระเงิน
                                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover/pay:rotate-45" />
                                  </Link>
                                </div>
                              )}

                              {booking.status === BookingStatus.PAYMENT_REVIEW && (
                                <Link href={payHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-lux-gold underline-offset-4 hover:underline">
                                  ดูรายละเอียดการชำระเงิน <ArrowUpRight className="h-4 w-4" />
                                </Link>
                              )}

                              {booking.status === BookingStatus.CONFIRMED && (
                                <ChangeRequestButtons bookingId={booking.id} classDate={c.date} availableClasses={availableClasses} />
                              )}
                            </div>
                          </div>
                        </article>
                      </Reveal>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

import Link from "next/link";
import { CalendarDays, Inbox, User as UserIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { BookingStatus, ClassEventStatus } from "@/app/generated/prisma";
import Navbar from "@/components/navbar";
import ClassCalendar from "@/components/class-calendar";
import { getClassesForMonth } from "@/app/actions/calendar";
import { expireStaleBookings } from "@/lib/expire-bookings";
import { Reveal } from "@/components/motion/reveal";
import { StatusBadge } from "@/components/motion/status-badge";
import { ClassRow } from "@/components/site/class-row";
import { categoryAnchorId } from "@/components/site/class-card";
import { groupClassesByName } from "@/components/site/home-class-card";
export default async function Home() {
  // Release seats held by unpaid bookings so availability on the page is current
  await expireStaleBookings().catch((error) => console.error("Failed to expire bookings", error));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(today);
  const day = endOfWeek.getDay(); // 0 = Sunday
  endOfWeek.setDate(endOfWeek.getDate() - day + (day === 0 ? 0 : 7));
  endOfWeek.setHours(23, 59, 59, 999);

  const supabase = await createClient();

  const [calendarRes, upcomingRaw, authRes] = await Promise.all([
    getClassesForMonth(today.getFullYear(), today.getMonth()),
    prisma.classEvent.findMany({
      where: { date: { gte: today }, status: { notIn: [ClassEventStatus.CANCELLED, ClassEventStatus.DRAFT] } },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      include: {
        media: { where: { type: "IMAGE" }, orderBy: { order: "asc" }, take: 1 },
        bookings: {
          where: { status: { notIn: [BookingStatus.CANCELLED, BookingStatus.EXPIRED] } },
          select: { seats: true },
        },
      },
    }),
    supabase.auth.getUser(),
  ]);

  const upcoming = upcomingRaw.map((c) => ({
    ...c,
    bookedSeats: c.bookings.reduce((sum, b) => sum + b.seats, 0),
  }));

  // Rows show one card per class, summarising all of its upcoming rounds
  const groups = groupClassesByName(upcoming);
  const allGroups = Array.from(groups.values());

  // Rows: almost full → this week → by category (no class repeated between the first two)
  const popular = allGroups
    .filter((g) => g.minSeatsLeft !== null && g.minSeatsLeft <= 3)
    .sort((a, b) => a.minSeatsLeft! - b.minSeatsLeft!)
    .slice(0, 8);
  const popularNames = new Set(popular.map((g) => g.name));
  const thisWeek = allGroups.filter(
    (g) => !popularNames.has(g.name) && g.rounds.some((r) => r.date <= endOfWeek && r.status !== "COMPLETED")
  );
  const byCategory = allGroups.reduce(
    (acc, g) => {
      const cat = g.category || "เวิร์กชอป";
      (acc[cat] ??= []).push(g);
      return acc;
    },
    {} as Record<string, typeof allGroups>
  );

  // Signed-in member area
  const user = authRes.data.user;
  let dbUser = null;
  let recentBookings: Awaited<ReturnType<typeof getRecentBookings>> = [];
  let upcomingUserClasses: Awaited<ReturnType<typeof getUpcomingForUser>> = [];
  if (user) {
    [dbUser, recentBookings, upcomingUserClasses] = await Promise.all([
      prisma.user.findUnique({ where: { id: user.id } }),
      getRecentBookings(user.id),
      getUpcomingForUser(user.id, today),
    ]);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-brand-brown">
      <Navbar />
      <h1 className="sr-only">Date with Soul Love — คลาสกลุ่มเล็กเรื่องความสัมพันธ์และการเข้าใจตัวเอง</h1>

      {/* Calendar (unchanged layout) */}
      <ClassCalendar
        initialClasses={calendarRes.classes || []}
        initialYear={today.getFullYear()}
        initialMonth={today.getMonth()}
      />

      {/* Member area */}
      {dbUser && (
        <section className="mx-auto max-w-[1340px] px-4 py-10 sm:px-6">
          <Reveal className="rounded-3xl border border-lux-line bg-lux-cream/60 p-4 sm:p-8">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-sm">
                {dbUser.image ? (
                  <img src={dbUser.image} alt={dbUser.name} className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-6 w-6 text-lux-muted" />
                )}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-lux-gold">Welcome back</p>
                <h2 className="text-2xl font-semibold">สวัสดี, {dbUser.name}</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Upcoming */}
              <div className="min-w-0">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">คลาสที่กำลังจะมาถึง</h3>
                  <Link href="/bookings" className="shrink-0 text-sm font-semibold text-lux-gold underline-offset-4 hover:underline">
                    ดูทั้งหมด
                  </Link>
                </div>
                {upcomingUserClasses.length === 0 ? (
                  <div className="flex flex-col items-center rounded-2xl border border-lux-line bg-white p-8 text-center">
                    <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-lux-cream animate-float">
                      <CalendarDays className="h-6 w-6 text-lux-gold" />
                    </span>
                    <p className="text-lux-muted">ยังไม่มีคลาสที่กำลังจะมาถึง</p>
                    <Link href="/classes" className="mt-4 rounded-full bg-brand-brown px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
                      ค้นหาคลาสเรียน
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {upcomingUserClasses.map((b) => (
                      <Link
                        key={b.id}
                        href={`/classes/${b.classEvent.id}`}
                        className="group flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-lux-line bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-lux-gold-soft hover:shadow-md"
                      >
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-lux-cream sm:h-20 sm:w-20">
                          {b.classEvent.media[0] && (
                            <img src={b.classEvent.media[0].url} alt={b.classEvent.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 font-semibold transition-colors group-hover:text-brand-red">{b.classEvent.name}</p>
                          <p className="text-sm text-lux-muted">
                            {b.classEvent.date.toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "long" })} · {b.classEvent.startTime}
                          </p>
                        </div>
                        <StatusBadge status={b.status} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent */}
              <div className="min-w-0">
                <h3 className="mb-4 text-lg font-semibold">รายการจองล่าสุด</h3>
                {recentBookings.length === 0 ? (
                  <div className="flex flex-col items-center rounded-2xl border border-lux-line bg-white p-8 text-center">
                    <Inbox className="mb-3 h-8 w-8 text-lux-gold" strokeWidth={1.5} />
                    <p className="text-lux-muted">ยังไม่มีประวัติการจอง</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {recentBookings.map((b) => (
                      <Link
                        key={b.id}
                        href="/bookings"
                        className="flex items-center justify-between gap-3 rounded-2xl border border-lux-line bg-white p-3.5 transition-colors hover:border-lux-gold-soft sm:p-4"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{b.classEvent.name}</p>
                          <p className="text-xs text-lux-muted">
                            จองเมื่อ {b.createdAt.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })} · {b.seats} ที่นั่ง
                          </p>
                        </div>
                        <StatusBadge status={b.status} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* Class rows */}
      <div className="mx-auto flex max-w-[1340px] flex-col gap-16 px-4 py-12 sm:px-6 md:gap-20 md:py-16">
        <ClassRow
          eyebrow="Almost full"
          title={
            <>
              <span className="flame mr-2" role="img" aria-label="ไฟ">🔥</span>
              ใกล้เต็มแล้ว รีบจองเลย
            </>
          }
          classes={popular}
        />
        <ClassRow eyebrow="This week" title="คลาสสัปดาห์นี้" classes={thisWeek} />
        {Object.entries(byCategory).map(([category, classes]) => (
          <ClassRow
            key={category}
            eyebrow="Category"
            title={category}
            classes={classes}
            href={`/classes#${categoryAnchorId(category)}`}
          />
        ))}
      </div>

    </div>
  );
}

function getRecentBookings(userId: string) {
  return prisma.booking.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: { classEvent: { select: { name: true } } },
  });
}

function getUpcomingForUser(userId: string, today: Date) {
  return prisma.booking.findMany({
    where: {
      userId,
      classEvent: { date: { gte: today } },
      status: { in: [BookingStatus.PENDING_PAYMENT, BookingStatus.PAYMENT_REVIEW, BookingStatus.CONFIRMED] },
    },
    orderBy: { classEvent: { date: "asc" } },
    take: 4,
    include: {
      classEvent: {
        select: {
          id: true,
          name: true,
          date: true,
          startTime: true,
          media: { where: { type: "IMAGE" }, take: 1, select: { url: true } },
        },
      },
    },
  });
}

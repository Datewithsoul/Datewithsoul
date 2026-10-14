import { cn } from "@/lib/utils";

/*
 * Skeleton building blocks. Each composite mirrors the real component's
 * layout (same paddings, radii, aspect ratios) so content swaps in without
 * the page jumping.
 */

export function Sk({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div aria-hidden className={cn("sk", className)} style={style} />;
}

/** Wraps a whole loading screen so assistive tech announces it once. */
export function LoadingScreen({ children, label = "กำลังโหลด" }: { children: React.ReactNode; label?: string }) {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}...</span>
      {children}
    </div>
  );
}

/* ── Shared page pieces ─────────────────────────────────────────────── */

/** Mirrors components/site/page-hero.tsx */
export function PageHeroSkeleton({ chips = 0, stats = false, action = false }: { chips?: number; stats?: boolean; action?: boolean }) {
  return (
    <section
      className="border-b border-lux-line bg-white"
      style={{ backgroundImage: "radial-gradient(ellipse 70% 60% at 50% 0%, oklch(0.88 0.17 88 / 0.10), transparent 70%)" }}
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-14 pt-16 sm:px-6 md:pb-20 md:pt-24">
        <Sk className="h-3 w-40 rounded-full" />
        <Sk className="mt-6 h-3 w-28 rounded-full" />
        <Sk className="mt-5 h-11 w-4/5 max-w-md rounded-xl sm:h-14" />
        <Sk className="mt-5 h-4 w-full max-w-lg rounded-full" />
        <Sk className="mt-2.5 h-4 w-2/3 max-w-sm rounded-full" />
        {chips > 0 && (
          <div className="mt-9 flex flex-wrap justify-center gap-2">
            {Array.from({ length: chips }).map((_, i) => (
              <Sk key={i} className="h-9 w-24 rounded-full" />
            ))}
          </div>
        )}
        {stats && (
          <div className="mt-9 grid w-full max-w-md grid-cols-3 divide-x divide-lux-line rounded-2xl border border-lux-line py-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Sk className="h-7 w-10" />
                <Sk className="h-3 w-16 rounded-full" />
              </div>
            ))}
          </div>
        )}
        {action && <Sk className="mt-9 h-12 w-48 rounded-full" />}
      </div>
    </section>
  );
}

/** Mirrors SectionHeading */
export function SectionHeadingSkeleton({ align = "left", className }: { align?: "left" | "center"; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", align === "center" && "items-center", className)}>
      <Sk className="h-3 w-24 rounded-full" />
      <Sk className="h-8 w-56 rounded-lg sm:h-9" />
    </div>
  );
}

/* ── Cards ──────────────────────────────────────────────────────────── */

/** Mirrors components/site/class-card.tsx */
export function ClassCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-lux-line bg-white">
      <Sk className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <Sk className="h-3 w-20 rounded-full" />
        <Sk className="mt-3 h-6 w-4/5" />
        <div className="mt-4 flex flex-col gap-2">
          <Sk className="h-4 w-36 rounded-full" />
          <Sk className="h-4 w-28 rounded-full" />
        </div>
        <div className="mt-5">
          <div className="mb-2 flex justify-between">
            <Sk className="h-3 w-28 rounded-full" />
            <Sk className="h-3 w-8 rounded-full" />
          </div>
          <Sk className="h-1.5 w-full rounded-full" />
        </div>
        <div className="mt-auto flex items-end justify-between pt-6">
          <div className="flex flex-col gap-2">
            <Sk className="h-3 w-10 rounded-full" />
            <Sk className="h-7 w-20" />
          </div>
          <Sk className="h-11 w-11 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Mirrors components/site/home-class-card.tsx */
export function HomeClassCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-lux-line bg-white shadow-sm">
      <Sk className="aspect-video w-full rounded-none" />
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex gap-1.5">
          <Sk className="h-5 w-20 rounded-full" />
          <Sk className="h-5 w-16 rounded-full" />
        </div>
        <Sk className="h-5 w-4/5" />
        <div className="mt-4 flex flex-col gap-3 border-t border-lux-line pt-3">
          <div className="flex justify-between gap-2">
            <div className="flex flex-col gap-1.5">
              <Sk className="h-3.5 w-24 rounded-full" />
              <Sk className="h-3 w-20 rounded-full" />
            </div>
            <Sk className="h-5 w-20 rounded-md" />
          </div>
          <Sk className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}

/** Mirrors components/site/class-row.tsx */
export function ClassRowSkeleton() {
  return (
    <section>
      <div className="mb-8 flex items-end justify-between">
        <SectionHeadingSkeleton />
        <Sk className="hidden h-4 w-20 rounded-full sm:block" />
      </div>
      <div className="-ml-4 flex overflow-hidden md:-ml-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="shrink-0 basis-[70%] py-2 pl-4 sm:basis-1/2 md:basis-1/3 md:pl-5 lg:basis-1/4 xl:basis-1/5">
            <HomeClassCardSkeleton />
          </div>
        ))}
      </div>
    </section>
  );
}

/** Mirrors components/class-calendar.tsx (pop-art outlined month grid) */
export function CalendarSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1340px] px-2 py-6 md:px-6 md:py-12">
      <div className="rounded-xl border-2 border-brand-brown/25 bg-white p-3 md:rounded-2xl md:border-4 md:p-8">
        <div className="mb-4 flex flex-col items-center justify-between gap-4 md:mb-8 md:flex-row">
          <Sk className="h-8 w-52 rounded-lg md:h-12 md:w-80" />
          <Sk className="h-11 w-56 rounded-full md:h-14 md:w-72" />
        </div>
        <div className="overflow-hidden">
          <div className="min-w-[600px] md:min-w-0">
            <div className="mb-1 grid grid-cols-7 gap-1 md:mb-2 md:gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Sk key={i} className="mx-auto my-1 h-4 w-8 rounded-full md:my-2 md:h-5" />
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 md:gap-4">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="flex min-h-[100px] flex-col gap-2 rounded-lg border-2 border-brand-brown/15 p-1.5 md:min-h-[140px] md:rounded-xl md:border-4 md:p-2">
                  <Sk className="h-5 w-5 rounded-full md:h-7 md:w-7" />
                  {i % 3 === 1 && <Sk className="h-10 w-full rounded md:h-14 md:rounded-lg" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Mirrors components/class-location-map.tsx */
export function MapSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-lux-line bg-white">
      <Sk className="aspect-[16/10] w-full rounded-none sm:aspect-[16/8]" />
      <div className="flex flex-col gap-4 bg-lux-cream p-5 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-4">
          <Sk className="h-12 w-12 rounded-full" />
          <Sk className="h-5 w-40" />
        </div>
        <div className="flex gap-2">
          <Sk className="h-9 w-24 rounded-full" />
          <Sk className="h-9 w-36 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Mirrors a booking card on /bookings */
export function BookingCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-lux-line bg-white sm:flex-row">
      <Sk className="h-48 shrink-0 rounded-none sm:h-auto sm:min-h-52 sm:w-60" />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <Sk className="h-6 w-3/5" />
          <Sk className="h-6 w-24 rounded-full" />
        </div>
        <div className="mb-6 mt-4 flex flex-wrap gap-4">
          <Sk className="h-4 w-36 rounded-full" />
          <Sk className="h-4 w-24 rounded-full" />
          <Sk className="h-4 w-28 rounded-full" />
        </div>
        <div className="mt-auto flex flex-col gap-4 border-t border-lux-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <Sk className="h-3 w-40 rounded-full" />
            <Sk className="h-5 w-32" />
          </div>
          <Sk className="h-10 w-32 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Mirrors a row in the /schedule timeline */
export function TimelineItemSkeleton() {
  return (
    <li className="relative pb-6 pl-8 last:pb-0 sm:pl-10">
      <div className="absolute -left-[5.5rem] top-1 hidden w-16 flex-col items-end gap-1.5 sm:flex">
        <Sk className="h-8 w-9" />
        <Sk className="h-3 w-8 rounded-full" />
      </div>
      <span className="absolute -left-[7px] top-2 h-3.5 w-3.5 rounded-full border-2 border-white bg-lux-line ring-1 ring-lux-line" />
      <div className="flex flex-col gap-4 rounded-2xl border border-lux-line bg-white p-4 sm:flex-row sm:items-center sm:p-5">
        <Sk className="h-36 w-full shrink-0 rounded-xl sm:h-24 sm:w-32" />
        <div className="flex flex-1 flex-col gap-2.5">
          <Sk className="h-5 w-3/5" />
          <div className="flex gap-4">
            <Sk className="h-4 w-24 rounded-full" />
            <Sk className="h-4 w-32 rounded-full" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
          <Sk className="h-6 w-16" />
          <Sk className="h-7 w-20 rounded-full" />
        </div>
      </div>
    </li>
  );
}

/** Generic long-form content (FAQ / policies / how-it-works) */
export function ContentSkeleton({ blocks = 4 }: { blocks?: number }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
      <div className="flex flex-col gap-14">
        {Array.from({ length: blocks }).map((_, i) => (
          <section key={i}>
            <SectionHeadingSkeleton className="mb-6" />
            <div className="divide-y divide-lux-line border-y border-lux-line">
              {[0, 1, 2].map((j) => (
                <div key={j} className="flex items-center justify-between gap-4 py-5">
                  <Sk className="h-5 rounded-full" style={{ width: `${70 - j * 12}%` }} />
                  <Sk className="h-8 w-8 rounded-full" />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

/** Title row used by the older form pages (/book, /cart, /settings, /payment) */
export function FormTitleSkeleton({ back = false, center = false }: { back?: boolean; center?: boolean }) {
  return (
    <div className={cn("mb-8 flex items-center gap-4 border-b border-gray-200 pb-4", center && "flex-col pb-8")}>
      {back && <Sk className="h-10 w-10 rounded-full" />}
      <Sk className="h-9 w-56 rounded-lg" />
      {center && <Sk className="h-4 w-40 rounded-full" />}
    </div>
  );
}

/** A labelled input */
export function FieldSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Sk className="h-4 w-24 rounded-full" />
      <Sk className="h-11 w-full rounded-xl" />
    </div>
  );
}

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

type Round = {
  id: string;
  name: string;
  category: string | null;
  instructor: string | null;
  date: Date;
  endDate: Date | null;
  startTime: string;
  endTime: string;
  price: number;
  status: string;
  /** Remaining seats */
  totalSeats: number;
  bookedSeats: number;
  media: { url: string }[];
};

/** One class (by name) with all of its upcoming rounds rolled up. */
export type HomeClassGroup = Round & {
  rounds: Round[];
  booked: number;
  capacity: number;
  /** Fewest seats left among rounds that still have seats */
  minSeatsLeft: number | null;
  allCompleted: boolean;
};

export function groupClassesByName(rounds: Round[]): Map<string, HomeClassGroup> {
  const groups = new Map<string, HomeClassGroup>();
  for (const r of rounds) {
    const g = groups.get(r.name);
    const left = r.status !== "COMPLETED" && r.totalSeats > 0 ? r.totalSeats : null;
    if (!g) {
      groups.set(r.name, {
        ...r,
        rounds: [r],
        booked: r.bookedSeats,
        capacity: r.totalSeats + r.bookedSeats,
        minSeatsLeft: left,
        allCompleted: r.status === "COMPLETED",
      });
    } else {
      g.rounds.push(r);
      g.booked += r.bookedSeats;
      g.capacity += r.totalSeats + r.bookedSeats;
      if (left !== null) g.minSeatsLeft = g.minSeatsLeft === null ? left : Math.min(g.minSeatsLeft, left);
      if (r.status !== "COMPLETED") g.allCompleted = false;
    }
  }
  return groups;
}

const shortDate = (d: Date) => d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });

/** Compact home-page card: every round of a class summarised on one card. */
export function HomeClassCard({ c }: { c: HomeClassGroup }) {
  const dates = Array.from(
    new Set(
      c.rounds.map((r) =>
        r.endDate && r.endDate.getTime() !== r.date.getTime() ? `${shortDate(r.date)}–${shortDate(r.endDate)}` : shortDate(r.date)
      )
    )
  );
  const times = Array.from(new Set(c.rounds.map((r) => `${r.startTime}–${r.endTime}`)));
  const shownDates = dates.slice(0, 3);
  const moreDates = dates.length - shownDates.length;

  const hasSeats = c.minSeatsLeft !== null;
  const urgent = hasSeats && c.minSeatsLeft! <= 3;

  return (
    <Link href={`/classes/${c.id}`} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-lux-line bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_20px_40px_-20px_oklch(0.35_0.065_55/0.35)]">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden bg-lux-cream">
          {c.media[0] ? (
            <img src={c.media[0].url} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
          ) : (
            <div className="flex h-full items-center justify-center font-display text-sm italic text-lux-gold">Soul Love</div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          {/* Badges */}
          <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
            {c.allCompleted ? (
              <span className="rounded-full border border-lux-line bg-lux-cream px-2.5 py-0.5 text-[11px] font-semibold text-lux-muted">ปิดรับสมัคร</span>
            ) : urgent ? (
              <span className="rounded-full bg-brand-red px-2.5 py-0.5 text-[11px] font-semibold text-white">เหลือ {c.minSeatsLeft} ที่</span>
            ) : hasSeats ? (
              <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">เปิดรับสมัคร</span>
            ) : (
              <span className="rounded-full border border-lux-line bg-lux-cream px-2.5 py-0.5 text-[11px] font-semibold text-lux-muted">เต็มแล้ว</span>
            )}
            <span className="rounded-full border border-lux-gold-soft bg-lux-cream px-2.5 py-0.5 text-[11px] font-semibold text-lux-gold">
              {c.category || "เวิร์กชอป"}
            </span>
          </div>

          <h3 className="mb-1 line-clamp-2 text-base font-semibold leading-snug text-brand-brown transition-colors group-hover:text-brand-red">
            {c.name}
          </h3>
          {c.instructor && c.instructor !== "ไม่ระบุผู้สอน" && <p className="mb-3 text-xs text-lux-muted">ผู้สอน: {c.instructor}</p>}

          <div className="mt-auto flex flex-col gap-2.5 border-t border-lux-line pt-3">
            <div className="flex items-start justify-between gap-2 text-xs">
              <div className="flex min-w-0 items-start gap-1.5">
                <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-lux-gold" />
                <div className="min-w-0">
                  <p className="font-medium leading-snug text-brand-brown">
                    {shownDates.join(", ")}
                    {moreDates > 0 && <span className="text-lux-muted"> +{moreDates} รอบ</span>}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-lux-muted">{times.join(", ")}</p>
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
                  hasSeats ? "border-green-100 bg-green-50 text-green-700" : "border-lux-line bg-lux-cream text-lux-muted"
                )}
              >
                จองแล้ว {c.booked}/{c.capacity}
              </span>
            </div>

            <p className="text-lg font-bold text-brand-brown">฿{c.price.toLocaleString()}</p>
          </div>
        </div>
      </article>
    </Link>
  );
}

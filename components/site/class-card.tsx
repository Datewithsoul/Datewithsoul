import Link from "next/link";
import { CalendarDays, Clock, ArrowUpRight, User } from "lucide-react";
import ClassCarousel from "@/components/class-carousel";
import { cn } from "@/lib/utils";

export type ClassCardData = {
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
  media: { id: string; url: string; type: string }[];
};

/** Stable, selector-safe anchor id for a category section on /classes. */
export function categoryAnchorId(category: string) {
  return "cat-" + Array.from(category).map((ch) => ch.codePointAt(0)!.toString(36)).join("");
}

function availability(c: ClassCardData) {
  if (c.status === "COMPLETED") return { label: "ปิดรับสมัคร", tone: "closed" as const };
  if (c.status === "PAUSED") return { label: "ปิดรับจองชั่วคราว", tone: "closed" as const };
  if (c.totalSeats <= 0) return { label: "เต็มแล้ว", tone: "closed" as const };
  if (c.totalSeats <= 3) return { label: `เหลือ ${c.totalSeats} ที่สุดท้าย`, tone: "urgent" as const };
  return { label: "เปิดรับสมัคร", tone: "open" as const };
}

/** Luxury class card with image carousel, availability and an animated seat meter. */
export function ClassCard({ c }: { c: ClassCardData }) {
  const capacity = c.totalSeats + c.bookedSeats;
  const filled = capacity > 0 ? Math.round((c.bookedSeats / capacity) * 100) : 0;
  const avail = availability(c);
  const sameDay = !c.endDate || c.endDate.getTime() === c.date.getTime();

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-lux-line bg-white transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-lux-gold-soft hover:shadow-[0_24px_48px_-24px_oklch(0.35_0.065_55/0.35)]">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-lux-cream">
        {c.media.length > 0 ? (
          <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]">
            <ClassCarousel classId={c.id} classNameTitle={c.name} media={c.media} />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-lg italic text-lux-gold">
            Date with Soul Love
          </div>
        )}

        {/* Availability pill */}
        <span
          className={cn(
            "absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold backdrop-blur-md",
            avail.tone === "open" && "bg-white/90 text-[#16673a]",
            avail.tone === "urgent" && "bg-brand-red text-white",
            avail.tone === "closed" && "bg-white/85 text-lux-muted"
          )}
        >
          <span className="relative flex h-1.5 w-1.5">
            {avail.tone !== "closed" && (
              <span className={cn("absolute inline-flex h-full w-full rounded-full animate-status-ping", avail.tone === "urgent" ? "bg-white" : "bg-[#22a35a]")} />
            )}
            <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", avail.tone === "urgent" ? "bg-white" : avail.tone === "open" ? "bg-[#22a35a]" : "bg-lux-muted")} />
          </span>
          {avail.label}
        </span>
      </div>

      {/* Body */}
      <Link href={`/classes/${c.id}`} className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-lux-gold">{c.category || "เวิร์กชอป"}</p>
        <h3 className="mt-2 line-clamp-2 font-heading text-lg font-semibold leading-snug text-brand-brown transition-colors group-hover:text-brand-red sm:text-xl">
          {c.name}
        </h3>
        {c.instructor && c.instructor !== "ไม่ระบุผู้สอน" && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-lux-muted">
            <User className="h-3.5 w-3.5" /> {c.instructor}
          </p>
        )}

        <div className="mt-4 flex flex-col gap-1.5 text-sm text-brand-brown">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-lux-gold" />
            {c.date.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
            {!sameDay && <> – {c.endDate!.toLocaleDateString("th-TH", { day: "numeric", month: "short" })}</>}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-lux-gold" />
            {c.startTime} – {c.endTime}
          </span>
        </div>

        {/* Seat meter */}
        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-xs text-lux-muted">
            <span>จองแล้ว {c.bookedSeats}/{capacity} ที่นั่ง</span>
            <span>{filled}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-lux-cream">
            <div
              className="h-full rounded-full animate-grow-x"
              style={{
                width: `${filled}%`,
                background: filled >= 80 ? "var(--brand-red)" : "linear-gradient(90deg, var(--brand-yellow), var(--lux-gold))",
                "--delay": "300ms",
              } as React.CSSProperties}
            />
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between pt-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-lux-muted">ราคา</p>
            <p className="font-heading text-2xl font-semibold text-brand-brown">฿{c.price.toLocaleString()}</p>
          </div>
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-lux-line text-brand-brown transition-all duration-300 group-hover:rotate-45 group-hover:border-brand-brown group-hover:bg-brand-brown group-hover:text-white">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </Link>
    </article>
  );
}

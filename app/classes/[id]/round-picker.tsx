"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type Round = {
  id: string;
  date: Date;
  endDate: Date | null;
  startTime: string;
  endTime: string;
  /** Remaining seats */
  totalSeats: number;
  maxSeats: number;
};

function formatRoundDate(r: Round) {
  const date = new Date(r.date);
  const start = date.toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "short" });
  if (r.endDate && new Date(r.endDate).getTime() !== date.getTime()) {
    return `${start} – ${new Date(r.endDate).toLocaleDateString("th-TH", { day: "numeric", month: "short" })}`;
  }
  return start;
}

function SeatsBadge({ seats }: { seats: number }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        seats <= 0 ? "bg-lux-cream text-lux-muted" : seats <= 3 ? "bg-brand-red text-white" : "bg-[#effaf1] text-[#16673a]"
      )}
    >
      {seats <= 0 ? "เต็ม" : `ว่าง ${seats}`}
    </span>
  );
}

/** Dropdown of all rounds of this class; choosing one navigates to that round. */
export function RoundPicker({ currentId, rounds }: { currentId: string; rounds: Round[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => Math.max(0, rounds.findIndex((r) => r.id === currentId)));
  const [isPending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const current = rounds.find((r) => r.id === currentId) ?? rounds[0];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Keep the highlighted option in view while using the keyboard
  useEffect(() => {
    if (open) listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const choose = (r: Round) => {
    setOpen(false);
    if (r.id === currentId) return;
    startTransition(() => router.push(`/classes/${r.id}`, { scroll: false }));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActive((i) => (e.key === "ArrowDown" ? Math.min(rounds.length - 1, i + 1) : Math.max(0, i - 1)));
    }
    if ((e.key === "Enter" || e.key === " ") && open) {
      e.preventDefault();
      choose(rounds[active]);
    }
  };

  if (!current) return null;

  return (
    <div ref={rootRef} className="relative">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-lux-muted">เลือกรอบเรียน</p>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl border bg-white px-4 py-3.5 text-left transition-all duration-200",
          open ? "border-brand-brown ring-4 ring-lux-gold/15" : "border-lux-line hover:border-lux-gold-soft"
        )}
      >
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{formatRoundDate(current)}</span>
          <span className="block text-sm text-lux-muted">
            {current.startTime} – {current.endTime}
          </span>
        </span>
        <SeatsBadge seats={current.totalSeats} />
        {isPending ? (
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-lux-muted" />
        ) : (
          <ChevronDown className={cn("h-5 w-5 shrink-0 text-lux-muted transition-transform duration-300", open && "rotate-180")} />
        )}
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="รอบเรียน"
          data-lenis-prevent
          className="absolute inset-x-0 top-full z-30 mt-2 max-h-72 origin-top overflow-y-auto rounded-2xl border border-lux-line bg-white p-1.5 shadow-[0_24px_48px_-20px_oklch(0.35_0.065_55/0.45)] animate-dropdown"
        >
          {rounds.map((r, i) => {
            const selected = r.id === currentId;
            return (
              <li
                key={r.id}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(r)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                  i === active && "bg-lux-cream",
                  r.totalSeats <= 0 && !selected && "opacity-55"
                )}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center text-brand-brown">
                  {selected && <Check className="h-4 w-4" strokeWidth={3} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-sm", selected ? "font-semibold" : "font-medium")}>{formatRoundDate(r)}</span>
                  <span className="block text-xs text-lux-muted">
                    {r.startTime} – {r.endTime}
                  </span>
                </span>
                <SeatsBadge seats={r.totalSeats} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

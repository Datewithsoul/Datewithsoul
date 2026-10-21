"use client";

import { useState, useEffect, useRef } from "react";
import { CalendarDays, Trash2, Plus, Minus, ChevronDown, Check } from "lucide-react";
import { useCart, CartItem } from "@/hooks/use-cart";
import { getAlternativeSchedules } from "@/app/cart/actions";
import { cn } from "@/lib/utils";

type Schedule = Awaited<ReturnType<typeof getAlternativeSchedules>>[number];

const formatDate = (date: Date | string): string =>
  new Date(date).toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "short", year: "2-digit" });

export default function CartItemRow({ item }: { item: CartItem }) {
  const { updateSeats, removeFromCart, changeSchedule } = useCart();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || schedules.length > 0) return;
    const load = async () => {
      setIsLoading(true);
      setSchedules(await getAlternativeSchedules(item.className));
      setIsLoading(false);
    };
    load();
  }, [isOpen, item.className, schedules.length]);

  // Close the round picker on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const handleScheduleChange = (newSchedule: Schedule) => {
    setIsOpen(false);
    if (newSchedule.id === item.classEventId) return;

    changeSchedule(item.classEventId, {
      ...item,
      classEventId: newSchedule.id,
      date: new Date(newSchedule.date),
      startTime: newSchedule.startTime,
      endTime: newSchedule.endTime,
      maxSeats: newSchedule.totalSeats,
    });
  };

  return (
    <article className="group relative flex gap-4 rounded-2xl border border-lux-line bg-white p-4 transition-colors duration-300 hover:border-lux-gold-soft">
      {/* Thumbnail */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-lux-cream sm:h-24 sm:w-24">
        {item.mediaUrl ? (
          <img src={item.mediaUrl} alt={item.className} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-sm italic text-lux-gold">Soul Love</div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="pr-8 font-heading text-base font-semibold leading-snug sm:text-lg">{item.className}</h3>

        {/* Round picker */}
        <div ref={pickerRef} className="relative mt-2">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            className="inline-flex max-w-full items-center gap-2 rounded-full border border-lux-line px-3 py-1.5 text-xs text-lux-muted transition-colors hover:border-lux-gold-soft hover:text-brand-brown sm:text-sm"
          >
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-lux-gold" />
            <span className="truncate">
              {formatDate(item.date)} · {item.startTime}–{item.endTime}
            </span>
            <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", isOpen && "rotate-180")} />
          </button>

          {isOpen && (
            <div
              role="listbox"
              aria-label="เลือกรอบเรียน"
              className="absolute left-0 top-full z-20 mt-2 max-h-64 w-full min-w-64 overflow-y-auto rounded-2xl border border-lux-line bg-white p-1.5 shadow-[0_20px_40px_-20px_oklch(0.35_0.065_55/0.35)] animate-in fade-in slide-in-from-top-1"
            >
              <ScheduleOptions
                isLoading={isLoading}
                schedules={schedules}
                selectedId={item.classEventId}
                onSelect={handleScheduleChange}
              />
            </div>
          )}
        </div>

        {/* Seats + price */}
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div className="flex items-center rounded-full border border-lux-line p-0.5">
            <button
              type="button"
              onClick={() => updateSeats(item.classEventId, item.seats - 1)}
              disabled={item.seats <= 1}
              aria-label="ลดจำนวนที่นั่ง"
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-lux-cream disabled:opacity-30"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
              {item.seats}
            </span>
            <button
              type="button"
              onClick={() => updateSeats(item.classEventId, item.seats + 1)}
              disabled={item.seats >= item.maxSeats}
              aria-label="เพิ่มจำนวนที่นั่ง"
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-lux-cream disabled:opacity-30"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="text-right">
            {item.seats > 1 && (
              <p className="text-[11px] text-lux-muted">฿{item.price.toLocaleString()} × {item.seats}</p>
            )}
            <p className="font-heading text-lg font-semibold leading-tight">฿{(item.price * item.seats).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => removeFromCart(item.classEventId)}
        aria-label={`ลบ ${item.className} ออกจากตะกร้า`}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-lux-muted transition-colors hover:bg-brand-red/10 hover:text-brand-red"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </article>
  );
}

function ScheduleOptions({
  isLoading,
  schedules,
  selectedId,
  onSelect,
}: {
  isLoading: boolean;
  schedules: Schedule[];
  selectedId: string;
  onSelect: (schedule: Schedule) => void;
}) {
  if (isLoading) return <p className="p-3 text-center text-sm text-lux-muted">กำลังโหลดรอบเรียน...</p>;
  if (schedules.length === 0) return <p className="p-3 text-center text-sm text-lux-muted">ไม่มีรอบอื่น</p>;

  return schedules.map((s) => {
    const isSelected = s.id === selectedId;
    const isFull = s.totalSeats <= 0;
    return (
      <button
        key={s.id}
        type="button"
        role="option"
        aria-selected={isSelected}
        onClick={() => !isFull && onSelect(s)}
        disabled={isFull}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
          isSelected ? "bg-lux-cream font-semibold" : "hover:bg-lux-cream",
          isFull && "cursor-not-allowed opacity-50"
        )}
      >
        <span>
          {formatDate(s.date)} · {s.startTime}–{s.endTime}
        </span>
        <ScheduleBadge isFull={isFull} isSelected={isSelected} seatsLeft={s.totalSeats} />
      </button>
    );
  });
}

function ScheduleBadge({ isFull, isSelected, seatsLeft }: { isFull: boolean; isSelected: boolean; seatsLeft: number }) {
  if (isFull) {
    return <span className="rounded-full bg-brand-red/10 px-2 py-0.5 text-xs font-medium text-brand-red">เต็ม</span>;
  }
  if (isSelected) return <Check className="h-4 w-4 text-lux-gold" />;
  return <span className="text-xs text-lux-muted">ว่าง {seatsLeft}</span>;
}

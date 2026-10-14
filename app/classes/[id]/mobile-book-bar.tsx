"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Mobile-only sticky booking bar. The booking card sits below all content on
 * small screens, so this keeps price + CTA in reach. It hides itself while the
 * real booking card or the footer is on screen.
 */
export function MobileBookBar({
  price,
  dateLabel,
  seatsLeft,
  bookHref,
  disabledLabel,
}: {
  price: number;
  dateLabel: string;
  seatsLeft: number;
  bookHref: string;
  /** When set, booking is unavailable and this replaces the CTA */
  disabledLabel?: string;
}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const targets = [document.getElementById("booking-card"), document.querySelector("footer")].filter(
      (el): el is HTMLElement => !!el
    );
    if (targets.length === 0) return;

    const visible = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      setHidden(visible.size > 0);
    });
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-lux-line bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md transition-transform duration-500 ease-out lg:hidden",
        hidden ? "translate-y-full" : "translate-y-0"
      )}
    >
      <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-heading text-xl font-semibold leading-tight text-brand-brown">
            ฿{price.toLocaleString()} <span className="text-xs font-normal text-lux-muted">/ ท่าน</span>
          </p>
          <p className="truncate text-xs text-lux-muted">
            {dateLabel}
            {!disabledLabel && seatsLeft <= 3 && <span className="ml-1.5 font-semibold text-brand-red">· เหลือ {seatsLeft} ที่</span>}
          </p>
        </div>
        {disabledLabel ? (
          <span className="shrink-0 rounded-full bg-lux-cream px-5 py-3 text-sm font-semibold text-lux-muted">{disabledLabel}</span>
        ) : (
          <Link
            href={bookHref}
            className="shrink-0 rounded-full bg-brand-red px-7 py-3 text-sm font-semibold text-white shadow-lg transition-transform active:scale-95"
          >
            จองที่นั่ง
          </Link>
        )}
      </div>
    </div>
  );
}

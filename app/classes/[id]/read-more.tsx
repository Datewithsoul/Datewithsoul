"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Collapses long text behind a fade with a "read more" toggle. */
export function ReadMore({ text, collapsible }: { text: string; collapsible: boolean }) {
  const [open, setOpen] = useState(false);
  const collapsed = collapsible && !open;

  return (
    <div>
      <div className={cn("relative overflow-hidden transition-[max-height] duration-700 ease-out", collapsed ? "max-h-56" : "max-h-[400rem]")}>
        <p className="whitespace-pre-wrap text-[1.05rem] leading-[1.9] text-brand-brown/85">{text}</p>
        {collapsed && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-white to-transparent" aria-hidden />}
      </div>
      {collapsible && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-lux-line px-5 py-2 text-sm font-semibold text-brand-brown transition-colors hover:border-brand-brown"
        >
          {open ? "ย่อข้อความ" : "อ่านเพิ่มเติม"}
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", open && "rotate-180")} />
        </button>
      )}
    </div>
  );
}

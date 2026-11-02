"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BOOKING_POLICY_SECTIONS } from "@/lib/booking-policy";

/** Booking policy the customer must accept before the booking is created. */
export function BookingPolicyDialog({
  open,
  onCancel,
  onAccept,
}: {
  open: boolean;
  onCancel: () => void;
  onAccept: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
      <DialogContent className="flex max-h-[85dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-lux-line p-5 pr-12">
          <DialogTitle className="text-xl font-semibold text-brand-brown">นโยบายการจองและกฎเกณฑ์</DialogTitle>
          <DialogDescription className="text-lux-muted">
            กรุณาอ่านและยอมรับก่อนยืนยันการจอง หรือ{" "}
            <Link href="/terms" target="_blank">เปิดอ่านแบบเต็มหน้า</Link>
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-5">
          {BOOKING_POLICY_SECTIONS.map((section) => (
            <section key={section.title}>
              <h3 className="font-semibold text-brand-brown">{section.title}</h3>
              <ul className="mt-2 flex flex-col gap-2">
                {section.content.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 leading-relaxed text-lux-muted">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lux-gold" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <PolicyAcceptance onCancel={onCancel} onAccept={onAccept} />
      </DialogContent>
    </Dialog>
  );
}

/** Unmounts with the dialog, so the customer accepts afresh every time it opens. */
function PolicyAcceptance({ onCancel, onAccept }: { onCancel: () => void; onAccept: () => void }) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="flex flex-col gap-4 border-t border-lux-line bg-lux-cream p-5">
      <label className="flex cursor-pointer items-start gap-3 font-medium text-brand-brown">
        <Checkbox checked={accepted} onCheckedChange={setAccepted} className="mt-0.5" />
        ฉันได้อ่านและยอมรับนโยบายการจองและกฎเกณฑ์แล้ว
      </label>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-lux-line bg-white px-6 py-3 font-semibold text-brand-brown transition-colors hover:border-brand-brown"
        >
          กลับไปแก้ไข
        </button>
        <button
          type="button"
          onClick={onAccept}
          disabled={!accepted}
          className="group flex items-center justify-center gap-2 rounded-full bg-brand-brown px-6 py-3 font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          ยอมรับและจอง
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

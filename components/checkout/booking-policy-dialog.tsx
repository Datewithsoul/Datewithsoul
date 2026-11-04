"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BOOKING_CHANGE_POLICY, BOOKING_CHANGE_POLICY_PATH, BOOKING_POLICY_SECTIONS } from "@/lib/booking-policy";
import { REQUEST_DEADLINE_DAYS } from "@/lib/booking-status";
import { cn } from "@/lib/utils";

const LINE_OA_URL = "https://line.me/R/ti/p/@073wlzuq";

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
    <PolicyDialog
      open={open}
      onClose={onCancel}
      description={
        <>
          กรุณาอ่านและยอมรับก่อนยืนยันการจอง หรือ{" "}
          <Link href="/terms" target="_blank">เปิดอ่านแบบเต็มหน้า</Link>
        </>
      }
    >
      <PolicyAcceptance cancelLabel="กลับไปแก้ไข" acceptLabel="ยอมรับและจอง" onCancel={onCancel} onAccept={onAccept} />
    </PolicyDialog>
  );
}

/**
 * Booking policy shown when a customer asks to change rounds or cancel. Within the
 * deadline they accept it and continue to the request form; past it they are told
 * to contact the shop on LINE instead.
 */
export function RequestPolicyDialog({
  open,
  requestLabel,
  allowed,
  onCancel,
  onAccept,
}: {
  open: boolean;
  requestLabel: string;
  allowed: boolean;
  onCancel: () => void;
  onAccept: () => void;
}) {
  return (
    <PolicyDialog
      open={open}
      onClose={onCancel}
      highlight={BOOKING_CHANGE_POLICY.title}
      description={
        <>
          {allowed ? `กรุณาอ่านและยอมรับก่อนส่งคำขอ${requestLabel} หรือ ` : ""}
          <Link href={BOOKING_CHANGE_POLICY_PATH} target="_blank">เปิดอ่านแบบเต็มหน้า</Link>
        </>
      }
    >
      {allowed ? (
        <PolicyAcceptance cancelLabel="ปิด" acceptLabel="ยอมรับและดำเนินการต่อ" onCancel={onCancel} onAccept={onAccept} />
      ) : (
        <div className="flex flex-col gap-4 border-t border-lux-line bg-lux-cream p-5">
          <p className="rounded-lg border border-brand-red/30 bg-brand-red/5 p-3 font-medium leading-relaxed text-brand-red">
            เหลือไม่ถึง {REQUEST_DEADLINE_DAYS} วันก่อนวันเรียน จึงไม่สามารถ{requestLabel}ผ่านระบบได้
            หากมีเหตุจำเป็น กรุณาติดต่อแอดมินทาง LINE
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-lux-line bg-white px-6 py-3 font-semibold text-brand-brown transition-colors hover:border-brand-brown"
            >
              ปิด
            </button>
            <a
              href={LINE_OA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 rounded-full bg-brand-brown px-6 py-3 font-semibold text-white"
            >
              ติดต่อแอดมินทาง LINE
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      )}
    </PolicyDialog>
  );
}

function PolicyDialog({
  open,
  onClose,
  description,
  highlight,
  children,
}: {
  open: boolean;
  onClose: () => void;
  description: ReactNode;
  /** Title of the section to emphasise */
  highlight?: string;
  /** Footer */
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="flex max-h-[85dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-lux-line p-5 pr-12">
          <DialogTitle className="text-xl font-semibold text-brand-brown">นโยบายการจองและกฎเกณฑ์</DialogTitle>
          <DialogDescription className="text-lux-muted">{description}</DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain p-5">
          {BOOKING_POLICY_SECTIONS.map((section) => (
            <section
              key={section.title}
              className={cn(section.title === highlight && "rounded-xl border-2 border-brand-yellow bg-brand-yellow/10 p-4")}
            >
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

        {children}
      </DialogContent>
    </Dialog>
  );
}

/** Unmounts with the dialog, so the customer accepts afresh every time it opens. */
function PolicyAcceptance({
  cancelLabel,
  acceptLabel,
  onCancel,
  onAccept,
}: {
  cancelLabel: string;
  acceptLabel: string;
  onCancel: () => void;
  onAccept: () => void;
}) {
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
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onAccept}
          disabled={!accepted}
          className="group flex items-center justify-center gap-2 rounded-full bg-brand-brown px-6 py-3 font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {acceptLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

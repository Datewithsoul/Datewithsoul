"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { BellRing, Clock, Loader2, Tag, X } from "lucide-react";
import type { AppliedPromo } from "@/lib/promo";
import { cn } from "@/lib/utils";

export const checkoutInputClass =
  "w-full rounded-xl border border-lux-line bg-white px-4 py-3 text-brand-brown placeholder:text-lux-muted/70 transition-colors focus:border-lux-gold focus:outline-none focus:ring-2 focus:ring-lux-gold-soft disabled:cursor-not-allowed disabled:bg-lux-cream disabled:text-lux-muted";

/** Promo code input that validates against /api/validate-promo and reports the applied code. */
export function PromoCodeField({
  classEventIds,
  promo,
  onChange,
  disabled = false,
}: {
  classEventIds: string[];
  promo: AppliedPromo | null;
  onChange: (promo: AppliedPromo | null) => void;
  disabled?: boolean;
}) {
  const [input, setInput] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const apply = async () => {
    if (!input || isChecking || disabled) return;
    setIsChecking(true);
    try {
      const res = await fetch("/api/validate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: input, classEventIds }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        onChange(null);
        return;
      }
      toast.success("ใช้โค้ดส่วนลดสำเร็จ!");
      onChange({ code: data.promo.code, discountType: data.promo.discountType, discountValue: data.promo.discountValue });
    } catch {
      toast.error("ตรวจสอบโค้ดส่วนลดไม่สำเร็จ");
    } finally {
      setIsChecking(false);
    }
  };

  if (promo) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-lux-gold bg-white px-4 py-3">
        <span className="flex min-w-0 items-center gap-2 text-sm">
          <Tag className="h-4 w-4 shrink-0 text-lux-gold" />
          <span className="truncate font-semibold tracking-wide">{promo.code}</span>
        </span>
        <button
          type="button"
          onClick={() => {
            onChange(null);
            setInput("");
          }}
          aria-label="ยกเลิกโค้ดส่วนลด"
          className="flex h-7 w-7 items-center justify-center rounded-full text-lux-muted transition-colors hover:bg-lux-cream hover:text-brand-brown"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <label htmlFor="promo" className="mb-2 block text-sm font-semibold">โค้ดส่วนลด</label>
      <div className="flex gap-2">
        <input
          type="text"
          id="promo"
          value={input}
          disabled={disabled}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            apply();
          }}
          className={cn(checkoutInputClass, "uppercase")}
          placeholder="กรอกโค้ด (ถ้ามี)"
        />
        <button
          type="button"
          onClick={apply}
          disabled={!input || isChecking || disabled}
          className="flex shrink-0 items-center justify-center rounded-xl border border-brand-brown px-4 text-sm font-semibold transition-colors hover:bg-brand-brown hover:text-white disabled:border-lux-line disabled:text-lux-muted disabled:hover:bg-transparent"
        >
          {isChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : "ใช้โค้ด"}
        </button>
      </div>
    </>
  );
}

/** Reassurance lines and terms link shown under the checkout button. */
export function CheckoutNotes({ isFree }: { isFree: boolean }) {
  return (
    <>
      <ul className="mt-5 flex flex-col gap-2.5 text-xs text-lux-muted">
        {!isFree && (
          <li className="flex items-start gap-2">
            <Clock className="mt-px h-3.5 w-3.5 shrink-0 text-lux-gold" />
            ชำระเงินภายใน 10 นาทีหลังยืนยัน เพื่อรักษาที่นั่งของคุณ
          </li>
        )}
        <li className="flex items-start gap-2">
          <BellRing className="mt-px h-3.5 w-3.5 shrink-0 text-lux-gold" />
          รับการแจ้งเตือนสถานะการจองผ่าน LINE
        </li>
      </ul>
      <p className="mt-5 border-t border-lux-line pt-4 text-center text-xs text-lux-muted">
        การกดยืนยันถือว่าคุณยอมรับ{" "}
        <Link href="/terms" className="underline underline-offset-2 hover:text-brand-brown">
          เงื่อนไขการจอง
        </Link>
      </p>
    </>
  );
}

export const checkoutButtonClass =
  "group mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand-brown px-6 py-4 font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-16px_oklch(0.35_0.065_55/0.6)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50";

function Field({ id, label, className, children }: { id: string; label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-semibold">{label}</label>
      {children}
    </div>
  );
}

/** Booker contact fields shared by the single-class booking and cart checkout forms. */
export function BookerFields({
  defaultName,
  defaultEmail,
  defaultPhone,
  disabled = false,
  children,
}: {
  defaultName: string;
  defaultEmail: string;
  defaultPhone: string;
  disabled?: boolean;
  /** Extra fields rendered between the contact fields and the note */
  children?: React.ReactNode;
}) {
  return (
    <>
      <Field id="name" label="ชื่อ-นามสกุล" className="sm:col-span-2">
        <input
          type="text"
          id="name"
          name="name"
          required
          autoComplete="name"
          defaultValue={defaultName}
          disabled={disabled}
          className={checkoutInputClass}
          placeholder="ชื่อ-นามสกุล"
        />
      </Field>
      <Field id="email" label="อีเมล">
        <input
          type="email"
          id="email"
          name="email"
          required
          autoComplete="email"
          defaultValue={defaultEmail}
          disabled={disabled}
          className={checkoutInputClass}
          placeholder="you@example.com"
        />
      </Field>
      <Field id="phone" label="เบอร์โทรศัพท์">
        <input
          type="tel"
          id="phone"
          name="phone"
          required
          autoComplete="tel"
          inputMode="tel"
          defaultValue={defaultPhone}
          disabled={disabled}
          className={checkoutInputClass}
          placeholder="08x-xxx-xxxx"
        />
      </Field>
      {children}
      <Field id="note" label="หมายเหตุเพิ่มเติม (ถ้ามี)" className="sm:col-span-2">
        <textarea
          id="note"
          name="note"
          disabled={disabled}
          className={cn(checkoutInputClass, "min-h-24 resize-y")}
          placeholder="เช่น แพ้อาหาร หรือความต้องการพิเศษ"
        />
      </Field>
    </>
  );
}

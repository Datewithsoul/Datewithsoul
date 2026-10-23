"use client";

import { useState } from "react";
import { Check, Copy, Landmark } from "lucide-react";
import type { PaymentSettings } from "@/lib/payment-settings";
import { cn } from "@/lib/utils";

const COPIED_RESET_MS = 2000;

export function PaymentQr({ qrImageUrl }: { qrImageUrl: string | null }) {
  if (!qrImageUrl) return null;

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-2">สแกนจ่ายผ่านพร้อมเพย์</h2>
      <div className="bg-[#113566] text-white px-3 py-1 rounded-md font-semibold text-xs mb-6 w-max">
        PromptPay
      </div>
      <div className="bg-white p-4 rounded-xl border border-gray-200 w-64 h-64 flex items-center justify-center mb-6 shadow-sm animate-pop-in" style={{ "--delay": "400ms" } as React.CSSProperties}>
        <img src={qrImageUrl} alt="PromptPay QR Code" className="w-full h-full object-contain" />
      </div>
    </div>
  );
}

export function BankAccountDetails({ settings, className }: { settings: PaymentSettings; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(settings.accountNumber.replaceAll("-", ""));
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      // Clipboard can be blocked (e.g. in-app browsers); the number stays visible to copy by hand
    }
  };

  return (
    <div
      className={cn("w-full overflow-hidden rounded-xl border-2 border-brand-brown bg-white text-left", className)}
      style={{ boxShadow: "3px 3px 0 var(--brand-brown)" }}
    >
      <div className="flex items-center gap-2 border-b-2 border-brand-brown bg-brand-yellow px-4 py-2.5">
        <Landmark className="h-4 w-4 text-brand-brown" aria-hidden="true" />
        <span className="text-sm font-bold text-brand-brown">โอนเงินผ่านบัญชีธนาคาร</span>
      </div>

      <div className="p-4">
        {settings.bankName ? (
          <p className="text-sm font-semibold text-brand-brown">{settings.bankName}</p>
        ) : null}

        {settings.accountNumber ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-brand-brown-light px-3 py-2.5">
            <div className="min-w-0">
              <p className="text-xs text-gray-500">เลขที่บัญชี</p>
              <p className="text-xl font-bold tracking-wide text-brand-brown tabular-nums">{settings.accountNumber}</p>
            </div>
            <button
              type="button"
              onClick={copyAccountNumber}
              className={cn(
                "inline-flex min-h-11 items-center gap-1.5 rounded-lg border-2 border-brand-brown px-3 text-sm font-semibold transition-colors",
                copied ? "bg-green-100 text-green-800" : "bg-white text-brand-brown hover:bg-brand-yellow"
              )}
              aria-label="คัดลอกเลขที่บัญชี"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "คัดลอกแล้ว" : "คัดลอก"}
            </button>
          </div>
        ) : null}

        <div className="mt-3 flex justify-between gap-4 text-sm">
          <span className="shrink-0 text-gray-500">ชื่อบัญชี</span>
          <span className="text-right font-semibold text-brand-brown">{settings.accountName}</span>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">{copied ? "คัดลอกเลขที่บัญชีแล้ว" : ""}</span>
    </div>
  );
}

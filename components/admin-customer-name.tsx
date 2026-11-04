"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const COPIED_RESET_MS = 1500;

/**
 * Customer name for admin pages, with the LINE display name (copy it to search the
 * chat in LINE OA Manager) and the phone number as a tap-to-call link.
 */
export function AdminCustomerName({
  name,
  lineName,
  phone,
  className,
  nameClassName,
}: {
  name: string;
  lineName?: string | null;
  phone?: string | null;
  className?: string;
  nameClassName?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className={cn("font-medium text-[#3d3229]", nameClassName)}>{name}</div>
      {lineName ? <LineName lineName={lineName} /> : null}
      {phone ? (
        <a href={`tel:${phone}`} className="mt-0.5 block text-xs text-[#6a5d50] hover:text-[#3d3229] hover:underline">
          {phone}
        </a>
      ) : null}
    </div>
  );
}

function LineName({ lineName }: { lineName: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(lineName);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      // Clipboard can be blocked (e.g. non-HTTPS); the name is still visible to copy by hand
    }
  };

  return (
    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[#3d3229]">
      <span className="shrink-0 rounded-sm bg-[#06C755] px-1 py-px text-[9px] font-bold leading-tight text-white">LINE</span>
      <span className="truncate">{lineName}</span>
      <button
        type="button"
        onClick={copy}
        title="คัดลอกชื่อ LINE"
        aria-label="คัดลอกชื่อ LINE"
        className="shrink-0 text-[#a09486] hover:text-[#3d3229]"
      >
        {copied ? <Check className="h-3 w-3 text-[#06C755]" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  );
}

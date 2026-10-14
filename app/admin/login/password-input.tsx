"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";

export function PasswordInput({ className }: { className?: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-lux-muted" />
      <input
        id="password"
        type={visible ? "text" : "password"}
        name="password"
        required
        autoComplete="current-password"
        className={className}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-lux-muted transition-colors hover:bg-lux-cream hover:text-brand-brown"
        aria-label={visible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

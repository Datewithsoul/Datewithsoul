import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["จองที่นั่ง", "ชำระเงิน", "ตรวจสอบสลิป", "ยืนยันแล้ว"];

/** Index of the step currently in progress; STEPS.length means everything is done. */
export function progressStepFor(status: string) {
  switch (status) {
    case "PENDING_PAYMENT":
      return 1;
    case "PAYMENT_REVIEW":
      return 2;
    case "CONFIRMED":
    case "COMPLETED":
      return STEPS.length;
    default:
      return 1;
  }
}

/** Animated booking progress: the line fills and each step pops in. */
export function BookingProgress({ status, className }: { status: string; className?: string }) {
  const current = progressStepFor(status);
  const fill = Math.min(current, STEPS.length - 1) / (STEPS.length - 1);

  return (
    <div className={cn("mx-auto w-full max-w-xl px-2", className)} aria-label="ขั้นตอนการจอง">
      <div className="relative">
        {/* Track + animated fill */}
        <div className="absolute left-[12.5%] right-[12.5%] top-4 h-1 rounded-full bg-[#eee6da]" aria-hidden>
          <div
            className="h-full rounded-full animate-grow-x"
            style={{
              width: `${fill * 100}%`,
              background: "linear-gradient(90deg, var(--brand-yellow), var(--brand-red))",
              "--delay": "200ms",
            } as React.CSSProperties}
          />
        </div>

        <ol className="relative grid grid-cols-4">
          {STEPS.map((label, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <li key={label} className="flex flex-col items-center gap-2 text-center">
                <span
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold animate-pop-in",
                    done && "border-[var(--brand-red)] bg-[var(--brand-red)] text-white",
                    active && "border-[var(--brand-yellow)] bg-white text-[var(--brand-brown)]",
                    !done && !active && "border-[#e2d8ca] bg-white text-[#b5a898]"
                  )}
                  style={{ "--delay": `${150 + i * 180}ms` } as React.CSSProperties}
                >
                  {active && (
                    <span className="absolute inset-0 rounded-full bg-[var(--brand-yellow)] animate-status-ping" aria-hidden />
                  )}
                  <span className="relative">{done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}</span>
                </span>
                <span
                  className={cn(
                    "text-[11px] sm:text-xs font-semibold leading-tight",
                    done || active ? "text-[var(--brand-brown)]" : "text-[#b5a898]"
                  )}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

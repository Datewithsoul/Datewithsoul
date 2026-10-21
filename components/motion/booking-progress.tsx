import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["จองที่นั่ง", "ชำระเงิน", "ตรวจสอบสลิป", "ยืนยันแล้ว"];

const PAYMENT_STEP = 1;
const REVIEW_STEP = 2;
const PERCENT = 100;
const FIRST_STEP_DELAY_MS = 150;
const STEP_STAGGER_MS = 180;

const STEP_BY_STATUS: Record<string, number> = {
  CART: 0,
  PENDING_PAYMENT: PAYMENT_STEP,
  PAYMENT_REVIEW: REVIEW_STEP,
  CONFIRMED: STEPS.length,
  COMPLETED: STEPS.length,
};

/** Index of the step currently in progress; STEPS.length means everything is done. */
export function progressStepFor(status: string): number {
  return STEP_BY_STATUS[status] ?? PAYMENT_STEP;
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
              width: `${fill * PERCENT}%`,
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
                  style={{ "--delay": `${FIRST_STEP_DELAY_MS + i * STEP_STAGGER_MS}ms` } as React.CSSProperties}
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

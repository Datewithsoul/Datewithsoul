import { cn } from "@/lib/utils";
import { Confetti } from "./confetti";

type Variant = "success" | "review" | "cancelled";

const THEME: Record<Variant, { bg: string; border: string; ring: string; icon: string; title: string; text: string }> = {
  success: {
    bg: "bg-linear-to-b from-[#effaf1] to-white",
    border: "border-[#bfe5c8]",
    ring: "bg-[#22a35a]",
    icon: "bg-[#22a35a]",
    title: "text-[#16673a]",
    text: "text-[#2d7a4b]",
  },
  review: {
    bg: "bg-linear-to-b from-[#fff8e1] to-white",
    border: "border-[#f2dc9b]",
    ring: "bg-[var(--brand-yellow)]",
    icon: "bg-[var(--brand-yellow)]",
    title: "text-[#6b4e05]",
    text: "text-[#7d6420]",
  },
  cancelled: {
    bg: "bg-linear-to-b from-[#fff3f2] to-white",
    border: "border-[#f3c9c5]",
    ring: "bg-[var(--brand-red)]",
    icon: "bg-[var(--brand-red)]",
    title: "text-[#8a1f17]",
    text: "text-[#9b3a31]",
  },
};

function SuccessIcon() {
  return (
    <svg viewBox="0 0 52 52" className="h-12 w-12" fill="none" stroke="white" strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 27 l8 8 l16 -18" className="draw-stroke" style={{ "--len": 40, "--delay": "350ms" } as React.CSSProperties} />
    </svg>
  );
}

function ReviewIcon() {
  return (
    <div className="relative h-12 w-12">
      <svg viewBox="0 0 48 48" className="absolute inset-0 h-12 w-12 animate-spin-slow" fill="none" aria-hidden>
        <circle cx="24" cy="24" r="21" stroke="var(--brand-brown)" strokeOpacity={0.35} strokeWidth={2.5} strokeDasharray="5 6" />
      </svg>
      <svg viewBox="0 0 24 24" className="absolute inset-0 m-auto h-7 w-7" fill="none" stroke="var(--brand-brown)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M6 2h12M6 22h12M7 2v4a5 5 0 0 0 10 0V2M7 22v-4a5 5 0 0 1 10 0v4" />
      </svg>
    </div>
  );
}

function CancelledIcon() {
  return (
    <svg viewBox="0 0 52 52" className="h-11 w-11" fill="none" stroke="white" strokeWidth={4.5} strokeLinecap="round" aria-hidden>
      <path d="M17 17 L35 35" className="draw-stroke" style={{ "--len": 26, "--delay": "250ms" } as React.CSSProperties} />
      <path d="M35 17 L17 35" className="draw-stroke" style={{ "--len": 26, "--delay": "450ms" } as React.CSSProperties} />
    </svg>
  );
}

/** Animated status card used on payment / booking result screens. */
export function StatusHero({
  variant,
  title,
  description,
  children,
  confettiKey,
}: {
  variant: Variant;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  /** Plays a one-time confetti burst (success only), keyed per booking */
  confettiKey?: string;
}) {
  const t = THEME[variant];

  return (
    <div className={cn("relative mx-auto max-w-2xl overflow-hidden rounded-3xl border p-10 sm:p-12 text-center", t.bg, t.border)}>
      {variant === "success" && confettiKey && <Confetti onceKey={confettiKey} />}

      <div className={cn("relative mx-auto mb-7 flex h-24 w-24 items-center justify-center", variant === "cancelled" && "animate-shake")}>
        {variant !== "cancelled" && (
          <>
            <span className={cn("absolute inset-0 rounded-full animate-ring", t.ring)} />
            <span className={cn("absolute inset-0 rounded-full animate-ring", t.ring)} style={{ "--delay": "900ms" } as React.CSSProperties} />
          </>
        )}
        <span className={cn("relative flex h-24 w-24 items-center justify-center rounded-full shadow-lg animate-pop-in", t.icon)}>
          {variant === "success" && <SuccessIcon />}
          {variant === "review" && <ReviewIcon />}
          {variant === "cancelled" && <CancelledIcon />}
        </span>
      </div>

      <h2 className={cn("text-2xl sm:text-3xl font-bold mb-3 animate-fade-up", t.title)} style={{ "--delay": "250ms" } as React.CSSProperties}>
        {title}
      </h2>

      {variant === "review" && (
        <div className="mb-3 flex justify-center gap-1.5" aria-hidden>
          {[0, 150, 300].map((d) => (
            <span key={d} className="h-2 w-2 rounded-full bg-[var(--brand-brown)] animate-dot-bounce" style={{ "--delay": `${d}ms` } as React.CSSProperties} />
          ))}
        </div>
      )}

      {description && (
        <div className={cn("mb-8 leading-relaxed animate-fade-up", t.text)} style={{ "--delay": "350ms" } as React.CSSProperties}>
          {description}
        </div>
      )}

      {children && (
        <div className="animate-fade-up" style={{ "--delay": "450ms" } as React.CSSProperties}>
          {children}
        </div>
      )}
    </div>
  );
}

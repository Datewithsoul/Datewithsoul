import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function Ornament({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-4", className)} aria-hidden>
      <span className="h-px w-14 sm:w-20 bg-linear-to-r from-transparent to-lux-gold" />
      <Heart className="h-3.5 w-3.5 text-lux-gold" strokeWidth={1.25} />
      <span className="h-px w-14 sm:w-20 bg-linear-to-l from-transparent to-lux-gold" />
    </div>
  );
}

/** Eyebrow label: small, tracked, gold. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[11px] font-semibold uppercase tracking-[0.35em] text-lux-gold", className)}>{children}</p>
  );
}

/**
 * Shared luxury page header: ornament, eyebrow, serif title, lead text and
 * optional actions/stats, each fading up in sequence.
 */
export function PageHero({
  eyebrow,
  title,
  highlight,
  description,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  /** Optional trailing words rendered in italic gold */
  highlight?: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("relative overflow-hidden border-b border-lux-line bg-white", className)}
      style={{
        backgroundImage:
          "radial-gradient(ellipse 70% 60% at 50% 0%, oklch(0.88 0.17 88 / 0.14), transparent 70%)",
      }}
    >
      {/* faint dot texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(var(--brand-brown) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "linear-gradient(to bottom, black, transparent 85%)",
        }}
        aria-hidden
      />

      <div className="stagger relative mx-auto max-w-3xl px-4 pb-14 pt-16 text-center sm:px-6 md:pb-20 md:pt-24">
        <Ornament />
        <Eyebrow className="mt-6">{eyebrow}</Eyebrow>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-brand-brown sm:text-5xl md:text-6xl">
          {title}
          {highlight && (
            <>
              {" "}
              <span className="font-display italic font-normal text-lux-gold">{highlight}</span>
            </>
          )}
        </h1>
        {description && (
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-lux-muted sm:text-lg">{description}</p>
        )}
        {children && <div className="mt-9">{children}</div>}
      </div>
    </section>
  );
}

/** Section heading used inside pages. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div className={cn(align === "center" ? "text-center" : "text-left", className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-3 text-3xl font-semibold leading-snug text-brand-brown sm:text-4xl">{title}</h2>
      {description && (
        <p className={cn("mt-3 leading-relaxed text-lux-muted", align === "center" && "mx-auto max-w-xl")}>{description}</p>
      )}
    </div>
  );
}

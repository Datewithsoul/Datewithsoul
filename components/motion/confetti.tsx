"use client";

import { useEffect, useState } from "react";

const COLORS = [
  "var(--brand-yellow)",
  "var(--brand-red)",
  "oklch(0.62 0.12 75)", // gold
  "oklch(0.75 0.15 150)", // fresh green
  "oklch(0.7 0.14 240)", // soft blue
  "#ffffff",
];

type Piece = {
  left: number;
  delay: number;
  duration: number;
  drift: number;
  spin: number;
  size: number;
  color: string;
  round: boolean;
};

/**
 * One-shot confetti burst. With `onceKey`, it only plays the first time per
 * browser session (so refreshing a "paid" page doesn't replay it forever).
 */
export function Confetti({ pieces = 80, onceKey }: { pieces?: number; onceKey?: string }) {
  const [items, setItems] = useState<Piece[] | null>(null);

  useEffect(() => {
    const key = onceKey ? `confetti:${onceKey}` : null;
    try {
      if (key && sessionStorage.getItem(key)) return;
    } catch {
      // storage unavailable — just play it
    }

    // Generated after mount (random values would mismatch server HTML).
    // The "played" flag is written here, not above, so StrictMode's double
    // effect run in dev doesn't cancel the burst before it starts.
    const frame = requestAnimationFrame(() => {
      try {
        if (key) sessionStorage.setItem(key, "1");
      } catch {}
      setItems(
      Array.from({ length: pieces }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 600,
        duration: 2200 + Math.random() * 1800,
        drift: (Math.random() - 0.5) * 240,
        spin: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 720),
        size: 6 + Math.random() * 7,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        round: Math.random() > 0.6,
      }))
      );
    });
    const timer = setTimeout(() => setItems(null), 5000);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [pieces, onceKey]);

  if (!items) return null;

  return (
    <div className="confetti-root pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden>
      {items.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.round ? p.size : p.size * 0.45,
              borderRadius: p.round ? "9999px" : "2px",
              backgroundColor: p.color,
              boxShadow: "0 0 0 1px rgb(0 0 0 / 0.06)",
              "--delay": `${p.delay}ms`,
              "--duration": `${p.duration}ms`,
              "--drift": `${p.drift}px`,
              "--spin": `${p.spin}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

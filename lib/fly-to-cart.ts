// Client-side "fly to cart" effect: a thumbnail arcs from the clicked button
// into the navbar cart icon, then the cart is told to bump.

export const CART_BUMP_EVENT = "cart:bump";

function center(rect: DOMRect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function findCartTarget(): HTMLElement | null {
  // Pick the first cart icon that is actually on screen (desktop vs mobile navbars)
  const candidates = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-target]"));
  return candidates.find((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }) ?? null;
}

export function flyToCart(from: HTMLElement, imageUrl?: string) {
  const bump = () => window.dispatchEvent(new CustomEvent(CART_BUMP_EVENT));
  const target = findCartTarget();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!target || reduceMotion || typeof document.body.animate !== "function") {
    bump();
    return;
  }

  const start = center(from.getBoundingClientRect());
  const end = center(target.getBoundingClientRect());
  const size = 72;

  const ghost = document.createElement("div");
  ghost.setAttribute("aria-hidden", "true");
  Object.assign(ghost.style, {
    position: "fixed",
    left: "0px",
    top: "0px",
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "9999px",
    zIndex: "200",
    pointerEvents: "none",
    border: "3px solid white",
    boxShadow: "0 12px 28px -8px rgb(60 40 20 / 0.45)",
    background: imageUrl
      ? `center / cover no-repeat url("${imageUrl.replace(/"/g, "%22")}")`
      : "var(--brand-yellow)",
  } satisfies Partial<CSSStyleDeclaration>);
  document.body.appendChild(ghost);

  // Sample a quadratic Bézier so the flight follows a soft arc upward
  const control = { x: (start.x + end.x) / 2, y: Math.min(start.y, end.y) - 160 };
  const steps = 14;
  const keyframes: Keyframe[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = (1 - t) ** 2 * start.x + 2 * (1 - t) * t * control.x + t ** 2 * end.x;
    const y = (1 - t) ** 2 * start.y + 2 * (1 - t) * t * control.y + t ** 2 * end.y;
    const scale = i === 0 ? 0.4 : t < 0.15 ? 1.1 : 1 - t * 0.78;
    keyframes.push({
      transform: `translate(${x - size / 2}px, ${y - size / 2}px) scale(${scale}) rotate(${t * 220}deg)`,
      opacity: t > 0.92 ? 0.4 : 1,
      offset: t,
    });
  }

  const flight = ghost.animate(keyframes, { duration: 850, easing: "cubic-bezier(0.45, 0, 0.25, 1)", fill: "forwards" });
  flight.onfinish = () => {
    ghost.remove();
    bump();
  };
  flight.oncancel = () => ghost.remove();
}

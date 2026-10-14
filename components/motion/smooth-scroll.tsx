"use client";

import { ReactLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import "lenis/dist/lenis.css";

// Elements that manage their own scrolling (dialogs, drawers, popovers, menus)
const NATIVE_SCROLL_SELECTOR = [
  "[data-lenis-prevent]",
  "[role='dialog']",
  "[role='listbox']",
  "[role='menu']",
  "[data-vaul-drawer]",
  "[data-slot='popover-content']",
  "[data-slot='select-content']",
].join(",");

/**
 * Smooth, eased page scrolling for the customer site (wheel / trackpad).
 * Touch devices keep native scrolling, the admin dashboard is excluded, and
 * reduced-motion users get 1:1 scrolling (Lenis respects the media query).
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        anchors: { offset: -80 },
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
        prevent: (node) => !!node.closest?.(NATIVE_SCROLL_SELECTOR),
      }}
    >
      {children}
    </ReactLenis>
  );
}

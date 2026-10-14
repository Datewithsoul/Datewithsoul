"use client";

import { usePathname } from "next/navigation";

// The customer footer is rendered from the root layout; the admin dashboard has its own shell
export function SiteFooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <>{children}</>;
}

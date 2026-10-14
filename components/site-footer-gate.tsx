"use client";

import { usePathname } from "next/navigation";

// The customer footer is rendered from the root layout; admin has its own shell and login is a full-screen split layout
export function SiteFooterGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname === "/login") return null;
  return <>{children}</>;
}

import type { ReactNode } from "react";
import { noIndexMetadata } from "@/lib/seo";

export const metadata = { title: "ยินดีต้อนรับ", ...noIndexMetadata };

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return children;
}

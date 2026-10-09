import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const sarabun = Sarabun({
  variable: "--font-sans",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://datewithsoul.vercel.app"
);

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "Date with Soul Love — คลาสทำความรู้จักตัวเอง ความสัมพันธ์ จิตวิทยา",
  description:
    "จองคลาสพัฒนาตัวเอง Date with Soul Love สำหรับคนที่อยากมีความสัมพันธ์ที่ดีกับตัวเอง เรียนรู้ผ่านประสบการณ์จริง กลุ่มเล็ก บรรยากาศอบอุ่น สอนเรื่องจิตวิทยาความสัมพันธ์ ความรัก และการเข้าใจตนเอง",
  keywords: [
    "ความสัมพันธ์",
    "พัฒนาตัวเอง",
    "จิตวิทยา",
    "รู้จักตัวเอง",
    "เวิร์คช็อป",
    "ความรัก",
    "ซึมเศร้า",
    "ฮีลใจ",
    "ดูแลจิตใจ",
    "Date with Soul Love"
  ],
  authors: [{ name: "Date with Soul Love" }],
  robots: "index, follow",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "th_TH",
    url: siteUrl,
    siteName: "Date with Soul Love",
    title: "Date with Soul Love — คลาสทำความรู้จักตัวเอง",
    description:
      "จองคลาสสำหรับคนที่อยากมีความสัมพันธ์ที่ดีกับตัวเอง เรียนรู้ผ่านประสบการณ์จริง กลุ่มเล็ก บรรยากาศอบอุ่น",
    images: [{ url: "/logo.jpg", width: 1200, height: 630, alt: "Date with Soul Love" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Date with Soul Love — คลาสทำความรู้จักตัวเอง",
    description:
      "จองคลาสสำหรับคนที่อยากมีความสัมพันธ์ที่ดีกับตัวเอง เรียนรู้ผ่านประสบการณ์จริง กลุ่มเล็ก บรรยากาศอบอุ่น",
    images: ["/logo.jpg"],
  },
};

import { CartProvider } from "@/hooks/use-cart";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${sarabun.variable} h-full antialiased`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </CartProvider>
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  );
}

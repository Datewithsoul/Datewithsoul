import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";
import { IBM_Plex_Sans_Thai_Looped, Noto_Serif_Thai, Playfair_Display } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

// Body text: looped Thai sans for readability
const bodySans = IBM_Plex_Sans_Thai_Looped({
  variable: "--font-sans",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Headings: Thai serif
const headingSerif = Noto_Serif_Thai({
  variable: "--font-serif-thai",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

// Brand wordmark / small English accents only
const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Date with Soul Love — คลาสทำความรู้จักตัวเอง ความสัมพันธ์ จิตวิทยา",
    template: `%s | ${SITE_NAME}`,
  },
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
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: "website",
    locale: "th_TH",
    siteName: SITE_NAME,
    title: "Date with Soul Love — คลาสทำความรู้จักตัวเอง",
    description:
      "จองคลาสสำหรับคนที่อยากมีความสัมพันธ์ที่ดีกับตัวเอง เรียนรู้ผ่านประสบการณ์จริง กลุ่มเล็ก บรรยากาศอบอุ่น",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary",
    title: "Date with Soul Love — คลาสทำความรู้จักตัวเอง",
    description:
      "จองคลาสสำหรับคนที่อยากมีความสัมพันธ์ที่ดีกับตัวเอง เรียนรู้ผ่านประสบการณ์จริง กลุ่มเล็ก บรรยากาศอบอุ่น",
    images: ["/logo.jpg"],
  },
};

import { CartProvider } from "@/hooks/use-cart";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { Footer } from "@/components/footer";
import { SiteFooterGate } from "@/components/site-footer-gate";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${bodySans.variable} ${headingSerif.variable} ${display.variable} h-full antialiased`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">
        <SmoothScroll>
          <CartProvider>
            <TooltipProvider>
              {children}
              <SiteFooterGate>
                <Footer />
              </SiteFooterGate>
            </TooltipProvider>
          </CartProvider>
        </SmoothScroll>
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  );
}

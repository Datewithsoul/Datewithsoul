import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const sarabun = Sarabun({
  variable: "--font-sans",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Date with Soul Love — คลาสทำความรู้จักตัวเอง",
  description:
    "จองคลาสสำหรับคนที่อยากมีความสัมพันธ์ที่ดีกับตัวเอง เรียนรู้ผ่านประสบการณ์จริง กลุ่มเล็ก บรรยากาศอบอุ่น",
};

import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className={`${sarabun.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}

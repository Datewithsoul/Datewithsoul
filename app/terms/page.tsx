import Navbar from "@/components/navbar";
import { LegalPage } from "@/components/site/legal-page";
import { BOOKING_POLICY_SECTIONS } from "@/lib/booking-policy";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "นโยบายการจองและกฎเกณฑ์",
  description:
    "นโยบายการจองและกฎเกณฑ์ในการเข้าร่วมคลาสเรียนของ Date with Soul Love",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-brand-brown">
      <Navbar />
      <LegalPage
        eyebrow="Booking policy"
        title="นโยบายการจอง"
        highlight="และกฎเกณฑ์"
        updated="พฤศจิกายน 2026"
        intro="เพื่อให้ทุกคลาสเป็นประสบการณ์ที่ดีสำหรับทุกคน กรุณาอ่านนโยบายการจองและกฎเกณฑ์นี้ก่อนทำการจอง"
        sections={BOOKING_POLICY_SECTIONS}
        related={[
          { href: "/privacy", label: "นโยบายความเป็นส่วนตัว" },
          { href: "/faq", label: "คำถามที่พบบ่อย" },
          { href: "/contact", label: "ติดต่อเรา" },
        ]}
      />
    </div>
  );
}

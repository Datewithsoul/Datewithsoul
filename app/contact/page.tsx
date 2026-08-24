import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Contact } from "@/components/contact";

export const metadata = {
  title: "ติดต่อเรา | Date with Soul Love",
  description: "ติดต่อ Date with Soul Love ผ่าน LINE, Instagram หรืออีเมล",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      <main>
        {/* Hero */}
        <section className="py-14 text-center px-4" style={{ backgroundColor: "var(--brand-yellow)" }}>
          <h1
            className="text-4xl md:text-5xl font-black leading-tight mb-3"
            style={{ color: "var(--brand-brown)" }}
          >
            ติดต่อ<span style={{ color: "var(--brand-red)" }}>เรา</span>
          </h1>
          <p className="text-base font-medium max-w-md mx-auto" style={{ color: "var(--brand-brown)" }}>
            ทีมงานพร้อมตอบทุกคำถาม ไม่ว่าจะเป็นเรื่องคลาส การจอง หรือข้อสงสัยอื่นๆ
          </p>
        </section>

        {/* Contact section */}
        <Contact />
      </main>

      <Footer />
    </div>
  );
}

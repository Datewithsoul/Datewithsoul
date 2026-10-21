import Link from "next/link";
import { ArrowLeft, Lock, User, LayoutDashboard, Wallet, BellRing } from "lucide-react";
import { adminLogin } from "./actions";
import { noIndexMetadata } from "@/lib/seo";
import { PasswordInput } from "./password-input";
import { SubmitButton } from "@/components/submit-button";

const inputClass =
  "w-full rounded-xl border border-lux-line bg-white py-3 pl-11 pr-12 text-brand-brown placeholder:text-lux-muted/60 transition-all focus:border-lux-gold focus:outline-none focus:ring-4 focus:ring-lux-gold/15";

const features = [
  { icon: LayoutDashboard, text: "ภาพรวมการจองและรายได้" },
  { icon: Wallet, text: "ตรวจสอบสลิปและยืนยันการชำระเงิน" },
  { icon: BellRing, text: "แจ้งเตือนลูกค้าผ่าน LINE" },
];

export const metadata = { title: "Admin", ...noIndexMetadata };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col bg-lux-cream font-sans text-brand-brown lg:flex-row">
      {/* Console panel */}
      <aside className="relative hidden overflow-hidden bg-brand-brown text-white lg:flex lg:w-[42%] lg:flex-col lg:justify-between lg:p-14">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-lux-gold opacity-20 blur-3xl" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
          aria-hidden
        />

        <p className="relative font-display text-xl tracking-wide animate-fade-up">
          Date with <em className="text-brand-yellow">Soul Love</em>
        </p>

        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-brand-yellow animate-fade-up" style={{ "--delay": "120ms" } as React.CSSProperties}>
            Admin console
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight animate-fade-up" style={{ "--delay": "220ms" } as React.CSSProperties}>
            ระบบจัดการ
            <br />
            <span className="font-display italic font-normal text-brand-yellow">หลังร้าน</span>
          </h2>
          <ul className="mt-10 flex flex-col gap-4">
            {features.map(({ icon: Icon, text }, i) => (
              <li
                key={text}
                className="flex items-center gap-4 text-white/75 animate-fade-up"
                style={{ "--delay": `${360 + i * 110}ms` } as React.CSSProperties}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5">
                  <Icon className="h-4.5 w-4.5 text-brand-yellow" strokeWidth={1.5} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/40">สำหรับเจ้าหน้าที่เท่านั้น</p>
      </aside>

      {/* Form */}
      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-8">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-lux-line bg-white p-8 shadow-[0_30px_60px_-30px_oklch(0.35_0.065_55/0.35)] sm:p-10 animate-fade-up">
            <div className="stagger">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-brown text-brand-yellow">
                <Lock className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <h1 className="mt-6 text-3xl font-semibold">เข้าสู่ระบบผู้ดูแล</h1>
              <p className="mt-2 text-lux-muted">กรอกชื่อผู้ใช้หรืออีเมล และรหัสผ่านเพื่อเข้าสู่ระบบจัดการ</p>
            </div>

            {error && (
              <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 animate-shake">
                {error}
              </div>
            )}

            <form action={adminLogin} className="stagger mt-8 flex flex-col gap-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium">
                  ชื่อผู้ใช้ หรือ อีเมล
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-lux-muted" />
                  <input
                    id="email"
                    type="text"
                    name="email"
                    required
                    autoComplete="username"
                    placeholder="admin หรือ admin@example.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium">
                  รหัสผ่าน
                </label>
                <PasswordInput className={inputClass} />
              </div>

              <SubmitButton
                loadingText="กำลังเข้าสู่ระบบ..."
                className="mt-2 w-full rounded-xl bg-brand-brown py-3.5 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#2c241d] hover:shadow-lg active:translate-y-0"
              >
                เข้าสู่ระบบ
              </SubmitButton>
            </form>
          </div>

          <Link
            href="/"
            className="group mx-auto mt-8 flex w-fit items-center gap-2 text-sm text-lux-muted transition-colors hover:text-brand-brown"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            กลับไปหน้าเว็บไซต์หลัก
          </Link>
        </div>
      </main>
    </div>
  );
}

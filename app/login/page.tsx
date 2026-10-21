import Link from "next/link";
import { Heart, Bell, CalendarCheck, ShieldCheck } from "lucide-react";
import { Ornament } from "@/components/site/page-hero";
import { noIndexMetadata } from "@/lib/seo";

export const metadata = { title: "เข้าสู่ระบบ", ...noIndexMetadata };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const errorMsg = resolvedSearchParams.error;

  const lineClientId = process.env.LINE_CLIENT_ID || "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://datewithsoul.vercel.app";
  const redirectUri = `${siteUrl}/api/auth/line/callback`;
  const params = new URLSearchParams({
    response_type: "code",
    client_id: lineClientId,
    redirect_uri: redirectUri,
    state: "datewithsoul123",
    scope: "profile openid",
    bot_prompt: "normal"
  });
  const authUrl = `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;

  const perks = [
    { icon: CalendarCheck, text: "จองคลาสและติดตามสถานะได้ในที่เดียว" },
    { icon: Bell, text: "รับแจ้งเตือนการยืนยันและเตือนก่อนวันเรียนทาง LINE" },
    { icon: ShieldCheck, text: "ไม่ต้องจำรหัสผ่าน ปลอดภัยด้วยบัญชี LINE ของคุณ" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white font-sans text-brand-brown lg:flex-row">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-brand-brown text-white lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:p-14 xl:p-20">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-yellow opacity-25 blur-3xl animate-float" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-brand-red opacity-20 blur-3xl" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          aria-hidden
        />

        <Link href="/" className="relative w-fit animate-fade-up">
          <span className="font-display text-2xl tracking-wide">
            Date with <em className="text-brand-yellow">Soul Love</em>
          </span>
        </Link>

        <div className="relative">
          <p className="font-display text-sm italic text-brand-yellow animate-fade-up" style={{ "--delay": "150ms" } as React.CSSProperties}>
            Welcome back
          </p>
          <h2
            className="mt-4 text-4xl font-semibold leading-tight xl:text-5xl animate-fade-up"
            style={{ "--delay": "250ms" } as React.CSSProperties}
          >
            พื้นที่ปลอดภัย
            <br />
            สำหรับการเดินทาง<span className="font-display italic font-normal text-brand-yellow">สู่ตัวเอง</span>
          </h2>
          <ul className="mt-10 flex flex-col gap-4">
            {perks.map(({ icon: Icon, text }, i) => (
              <li
                key={text}
                className="flex items-center gap-4 text-white/80 animate-fade-up"
                style={{ "--delay": `${400 + i * 120}ms` } as React.CSSProperties}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5">
                  <Icon className="h-4.5 w-4.5 text-brand-yellow" strokeWidth={1.5} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/40">© {new Date().getFullYear()} Date with Soul Love</p>
      </aside>

      {/* Sign-in */}
      <main
        className="relative flex flex-1 items-center justify-center px-4 py-16 sm:px-8"
        style={{ backgroundImage: "radial-gradient(ellipse 70% 50% at 50% 0%, oklch(0.88 0.17 88 / 0.12), transparent 70%)" }}
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="mb-10 flex items-center justify-center gap-2 lg:hidden">
            <Heart className="h-5 w-5 text-brand-red" fill="currentColor" />
            <span className="font-display text-xl">
              Date with <em className="text-lux-gold">Soul Love</em>
            </span>
          </Link>

          <div className="stagger text-center">
            <Ornament />
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.35em] text-lux-gold">Sign in</p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">เข้าสู่ระบบ / สมัครสมาชิก</h1>
            <p className="mt-3 text-lux-muted">ดำเนินการต่ออย่างรวดเร็วด้วยบัญชี LINE ของคุณ</p>

            {errorMsg && (
              <div role="alert" className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 animate-shake">
                {errorMsg}
              </div>
            )}

            <div className="mt-10">
              <a
                href={authUrl}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-[#06C755] px-6 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-14px_#06C755] active:translate-y-0"
              >
                <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/25 transition-transform duration-700 group-hover:translate-x-[300%]" aria-hidden />
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M24 10.304c0-5.369-5.383-9.738-12-9.738S0 4.935 0 10.304c0 4.814 4.269 8.846 10.036 9.608.391.084.922.258 1.057.592.122.303.079.778.038 1.085l-.171 1.027c-.053.303-.242 1.186 1.039.647 1.281-.54 6.911-4.069 9.428-6.967 1.739-1.907 2.573-3.843 2.573-5.992zm-14.15-2.091h1.378c.328 0 .592.264.592.592v3.743c0 .328-.264.592-.592.592h-1.378c-.328 0-.592-.264-.592-.592V8.805c0-.328.264-.592.592-.592zm5.727 0h1.378c.328 0 .592.264.592.592v3.743c0 .328-.264.592-.592.592h-1.378c-.328 0-.592-.264-.592-.592V8.805c0-.328.264-.592.592-.592zm-2.862 0h1.378c.328 0 .592.264.592.592v2.559h1.345c.328 0 .592.264.592.592v.592c0 .328-.264.592-.592.592h-2.715c-.328 0-.592-.264-.592-.592V8.805c0-.328.264-.592.592-.592zm-5.727 0h1.378c.328 0 .592.264.592.592v3.743c0 .328-.264.592-.592.592h-1.378c-.328 0-.592-.264-.592-.592V8.805c0-.328.264-.592.592-.592z"/>
              </svg>
                ดำเนินการต่อด้วย LINE
              </a>
            </div>

            <p className="mt-8 text-xs leading-relaxed text-lux-muted">
              การเข้าสู่ระบบถือว่าคุณยอมรับ{" "}
              <Link href="/terms" className="text-brand-brown underline underline-offset-2 hover:text-lux-gold">เงื่อนไขการจอง</Link>
              {" "}และ{" "}
              <Link href="/privacy" className="text-brand-brown underline underline-offset-2 hover:text-lux-gold">นโยบายความเป็นส่วนตัว</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/navbar";
import { Eyebrow, Ornament } from "@/components/site/page-hero";
import { BookingProgress } from "@/components/motion/booking-progress";
import CheckoutClient from "./checkout-client";
import { noIndexMetadata } from "@/lib/seo";

export const metadata = { title: "ตะกร้า", ...noIndexMetadata };

export default async function CartPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const dbUser = authUser
    ? await prisma.user.findUnique({ where: { id: authUser.id }, select: { name: true, phone: true } })
    : null;

  return (
    <div className="min-h-screen bg-white font-sans text-brand-brown">
      <Navbar />

      <header
        className="relative overflow-hidden border-b border-lux-line"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 70% at 50% 0%, oklch(0.88 0.17 88 / 0.14), transparent 70%)",
        }}
      >
        <div className="stagger mx-auto max-w-3xl px-4 pb-10 pt-12 text-center sm:px-6 md:pb-12 md:pt-16">
          <Ornament />
          <Eyebrow className="mt-5">Checkout</Eyebrow>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">ตะกร้าของคุณ</h1>
          <BookingProgress status="CART" className="mt-8" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
        <CheckoutClient isLoggedIn={!!authUser} defaultName={dbUser?.name ?? ""} defaultEmail={authUser?.email ?? ""} defaultPhone={dbUser?.phone ?? ""} />
      </main>
    </div>
  );
}

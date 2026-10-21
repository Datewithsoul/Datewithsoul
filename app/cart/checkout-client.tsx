"use client";

import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createCartBookings } from "./actions";
import { toast } from "sonner";
import { ArrowRight, Loader2, Plus, ShoppingBag } from "lucide-react";
import CartItemRow from "@/components/cart-item-row";
import { Eyebrow } from "@/components/site/page-hero";
import { Reveal } from "@/components/motion/reveal";
import { BookerFields, CheckoutNotes, PromoCodeField, checkoutButtonClass } from "@/components/checkout/checkout-ui";
import { baht, discountFor, type AppliedPromo } from "@/lib/promo";

type CheckoutClientProps = {
  isLoggedIn: boolean;
  defaultName: string;
  defaultEmail: string;
  defaultPhone: string;
};

export default function CheckoutClient({ isLoggedIn, defaultName, defaultEmail, defaultPhone }: CheckoutClientProps) {
  const { items, totalPrice, totalItems, clearCart, isLoaded } = useCart();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [promo, setPromo] = useState<AppliedPromo | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      toast.info("กรุณาเข้าสู่ระบบก่อนชำระเงิน");
      router.push("/login?redirectTo=/cart");
    }
  }, [isLoggedIn, router]);

  const discountAmount = discountFor(promo, totalPrice);
  const finalPrice = totalPrice - discountAmount;
  const isFree = finalPrice <= 0;

  const handleCheckout = (formData: FormData) => {
    startTransition(async () => {
      try {
        const booker = {
          name: formData.get("name") as string,
          email: formData.get("email") as string,
          phone: formData.get("phone") as string,
          note: (formData.get("note") as string) || undefined,
        };
        const bookingItems = items.map((item) => ({ classEventId: item.classEventId, seats: item.seats }));

        const result = await createCartBookings(bookingItems, booker, promo?.code);

        if (result.error) {
          toast.error("เกิดข้อผิดพลาด: " + result.error);
          return;
        }
        if (result.groupId) {
          clearCart();
          toast.success("สร้างรายการจองสำเร็จ!");
          router.push(isFree ? "/bookings" : `/payment/group/${result.groupId}`);
        }
      } catch {
        toast.error("เกิดข้อผิดพลาดที่ไม่รู้จัก กรุณาลองใหม่");
      }
    });
  };

  if (!isLoggedIn || !isLoaded) return <CheckoutSkeleton />;
  if (items.length === 0) return <EmptyCart />;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
      <div className="flex flex-col gap-12">
        {/* Items */}
        <section aria-labelledby="cart-items-heading">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-lux-line pb-4">
            <div>
              <Eyebrow>Your classes</Eyebrow>
              <h2 id="cart-items-heading" className="mt-2 text-2xl font-semibold">
                รายการคลาส <span className="text-lux-muted">({items.length})</span>
              </h2>
            </div>
            <Link
              href="/classes"
              className="flex shrink-0 items-center gap-1 text-sm font-medium text-lux-muted transition-colors hover:text-brand-brown"
            >
              <Plus className="h-4 w-4" />
              เลือกคลาสเพิ่ม
            </Link>
          </div>
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <CartItemRow key={item.classEventId} item={item} />
            ))}
          </div>
        </section>

        {/* Booker details */}
        <section aria-labelledby="booker-heading">
          <div className="mb-6 border-b border-lux-line pb-4">
            <Eyebrow>Your details</Eyebrow>
            <h2 id="booker-heading" className="mt-2 text-2xl font-semibold">ข้อมูลผู้จอง</h2>
          </div>
          <form id="checkout-form" action={handleCheckout} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <BookerFields defaultName={defaultName} defaultEmail={defaultEmail} defaultPhone={defaultPhone} />
          </form>
        </section>
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-24 lg:self-start" aria-labelledby="summary-heading">
        <div className="rounded-3xl border border-lux-line bg-lux-cream p-6 sm:p-7">
          <Eyebrow>Summary</Eyebrow>
          <h2 id="summary-heading" className="mt-2 text-xl font-semibold">สรุปคำสั่งจอง</h2>

          <ul className="mt-5 flex flex-col gap-2.5 border-b border-lux-line pb-5 text-sm">
            {items.map((item) => (
              <li key={item.classEventId} className="flex justify-between gap-4">
                <span className="min-w-0 truncate text-lux-muted">
                  {item.className} <span className="whitespace-nowrap">× {item.seats}</span>
                </span>
                <span className="shrink-0 tabular-nums">{baht(item.price * item.seats)}</span>
              </li>
            ))}
          </ul>

          {/* Promo code */}
          <div className="border-b border-lux-line py-5">
            <PromoCodeField classEventIds={items.map((item) => item.classEventId)} promo={promo} onChange={setPromo} />
          </div>

          {/* Totals */}
          <dl className="flex flex-col gap-2 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-lux-muted">ราคารวม ({totalItems} ที่นั่ง)</dt>
              <dd className="tabular-nums">{baht(totalPrice)}</dd>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-brand-red">
                <dt>ส่วนลด</dt>
                <dd className="tabular-nums">−{baht(discountAmount)}</dd>
              </div>
            )}
            <div className="mt-3 flex items-end justify-between border-t border-lux-line pt-4">
              <dt className="font-semibold">ยอดชำระสุทธิ</dt>
              <dd className="font-heading text-3xl font-semibold leading-none tabular-nums">{baht(finalPrice)}</dd>
            </div>
          </dl>

          <button type="submit" form="checkout-form" disabled={isPending} className={checkoutButtonClass}>
            <SubmitLabel isPending={isPending} isFree={isFree} />
          </button>

          <CheckoutNotes isFree={isFree} />
        </div>
      </aside>
    </div>
  );
}

function SubmitLabel({ isPending, isFree }: { isPending: boolean; isFree: boolean }) {
  if (isPending) {
    return (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        กำลังดำเนินการ...
      </>
    );
  }
  return (
    <>
      {isFree ? "ยืนยันการจอง (เรียนฟรี)" : "ยืนยันและไปหน้าชำระเงิน"}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </>
  );
}

function EmptyCart() {
  return (
    <Reveal className="mx-auto max-w-lg rounded-3xl border border-lux-line bg-lux-cream p-12 text-center">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm animate-float">
        <ShoppingBag className="h-7 w-7 text-lux-gold" />
      </div>
      <h2 className="text-xl font-semibold">ตะกร้ายังว่างอยู่</h2>
      <p className="mt-2 text-lux-muted">เลือกคลาสที่ใช่สำหรับคุณ แล้วกลับมาจองที่นี่ได้เลย</p>
      <Link
        href="/classes"
        className="mt-6 inline-block rounded-full bg-brand-brown px-7 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
      >
        ดูคลาสเรียนทั้งหมด
      </Link>
    </Reveal>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12" aria-busy="true" aria-label="กำลังโหลดตะกร้า">
      <div className="flex flex-col gap-4">
        <div className="mb-2 h-8 w-48 animate-pulse rounded-lg bg-lux-cream" />
        <div className="h-32 animate-pulse rounded-2xl bg-lux-cream" />
        <div className="h-32 animate-pulse rounded-2xl bg-lux-cream" />
      </div>
      <div className="h-96 animate-pulse rounded-3xl bg-lux-cream" />
    </div>
  );
}

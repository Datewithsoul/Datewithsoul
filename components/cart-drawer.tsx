"use client";

import { useCart } from "@/hooks/use-cart";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import CartItemRow from "./cart-item-row";
import { cn } from "@/lib/utils";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CLOSE_MS = 300;

export default function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, totalPrice, totalItems } = useCart();
  const router = useRouter();
  const lenis = useLenis();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Stay mounted while the close animation plays
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setMounted(true);
      setClosing(false);
    } else if (mounted) {
      setClosing(true);
    }
  }

  useEffect(() => {
    if (!closing) return;
    const t = setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, CLOSE_MS);
    return () => clearTimeout(t);
  }, [closing]);

  // Freeze page scrolling behind the drawer, close on Escape / outside click
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
    const onDown = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, onOpenChange, lenis]);

  if (!mounted) return null;

  const handleCheckout = () => {
    onOpenChange(false);
    router.push("/cart");
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-100 flex justify-end bg-brand-brown/35 backdrop-blur-sm",
        closing ? "animate-backdrop-out" : "animate-backdrop-in"
      )}
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="ตะกร้าของคุณ"
        className={cn(
          "flex h-full w-full max-w-md flex-col bg-white shadow-2xl",
          closing ? "animate-drawer-out" : "animate-drawer-in"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-lux-line px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-yellow text-brand-brown">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-heading text-xl font-semibold text-brand-brown">ตะกร้าของคุณ</h2>
              <p className="text-xs text-lux-muted">{totalItems > 0 ? `${totalItems} รายการ` : "ยังไม่มีคลาสในตะกร้า"}</p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-lux-muted transition-all duration-300 hover:rotate-90 hover:bg-lux-cream hover:text-brand-brown"
            aria-label="ปิดตะกร้า"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto bg-lux-cream/40 p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center animate-fade-up">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm animate-float">
                <ShoppingBag className="h-8 w-8 text-lux-gold" strokeWidth={1.5} />
              </span>
              <div>
                <p className="font-semibold text-brand-brown">ตะกร้ายังว่างอยู่</p>
                <p className="mt-1 text-sm text-lux-muted">เลือกคลาสที่สนใจแล้วกดเพิ่มลงตะกร้าได้เลย</p>
              </div>
              <Link
                href="/classes"
                onClick={() => onOpenChange(false)}
                className="mt-2 rounded-full bg-brand-brown px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                ดูคลาสเรียน
              </Link>
            </div>
          ) : (
            <div className="stagger flex flex-col gap-4">
              {items.map((item) => (
                <CartItemRow key={item.classEventId} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-lux-line bg-white p-5 shadow-[0_-8px_24px_-12px_rgb(60_40_20/0.15)]">
            <div className="mb-4 flex items-end justify-between">
              <span className="text-sm text-lux-muted">ยอดรวมทั้งหมด</span>
              <span key={totalPrice} className="font-heading text-3xl font-semibold text-brand-brown animate-pop-in">
                ฿{totalPrice.toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-brand-red py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-14px_var(--brand-red)] active:translate-y-0"
            >
              <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/25 transition-transform duration-700 group-hover:translate-x-[300%]" aria-hidden />
              ดำเนินการชำระเงิน
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useEffect, useState } from "react";
import CartDrawer from "./cart-drawer";
import { CART_BUMP_EVENT } from "@/lib/fly-to-cart";
import { cn } from "@/lib/utils";

export default function CartButton() {
  const { totalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  // Incremented on every "item landed" event; used as a key to restart the bump animation
  const [bumps, setBumps] = useState(0);

  useEffect(() => {
    const onBump = () => setBumps((n) => n + 1);
    window.addEventListener(CART_BUMP_EVENT, onBump);
    return () => window.removeEventListener(CART_BUMP_EVENT, onBump);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        data-cart-target
        className="group relative flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-brand-brown bg-brand-yellow text-brand-brown shadow-[2px_2px_0_var(--brand-brown)] transition-all duration-200 hover:-translate-x-px hover:-translate-y-px hover:shadow-[3px_3px_0_var(--brand-brown)] active:translate-x-px active:translate-y-px active:shadow-none"
        aria-label={`ตะกร้าสินค้า${totalItems > 0 ? ` (${totalItems} รายการ)` : ""}`}
      >
        <span key={bumps} className={cn("flex", bumps > 0 && "animate-cart-bump")}>
          <ShoppingBag size={18} className="transition-transform duration-300 group-hover:-rotate-12" />
        </span>

        {bumps > 0 && <span key={`ring-${bumps}`} className="pointer-events-none absolute inset-0 rounded-full border-2 border-brand-red animate-cart-ring" aria-hidden />}

        {totalItems > 0 && (
          <span
            key={`badge-${totalItems}`}
            className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-white bg-[#E51D53] px-1 text-[10px] font-bold text-white animate-pop-in"
          >
            {totalItems > 9 ? "9+" : totalItems}
          </span>
        )}
      </button>

      <CartDrawer open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

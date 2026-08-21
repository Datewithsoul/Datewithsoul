"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useState } from "react";
import CartDrawer from "./cart-drawer";

export default function CartButton() {
  const { totalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex items-center justify-center bg-[var(--brand-yellow)] rounded-full border-[1.5px] border-[var(--brand-brown)] hover:shadow-md transition-all text-[var(--brand-brown)] w-9 h-9"
        style={{
          boxShadow: "2px 2px 0 var(--brand-brown)",
        }}
        aria-label="ตะกร้าสินค้า"
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "translate(-1px,-1px)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "3px 3px 0 var(--brand-brown)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = "";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "2px 2px 0 var(--brand-brown)";
        }}
      >
        <ShoppingBag size={18} />
        {totalItems > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#E51D53] text-[10px] font-bold text-white border border-white">
            {totalItems > 9 ? "9+" : totalItems}
          </span>
        )}
      </button>

      <CartDrawer open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

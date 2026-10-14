"use client";

import { useCart } from "@/hooks/use-cart";
import { X, Trash2, Plus, Minus, CalendarDays, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import CartItemRow from "./cart-item-row";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { items, removeFromCart, updateSeats, totalPrice } = useCart();
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onOpenChange]);

  if (!open) return null;

  const handleCheckout = () => {
    onOpenChange(false);
    router.push("/cart");
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
      <div
        ref={drawerRef}
        className="h-full w-full max-w-md bg-white shadow-xl flex flex-col animate-in slide-in-from-right"
        style={{ borderLeft: "2px solid var(--brand-brown)" }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-[#fefefe]">
          <h2 className="text-xl font-bold text-[var(--brand-brown)]">ตะกร้าของคุณ</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-gray-50/50">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Trash2 size={24} className="text-gray-300" />
              </div>
              <p className="font-medium">ตะกร้าว่างเปล่า</p>
            </div>
          ) : (
            items.map((item) => (
              <CartItemRow key={item.classEventId} item={item} />
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-white shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-end mb-4">
              <span className="text-gray-600 font-medium">ยอดรวมทั้งหมด</span>
              <span className="text-2xl font-black text-[#E51D53]">
                ฿{totalPrice.toLocaleString()}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3.5 rounded-xl font-bold text-white transition-all bg-[#222222] hover:bg-black"
            >
              ดำเนินการชำระเงิน
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

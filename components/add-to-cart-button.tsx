"use client";

import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { flyToCart } from "@/lib/fly-to-cart";
import { ClassEvent } from "@/app/generated/prisma";

interface AddToCartButtonProps {
  classEvent: Pick<ClassEvent, "id" | "name" | "date" | "startTime" | "endTime" | "price" | "totalSeats">;
  mediaUrl?: string;
  className?: string;
  /** "pop" = original comic style, "lux" = outline style used on the luxury class page */
  variant?: "pop" | "lux";
}

export default function AddToCartButton({ classEvent, mediaUrl, className = "", variant = "pop" }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(classEvent.date) < today) {
      toast.error("ไม่สามารถจองได้แล้ว", { description: "คลาสนี้ผ่านวันเรียนแล้ว" });
      return;
    }
    addToCart({
      classEventId: classEvent.id,
      className: classEvent.name,
      date: new Date(classEvent.date),
      startTime: classEvent.startTime,
      endTime: classEvent.endTime,
      price: classEvent.price,
      seats: 1,
      maxSeats: classEvent.totalSeats,
      mediaUrl,
    });
    
    flyToCart(button, mediaUrl);
    setAdded(true);
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setAdded(false), 1800);

    toast.success("เพิ่มลงตะกร้าแล้ว", {
      description: classEvent.name,
      duration: 3000,
    });
  };

  if (variant === "lux") {
    return (
      <button
        type="button"
        onClick={handleAdd}
        className={`flex items-center justify-center gap-2 rounded-full border py-3.5 font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ${
          added ? "border-[#22a35a] bg-[#effaf1] text-[#16673a]" : "border-brand-brown bg-white text-brand-brown hover:bg-lux-cream"
        } ${className}`}
      >
        {added ? (
          <span key="added" className="flex items-center gap-2 animate-pop-in">
            <Check size={18} strokeWidth={3} /> เพิ่มลงตะกร้าแล้ว
          </span>
        ) : (
          <span key="idle" className="flex items-center gap-2">
            <ShoppingBag size={18} /> เพิ่มลงตะกร้า
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`flex items-center justify-center gap-2 font-bold py-3.5 rounded-lg text-lg transition-all border-[1.5px] border-[var(--brand-brown)] text-[var(--brand-brown)] bg-[var(--brand-yellow)] hover:bg-[var(--brand-yellow-dark)] ${className}`}
      style={{ boxShadow: "3px 3px 0 var(--brand-brown)" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "translate(-1px,-1px)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "4px 4px 0 var(--brand-brown)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "3px 3px 0 var(--brand-brown)";
      }}
    >
      {added ? (
        <span key="added" className="flex items-center gap-2 animate-pop-in">
          <Check size={20} strokeWidth={3} /> เพิ่มแล้ว
        </span>
      ) : (
        <span key="idle" className="flex items-center gap-2">
          <ShoppingBag size={20} /> เพิ่มลงตะกร้า
        </span>
      )}
    </button>
  );
}

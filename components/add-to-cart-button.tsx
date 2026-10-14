"use client";

import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { ShoppingBag } from "lucide-react";
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

  const handleAdd = () => {
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
        className={`flex items-center justify-center gap-2 rounded-full border border-brand-brown bg-white py-3.5 font-semibold text-brand-brown transition-all duration-200 hover:-translate-y-0.5 hover:bg-lux-cream active:translate-y-0 ${className}`}
      >
        <ShoppingBag size={18} />
        เพิ่มลงตะกร้า
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
      <ShoppingBag size={20} />
      เพิ่มลงตะกร้า
    </button>
  );
}

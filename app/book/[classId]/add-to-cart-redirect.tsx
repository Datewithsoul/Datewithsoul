"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCart, type CartItem } from "@/hooks/use-cart";

/**
 * "Book now" entry point: makes sure this round is in the cart, then hands off to
 * the single cart checkout. An item already in the cart is left as-is so a revisit
 * doesn't silently add another seat.
 */
export function AddToCartRedirect({ item }: { item: CartItem }) {
  const { items, addToCart, isLoaded } = useCart();
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (!isLoaded || handled.current) return;
    handled.current = true;
    if (!items.some((i) => i.classEventId === item.classEventId)) addToCart(item);
    router.replace("/cart");
  }, [isLoaded, items, item, addToCart, router]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-lux-muted" role="status">
      <Loader2 className="h-6 w-6 animate-spin text-lux-gold" />
      <p className="text-sm">กำลังพาไปหน้าตะกร้า...</p>
    </div>
  );
}

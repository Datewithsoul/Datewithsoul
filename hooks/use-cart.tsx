"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CartItem = {
  classEventId: string;
  className: string;
  date: Date;
  startTime: string;
  endTime: string;
  price: number;
  seats: number;
  maxSeats: number;
  mediaUrl?: string;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (classEventId: string) => void;
  updateSeats: (classEventId: string, seats: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("dws-cart");
      if (stored) {
        const parsed = JSON.parse(stored).map((item: any) => ({
          ...item,
          date: new Date(item.date),
        }));
        setItems(parsed);
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("dws-cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCart = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.classEventId === newItem.classEventId);
      if (existing) {
        // Update seats if already in cart
        const newSeats = Math.min(existing.seats + newItem.seats, existing.maxSeats);
        return prev.map((i) =>
          i.classEventId === newItem.classEventId ? { ...i, seats: newSeats } : i
        );
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (classEventId: string) => {
    setItems((prev) => prev.filter((i) => i.classEventId !== classEventId));
  };

  const updateSeats = (classEventId: string, seats: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.classEventId === classEventId) {
          return { ...i, seats: Math.min(Math.max(1, seats), i.maxSeats) };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.seats, 0);
  const totalItems = items.reduce((sum, item) => sum + item.seats, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateSeats,
        clearCart,
        totalPrice,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

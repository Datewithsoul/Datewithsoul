"use client";

import { useCart } from "@/hooks/use-cart";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createCartBookings } from "./actions";
import { toast } from "sonner";
import { CalendarDays, Clock, Trash2, Plus, Minus } from "lucide-react";

interface CheckoutClientProps {
  user: any;
  authUserEmail?: string;
}

export default function CheckoutClient({ user, authUserEmail }: CheckoutClientProps) {
  const { items, updateSeats, removeFromCart, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // If not logged in, redirect to login, but keep the redirect URL to cart
  useEffect(() => {
    if (!user && !authUserEmail) {
      toast.info("กรุณาเข้าสู่ระบบก่อนชำระเงิน");
      router.push("/login?redirectTo=/cart");
    }
  }, [user, authUserEmail, router]);

  if (!user && !authUserEmail) {
    return <div className="p-8 text-center text-gray-500">กำลังตรวจสอบสิทธิ์...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl p-12 text-center border border-gray-200">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
          <Trash2 size={32} className="text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">ตะกร้าว่างเปล่า</h2>
        <p className="text-gray-500 mb-6">คุณยังไม่ได้เลือกคลาสใดๆ</p>
        <button 
          onClick={() => router.push("/classes")}
          className="bg-[#222222] hover:bg-black text-white px-6 py-2.5 rounded-full font-semibold transition-colors"
        >
          ดูคลาสทั้งหมด
        </button>
      </div>
    );
  }

  const handleCheckout = (formData: FormData) => {
    startTransition(async () => {
      try {
        const name = formData.get("name") as string;
        
        // Items formatted for action
        const bookingItems = items.map(item => ({
          classEventId: item.classEventId,
          seats: item.seats
        }));

        const result = await createCartBookings(bookingItems, name);
        
        if (result.error) {
          toast.error("เกิดข้อผิดพลาด: " + result.error);
        } else if (result.groupId) {
          clearCart(); // Clear cart after successful checkout!
          toast.success("สร้างรายการจองสำเร็จ!");
          router.push(`/payment/group/${result.groupId}`);
        }
      } catch (err) {
        toast.error("เกิดข้อผิดพลาดที่ไม่รู้จัก กรุณาลองใหม่");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Items Summary */}
      <div>
        <h2 className="text-xl font-semibold mb-6">รายการคลาสในตะกร้า</h2>
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div 
              key={item.classEventId} 
              className="bg-white p-5 rounded-xl border-[1.5px] border-[var(--brand-brown)] flex flex-col gap-3 relative"
              style={{ boxShadow: "2px 2px 0 var(--brand-brown)" }}
            >
              <div className="pr-6">
                <h3 className="font-bold text-[var(--brand-brown)] text-base leading-tight">
                  {item.className}
                </h3>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600 font-medium">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={14} className="text-gray-400" />
                    {item.date.toLocaleDateString("th-TH", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} className="text-gray-400" />
                    {item.startTime} - {item.endTime}
                  </span>
                </div>
              </div>

              <button
                onClick={() => removeFromCart(item.classEventId)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                title="ลบออก"
              >
                <Trash2 size={18} />
              </button>

              <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 border-[1.5px] border-gray-200 rounded-lg p-0.5">
                  <button
                    onClick={() => updateSeats(item.classEventId, item.seats - 1)}
                    disabled={item.seats <= 1 || isPending}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-md disabled:opacity-50"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-[var(--brand-brown)]">{item.seats}</span>
                  <button
                    onClick={() => updateSeats(item.classEventId, item.seats + 1)}
                    disabled={item.seats >= item.maxSeats || isPending}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-md disabled:opacity-50"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <div className="font-black text-lg text-[var(--brand-brown)]">
                  ฿{(item.price * item.seats).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Form */}
      <div>
        <h2 className="text-xl font-semibold mb-6">ข้อมูลผู้จอง</h2>
        
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold">ราคารวม ({items.reduce((s, i) => s + i.seats, 0)} ที่นั่ง)</span>
            <span className="text-2xl font-bold text-[#E51D53]">฿{totalPrice.toLocaleString()}</span>
          </div>
        </div>

        <form action={handleCheckout} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="font-semibold text-sm text-gray-700">ชื่อ-นามสกุล</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              required
              defaultValue={user?.name || ""}
              className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              placeholder="ชื่อ-นามสกุล"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-semibold text-sm text-gray-700">อีเมล</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required
              defaultValue={authUserEmail || ""}
              readOnly
              className="p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
          </div>

          <button 
            type="submit"
            disabled={isPending}
            className="mt-6 bg-[#E51D53] hover:bg-[#D70444] disabled:bg-gray-400 text-white font-bold py-3.5 rounded-lg text-lg transition-colors w-full flex justify-center items-center gap-2"
          >
            {isPending ? "กำลังดำเนินการ..." : "ยืนยันการจองทั้งหมด"}
          </button>
        </form>
      </div>
    </div>
  );
}

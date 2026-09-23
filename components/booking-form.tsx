"use client";

import { useState } from "react";
import { submitBooking } from "@/app/book/[classId]/actions";
import { SubmitButton } from "@/components/submit-button";
import { toast } from "sonner";

interface BookingFormProps {
  classEventId: string;
  pricePerSeat: number;
  totalAvailableSeats: number;
  isPastClass?: boolean;
  defaultName: string;
  defaultEmail: string;
}

export default function BookingForm({ 
  classEventId, 
  pricePerSeat, 
  totalAvailableSeats, 
  isPastClass = false,
  defaultName, 
  defaultEmail 
}: BookingFormProps) {
  const [seats, setSeats] = useState(1);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  
  const totalPrice = seats * pricePerSeat;
  const isFull = totalAvailableSeats <= 0;

  const handleApplyPromo = async () => {
    if (!promoCodeInput) return;
    try {
      const res = await fetch("/api/validate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCodeInput, classEventIds: [classEventId] })
      });
      const data = await res.json();
      
      if (data.error) {
        toast.error(data.error);
        setPromoCode("");
        setDiscountAmount(0);
      } else {
        toast.success("ใช้โค้ดส่วนลดสำเร็จ!");
        setPromoCode(data.promo.code);
        let discount = 0;
        if (data.promo.discountType === "PERCENTAGE") {
          discount = (totalPrice * data.promo.discountValue) / 100;
        } else if (data.promo.discountType === "FIXED_AMOUNT") {
          discount = data.promo.discountValue;
        } else if (data.promo.discountType === "FREE") {
          discount = totalPrice;
        }
        setDiscountAmount(discount > totalPrice ? totalPrice : discount);
      }
    } catch (e) {
      toast.error("ตรวจสอบโค้ดส่วนลดไม่สำเร็จ");
    }
  };

  const finalPrice = totalPrice - discountAmount;

  return (
    <>
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-gray-600">
            <span>ราคารวม ({seats || 1} ที่นั่ง)</span>
            <span>฿{totalPrice.toLocaleString()}</span>
          </div>
          
          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-green-600">
              <span>ส่วนลด (โค้ด: {promoCode})</span>
              <span>-฿{discountAmount.toLocaleString()}</span>
            </div>
          )}
          
          <div className="pt-2 border-t border-gray-200 mt-2 flex justify-between items-center text-lg">
            <span className="font-bold">ยอดสุทธิ</span>
            <span className="text-2xl font-bold text-[#E51D53]">฿{finalPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {isPastClass ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 font-semibold flex items-center gap-2">
          คลาสนี้ผ่านวันเรียนแล้ว ไม่สามารถจองได้
        </div>
      ) : isFull && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 font-semibold flex items-center gap-2">
          ขออภัย คลาสเรียนนี้ที่นั่งเต็มแล้ว
        </div>
      )}

      <div className="mb-6">
        <label htmlFor="promo" className="font-semibold text-sm text-gray-700 mb-2 block">โค้ดส่วนลด (ถ้ามี)</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            id="promo" 
            value={promoCodeInput}
            onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
            disabled={!!promoCode || isFull || isPastClass}
            className="p-3 flex-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all uppercase disabled:bg-gray-100 disabled:text-gray-400"
            placeholder="กรอกโค้ดส่วนลด"
          />
          {promoCode ? (
            <button 
              type="button"
              onClick={() => { setPromoCode(""); setPromoCodeInput(""); setDiscountAmount(0); }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 rounded-lg font-semibold transition-colors"
            >
              ยกเลิก
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleApplyPromo}
              disabled={!promoCodeInput || isFull || isPastClass}
              className="bg-[#222222] hover:bg-black disabled:bg-gray-300 text-white px-6 rounded-lg font-semibold transition-colors"
            >
              ใช้โค้ด
            </button>
          )}
        </div>
      </div>

      <form action={submitBooking} className="flex flex-col gap-5">
        <input type="hidden" name="classEventId" value={classEventId} />
        {promoCode && <input type="hidden" name="promoCode" value={promoCode} />}
        
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="font-semibold text-sm text-gray-700">ชื่อ-นามสกุล</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            required
            defaultValue={defaultName}
            disabled={isFull || isPastClass}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all disabled:bg-gray-100 disabled:text-gray-400"
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
            defaultValue={defaultEmail}
            disabled={isFull || isPastClass}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all disabled:bg-gray-100 disabled:text-gray-400"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="seats" className="font-semibold text-sm text-gray-700 flex justify-between">
            <span>จำนวนที่นั่งที่ต้องการ</span>
            <span className="text-red-500 font-normal">เหลือ {Math.max(0, totalAvailableSeats)} ที่นั่ง</span>
          </label>
          <input 
            type="number" 
            id="seats" 
            name="seats" 
            min="1"
            max={Math.max(1, totalAvailableSeats)}
            value={seats}
            disabled={isFull || isPastClass}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              setSeats(isNaN(val) ? (e.target.value as any) : val);
              // reset discount when seats change
              if (promoCode) {
                 setPromoCode("");
                 setPromoCodeInput("");
                 setDiscountAmount(0);
                 toast.info("กรุณากดใช้โค้ดส่วนลดอีกครั้งเนื่องจากมีการเปลี่ยนจำนวนที่นั่ง");
              }
            }}
            onBlur={() => {
              if (!seats || seats < 1) setSeats(1);
              else if (seats > totalAvailableSeats) setSeats(totalAvailableSeats);
            }}
            required
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all disabled:bg-gray-100 disabled:text-gray-400"
          />
          {seats > totalAvailableSeats && !isFull && (
            <span className="text-sm text-red-500">ที่นั่งไม่เพียงพอ (เลือกได้สูงสุด {totalAvailableSeats} ที่)</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="note" className="font-semibold text-sm text-gray-700">หมายเหตุเพิ่มเติม (ถ้ามี)</label>
          <textarea 
            id="note" 
            name="note" 
             disabled={isFull || isPastClass}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all disabled:bg-gray-100 disabled:text-gray-400 min-h-[100px] resize-y"
            placeholder="เช่น แพ้อาหาร, ความต้องการพิเศษ..."
          />
        </div>

        <SubmitButton 
          disabled={isFull || isPastClass || seats > totalAvailableSeats || !seats || seats < 1}
          className="mt-6 pop-btn-red text-white font-bold py-3.5 rounded-xl text-lg transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPastClass ? "ไม่สามารถจองได้แล้ว" : isFull ? "ที่นั่งเต็มแล้ว" : finalPrice <= 0 ? "ยืนยันการจอง (เรียนฟรี)" : "ยืนยันและไปหน้าชำระเงิน"}
        </SubmitButton>
      </form>
    </>
  );
}

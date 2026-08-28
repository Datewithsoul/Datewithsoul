"use client";

import { useState } from "react";
import { submitBooking } from "@/app/book/[classId]/actions";
import { SubmitButton } from "@/components/submit-button";

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
  
  const totalPrice = seats * pricePerSeat;

  const isFull = totalAvailableSeats <= 0;

  return (
    <>
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center text-lg">
          <span className="font-semibold">ราคารวม ({seats || 1} ที่นั่ง)</span>
          <span className="text-2xl font-bold text-[#F44336]">฿{totalPrice.toLocaleString()}</span>
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

      <form action={submitBooking} className="flex flex-col gap-5">
        <input type="hidden" name="classEventId" value={classEventId} />
        
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
            readOnly
            className="p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
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
          {isPastClass ? "ไม่สามารถจองได้แล้ว" : isFull ? "ที่นั่งเต็มแล้ว" : "ยืนยันการจอง"}
        </SubmitButton>
      </form>
    </>
  );
}

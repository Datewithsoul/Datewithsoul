"use client";

import { useState } from "react";
import { submitBooking } from "@/app/book/[classId]/actions";

interface BookingFormProps {
  classEventId: string;
  pricePerSeat: number;
  totalAvailableSeats: number;
  defaultName: string;
  defaultEmail: string;
}

export default function BookingForm({ 
  classEventId, 
  pricePerSeat, 
  totalAvailableSeats, 
  defaultName, 
  defaultEmail 
}: BookingFormProps) {
  const [seats, setSeats] = useState(1);
  
  const totalPrice = seats * pricePerSeat;

  return (
    <>
      {/* We can teleport the total price display if we want, but simpler is to show it inside the form area or just rely on the parent static layout. Actually, if we put the form here, we can show a summary above the button. */}
      
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center text-lg">
          <span className="font-semibold">ราคารวม ({seats} ที่นั่ง)</span>
          <span className="text-2xl font-bold text-[#F44336]">฿{totalPrice.toLocaleString()}</span>
        </div>
      </div>

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
            defaultValue={defaultEmail}
            readOnly
            className="p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="seats" className="font-semibold text-sm text-gray-700">จำนวนที่นั่งที่ต้องการ</label>
          <input 
            type="number" 
            id="seats" 
            name="seats" 
            min="1"
            max={totalAvailableSeats}
            value={seats}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val >= 1 && val <= totalAvailableSeats) {
                setSeats(val);
              } else if (e.target.value === "") {
                // allow typing
                setSeats(e.target.value as unknown as number);
              }
            }}
            onBlur={() => {
              if (!seats || seats < 1) setSeats(1);
              if (seats > totalAvailableSeats) setSeats(totalAvailableSeats);
            }}
            required
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
          />
        </div>

        <button 
          type="submit"
          className="mt-6 bg-[#E51D53] hover:bg-[#D70444] text-white font-bold py-3.5 rounded-lg text-lg transition-colors w-full"
        >
          ยืนยันการจอง
        </button>
      </form>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";
import { CalendarDays, Clock, Trash2, Plus, Minus, ChevronDown } from "lucide-react";
import { useCart, CartItem } from "@/hooks/use-cart";
import { getAlternativeSchedules } from "@/app/cart/actions";

export default function CartItemRow({ item }: { item: CartItem }) {
  const { updateSeats, removeFromCart, changeSchedule } = useCart();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && schedules.length === 0) {
      setIsLoading(true);
      getAlternativeSchedules(item.className).then(res => {
        setSchedules(res);
        setIsLoading(false);
      });
    }
  }, [isOpen, item.className, schedules.length]);

  const handleScheduleChange = (newSchedule: any) => {
    setIsOpen(false);
    if (newSchedule.id === item.classEventId) return;

    changeSchedule(item.classEventId, {
      ...item,
      classEventId: newSchedule.id,
      date: new Date(newSchedule.date),
      startTime: newSchedule.startTime,
      endTime: newSchedule.endTime,
      maxSeats: newSchedule.totalSeats
    });
  };

  return (
    <div 
      className="bg-white p-5 rounded-xl border-[1.5px] border-[var(--brand-brown)] flex flex-col gap-3 relative"
      style={{ boxShadow: "2px 2px 0 var(--brand-brown)" }}
    >
      <div className="pr-6 relative">
        <h3 className="font-bold text-[var(--brand-brown)] text-base leading-tight">
          {item.className}
        </h3>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600 font-medium hover:bg-gray-50 p-1.5 -ml-1.5 rounded-lg border border-transparent hover:border-gray-200 transition-colors w-fit"
        >
          <span className="flex items-center gap-1.5">
            <CalendarDays size={14} className="text-gray-400" />
            {new Date(item.date).toLocaleDateString("th-TH", { month: "short", day: "numeric", year: "numeric" })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock size={14} className="text-gray-400" />
            {item.startTime} - {item.endTime}
          </span>
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="p-3 text-sm text-center text-gray-500">กำลังโหลด...</div>
            ) : schedules.length > 0 ? (
              <div className="py-1">
                {schedules.map(s => {
                  const sDate = new Date(s.date);
                  const isSelected = s.id === item.classEventId;
                  const isFull = s.totalSeats <= 0;
                  return (
                    <button
                      key={s.id}
                      onClick={() => !isFull && handleScheduleChange(s)}
                      disabled={isFull}
                      className={`w-full text-left px-4 py-2.5 text-sm flex justify-between items-center ${isSelected ? 'bg-orange-50 font-semibold' : 'hover:bg-gray-50'} ${isFull ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span>
                        {sDate.toLocaleDateString("th-TH", { month: "short", day: "numeric", year: "numeric" })} • {s.startTime}-{s.endTime}
                      </span>
                      {isFull && <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded">เต็ม</span>}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 text-sm text-center text-gray-500">ไม่มีรอบอื่น</div>
            )}
          </div>
        )}
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
            disabled={item.seats <= 1}
            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-md disabled:opacity-50"
          >
            <Minus size={14} />
          </button>
          <span className="w-6 text-center text-sm font-bold text-[var(--brand-brown)]">{item.seats}</span>
          <button
            onClick={() => updateSeats(item.classEventId, item.seats + 1)}
            disabled={item.seats >= item.maxSeats}
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
  );
}

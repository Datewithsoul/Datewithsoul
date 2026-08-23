"use client";

import { useState, useEffect } from "react";
import { getClassesForMonth } from "@/app/actions/calendar";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";

interface ClassEvent {
  id: string;
  name: string;
  date: Date;
  startTime: string;
  endTime: string;
  price: number;
  totalSeats: number;
  media: { url: string }[];
}

export default function ClassCalendar({ initialClasses, initialYear, initialMonth }: { initialClasses: any[], initialYear: number, initialMonth: number }) {
  const [currentDate, setCurrentDate] = useState(new Date(initialYear, initialMonth, 1));
  const [classes, setClasses] = useState<ClassEvent[]>(initialClasses);
  const [isLoading, setIsLoading] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  useEffect(() => {
    // Only fetch if it's not the initial load (we can check if year/month changed from initial)
    if (year !== initialYear || month !== initialMonth) {
      const fetchClasses = async () => {
        setIsLoading(true);
        const res = await getClassesForMonth(year, month);
        if (res.classes) {
          setClasses(res.classes as any);
        }
        setIsLoading(false);
      };
      fetchClasses();
    } else {
      setClasses(initialClasses);
    }
  }, [year, month, initialYear, initialMonth, initialClasses]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null); // Empty slots before the 1st
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const dayNames = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

  return (
    <div className="w-full max-w-[1340px] mx-auto px-2 md:px-6 py-6 md:py-12">
      <div className="bg-white border-2 md:border-4 border-black rounded-xl md:rounded-2xl p-3 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        
        {/* Pop Art Decorative Dots (Halftone effect) */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '16px 16px' }}></div>

        {/* Header */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between mb-4 md:mb-8 gap-4">
          <h2 className="text-2xl md:text-5xl font-black text-[#1c1d1f] tracking-tight uppercase text-center">
            ตารางคลาสเรียน
          </h2>
          
          <div className="flex items-center gap-2 md:gap-4 bg-[#FFC107] border-2 md:border-4 border-black rounded-full p-1.5 md:p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <button 
              onClick={handlePrevMonth}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white border-2 border-black rounded-full hover:bg-gray-100 transition-transform active:scale-95 font-black"
            >
              <ChevronLeft size={20} className="md:w-6 md:h-6" />
            </button>
            <span className="text-sm md:text-xl font-black min-w-[100px] md:min-w-[140px] text-center">
              {monthNames[month]} {year + 543}
            </span>
            <button 
              onClick={handleNextMonth}
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white border-2 border-black rounded-full hover:bg-gray-100 transition-transform active:scale-95 font-black"
            >
              <ChevronRight size={20} className="md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="w-full">
          <div>
            {/* Days Header */}
            <div className="relative z-10 grid grid-cols-7 gap-1 md:gap-4 mb-1 md:mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center font-black text-[10px] md:text-lg py-1 md:py-2 border-b-2 md:border-b-4 border-black truncate">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Cells */}
            <div className={`relative z-10 grid grid-cols-7 gap-1 md:gap-4 transition-opacity duration-300 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="min-h-[70px] md:min-h-[120px] bg-gray-50 border-2 md:border-4 border-gray-200/50 rounded-lg md:rounded-xl"></div>;
                }

            const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
            
            // Find classes for this day, sorted by startTime
            const dayClasses = classes
              .filter(c => {
                const cDate = new Date(c.date);
                return cDate.getDate() === day && cDate.getMonth() === month && cDate.getFullYear() === year;
              })
              .sort((a, b) => a.startTime.localeCompare(b.startTime));


            return (
              <div 
                key={`day-${day}`} 
                className={`min-h-[70px] md:min-h-[140px] border-2 md:border-4 border-black rounded-lg md:rounded-xl p-1 md:p-2 flex flex-col transition-transform hover:-translate-y-1 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${isToday ? 'bg-[#FFC107]' : 'bg-white'}`}
              >
                <div className="flex justify-between items-start mb-1 md:mb-2">
                  <span className={`font-black text-xs md:text-xl w-5 h-5 md:w-8 md:h-8 flex items-center justify-center rounded-full ${isToday ? 'bg-black text-white' : ''}`}>
                    {day}
                  </span>
                </div>
                
                <div className="flex flex-col gap-1 md:gap-2 flex-grow overflow-y-auto no-scrollbar">
                  {dayClasses.slice(0, 2).map(c => (
                    <Link href={`/classes/${c.id}`} key={c.id}>
                      <div className="bg-[#1c1d1f] text-white p-1 md:p-2 border md:border-2 border-black rounded md:rounded-lg hover:bg-[#F44336] transition-colors cursor-pointer group">
                        <div className="flex items-center gap-1 text-[8px] md:text-xs text-gray-300 group-hover:text-white md:mb-1 font-bold leading-none md:leading-normal">
                          <Clock size={8} className="hidden md:block" /> {c.startTime}
                        </div>
                        <h4 className="font-bold text-[9px] md:text-sm leading-tight line-clamp-1 md:line-clamp-2 mt-0.5 md:mt-0">
                          {c.name}
                        </h4>
                        <div className="mt-0.5 md:mt-1 flex flex-col xl:flex-row xl:items-center justify-between gap-0.5">
                          <span className="text-[8px] md:text-xs font-black text-[#FFC107] group-hover:text-white hidden md:inline-block">฿{c.price.toLocaleString()}</span>
                          {c.totalSeats <= 3 && c.totalSeats > 0 ? (
                            <span className="text-[8px] bg-[#FFC107] text-black px-1 rounded font-bold self-start xl:self-auto">เหลือ {c.totalSeats}</span>
                          ) : c.totalSeats === 0 ? (
                            <span className="text-[8px] bg-red-900 text-white px-1 rounded font-bold self-start xl:self-auto">เต็ม</span>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  ))}
                  {dayClasses.length > 2 && (
                    <Link href={`/classes?date=${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`} className="text-[10px] md:text-xs text-center text-[#6a5d50] hover:text-[#1c1d1f] hover:underline py-1 font-semibold mt-auto">
                      ดูรายการเพิ่มของวันนี้
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

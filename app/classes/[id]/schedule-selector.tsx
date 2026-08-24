"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

type Schedule = {
  id: string;
  date: Date;
  endDate: Date | null;
  startTime: string;
  endTime: string;
  totalSeats: number;
  maxSeats: number;
};

export default function ScheduleSelector({ 
  currentId, 
  schedules,
  baseUrl = "/classes"
}: { 
  currentId: string, 
  schedules: Schedule[],
  baseUrl?: string
}) {
  const router = useRouter();
  const currentSchedule = schedules.find(s => s.id === currentId) || schedules[0];
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (id: string) => {
    setIsOpen(false);
    if (id !== currentId) {
      router.push(`${baseUrl}/${id}`);
    }
  };

  const formatDate = (d: Date, endD: Date | null) => {
    const startStr = new Date(d).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' });
    if (endD && new Date(endD).getTime() !== new Date(d).getTime()) {
      return `${startStr} - ${new Date(endD).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return startStr;
  };



  return (
    <div className="relative mb-4">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="border border-gray-400 rounded-xl overflow-hidden cursor-pointer hover:border-gray-500 transition-colors bg-white relative z-10"
      >
        <div className="flex divide-x divide-gray-400 border-b border-gray-400">
          <div className="p-3 w-1/2">
            <div className="text-[10px] font-bold uppercase mb-1 text-gray-500">วันที่เรียน</div>
            <div className="text-sm font-semibold">{formatDate(currentSchedule.date, currentSchedule.endDate)}</div>
          </div>
          <div className="p-3 w-1/2 flex justify-between items-center pr-4">
            <div>
              <div className="text-[10px] font-bold uppercase mb-1 text-gray-500">เวลา</div>
              <div className="text-sm font-semibold">{currentSchedule.startTime} - {currentSchedule.endTime}</div>
            </div>
            <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
        <div className="p-3 bg-gray-50">
          <div className="text-[10px] font-bold uppercase mb-1 text-gray-500">สถานะที่นั่ง</div>
          <div className="text-sm font-semibold">จองแล้ว {currentSchedule.maxSeats - currentSchedule.totalSeats}/{currentSchedule.maxSeats} คน {currentSchedule.totalSeats === 0 && <span className="text-red-500 ml-2">(เต็มแล้ว)</span>}</div>
        </div>
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-20" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-30 max-h-60 overflow-y-auto overflow-hidden divide-y divide-gray-100">
            {schedules.map((schedule) => (
              <div 
                key={schedule.id}
                onClick={() => handleSelect(schedule.id)}
                className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center ${schedule.id === currentId ? 'bg-red-50 hover:bg-red-50' : ''}`}
              >
                <div>
                  <div className="text-sm font-medium">
                    {formatDate(schedule.date, schedule.endDate)}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {schedule.startTime} - {schedule.endTime}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${schedule.totalSeats > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {schedule.totalSeats > 0 ? `ว่าง ${schedule.totalSeats} ที่` : 'เต็มแล้ว'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Clock } from "lucide-react";

type Timeslot = {
  startTime: string;
  endTime: string;
  totalSeats: string;
};

type ScheduleDay = {
  date: string;
  timeslots: Timeslot[];
};

export default function ScheduleRepeater({
  initialData
}: {
  initialData?: ScheduleDay[]
}) {
  const [scheduleDays, setScheduleDays] = useState<ScheduleDay[]>(initialData || [
    { 
      date: "", 
      timeslots: [{ startTime: "10:00", endTime: "13:00", totalSeats: "10" }] 
    }
  ]);

  const addDay = () => {
    setScheduleDays([
      ...scheduleDays, 
      { date: "", timeslots: [{ startTime: "10:00", endTime: "13:00", totalSeats: "10" }] }
    ]);
  };

  const removeDay = (dayIndex: number) => {
    if (scheduleDays.length > 1) {
      setScheduleDays(scheduleDays.filter((_, i) => i !== dayIndex));
    }
  };

  const updateDayDate = (dayIndex: number, date: string) => {
    const newDays = [...scheduleDays];
    newDays[dayIndex].date = date;
    setScheduleDays(newDays);
  };

  const addTimeslot = (dayIndex: number) => {
    const newDays = [...scheduleDays];
    newDays[dayIndex].timeslots.push({ startTime: "10:00", endTime: "13:00", totalSeats: "10" });
    setScheduleDays(newDays);
  };

  const removeTimeslot = (dayIndex: number, slotIndex: number) => {
    const newDays = [...scheduleDays];
    if (newDays[dayIndex].timeslots.length > 1) {
      newDays[dayIndex].timeslots = newDays[dayIndex].timeslots.filter((_, i) => i !== slotIndex);
      setScheduleDays(newDays);
    }
  };

  const updateTimeslot = (dayIndex: number, slotIndex: number, field: keyof Timeslot, value: string) => {
    const newDays = [...scheduleDays];
    newDays[dayIndex].timeslots[slotIndex][field] = value;
    setScheduleDays(newDays);
  };

  // Flatten for the backend action
  const flatSchedules = scheduleDays.flatMap(day => 
    day.timeslots.map(slot => ({
      date: day.date,
      endDate: "",
      startTime: slot.startTime,
      endTime: slot.endTime,
      totalSeats: slot.totalSeats
    }))
  );

  return (
    <div className="space-y-4">
      <input type="hidden" name="schedulesJson" value={JSON.stringify(flatSchedules)} />
      
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium leading-none">รอบเวลาและจำนวนที่นั่ง (สามารถเพิ่มได้หลายวัน และหลายรอบใน 1 วัน)</label>
      </div>

      {scheduleDays.map((day, dayIndex) => (
        <div key={dayIndex} className="p-4 border border-gray-200 rounded-lg space-y-4 bg-gray-50 relative">
          {scheduleDays.length > 1 && (
            <button 
              type="button" 
              onClick={() => removeDay(dayIndex)}
              className="absolute top-3 right-3 text-red-500 hover:text-red-700"
              title="ลบวันที่นี้"
            >
              <Trash2 size={16} />
            </button>
          )}
          
          <div className="w-full sm:w-1/2">
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">วันที่จัดกิจกรรม</label>
            <Input 
              type="date" 
              required
              value={day.date}
              onChange={(e) => updateDayDate(dayIndex, e.target.value)}
              className="bg-white"
            />
          </div>

          <div className="space-y-3 mt-4">
            <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 border-b border-gray-200 pb-1.5">
              <Clock size={14} /> รอบเวลาในวันนี้
            </label>
            
            {day.timeslots.map((slot, slotIndex) => (
              <div key={slotIndex} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end bg-white p-3 rounded border border-gray-100 shadow-sm">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-gray-500">เวลาเริ่ม</label>
                  <Input 
                    type="time" 
                    required
                    value={slot.startTime}
                    onChange={(e) => updateTimeslot(dayIndex, slotIndex, 'startTime', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-gray-500">เวลาสิ้นสุด</label>
                  <Input 
                    type="time" 
                    required
                    value={slot.endTime}
                    onChange={(e) => updateTimeslot(dayIndex, slotIndex, 'endTime', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-gray-500">ที่นั่ง (คน)</label>
                  <Input 
                    type="number" 
                    min="1"
                    required
                    placeholder="10"
                    value={slot.totalSeats}
                    onChange={(e) => updateTimeslot(dayIndex, slotIndex, 'totalSeats', e.target.value)}
                  />
                </div>
                
                <div className="pb-1.5">
                  {day.timeslots.length > 1 ? (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeTimeslot(dayIndex, slotIndex)}
                      className="text-gray-400 hover:text-red-500 h-8 w-8"
                    >
                      <Trash2 size={14} />
                    </Button>
                  ) : (
                    <div className="w-8 h-8"></div>
                  )}
                </div>
              </div>
            ))}
            
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => addTimeslot(dayIndex)} 
              className="text-xs border-dashed mt-2"
            >
              <Plus size={14} className="mr-1" /> เพิ่มรอบเวลาในวันนี้
            </Button>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addDay} className="w-full border-dashed py-6">
        <Plus size={16} className="mr-2" /> เพิ่มวันที่จัดกิจกรรม
      </Button>
    </div>
  );
}

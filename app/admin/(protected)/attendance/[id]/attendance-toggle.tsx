"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { toggleAttendance } from "./actions";
import { toast } from "sonner";

export function AttendanceToggle({ bookingId, initialStatus }: { bookingId: string, initialStatus: boolean }) {
  const [attended, setAttended] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const newValue = !attended;
    setAttended(newValue); // Optimistic update
    
    startTransition(async () => {
      try {
        await toggleAttendance(bookingId, newValue);
        toast.success(newValue ? "เช็คชื่อเข้าเรียนแล้ว" : "ยกเลิกการเช็คชื่อแล้ว");
      } catch (error) {
        setAttended(!newValue); // Revert on error
        toast.error("เกิดข้อผิดพลาดในการบันทึก");
      }
    });
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className={`rounded-full p-1 hover:bg-gray-100 transition-colors ${isPending ? 'opacity-50' : ''}`}
      title={attended ? "ยกเลิกการเช็คชื่อ" : "เช็คชื่อเข้าเรียน"}
    >
      {attended ? (
        <CheckCircle2 className="h-8 w-8 text-green-500" />
      ) : (
        <Circle className="h-8 w-8 text-gray-300" />
      )}
    </button>
  );
}

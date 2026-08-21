"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { cancelBooking } from "@/app/payment/[bookingId]/actions";
import { useRouter } from "next/navigation";

export default function PaymentTimer({ 
  createdAt, 
  bookingId,
  groupId,
  onExpire
}: { 
  createdAt: Date | string; 
  bookingId?: string;
  groupId?: string;
  onExpire?: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState<number>(10 * 60);
  const [isExpired, setIsExpired] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const expiryTime = new Date(createdAt).getTime() + 10 * 60 * 1000;
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const diff = expiryTime - now;
      return Math.max(0, Math.floor(diff / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        if (!isExpired) {
          setIsExpired(true);
          handleExpire();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [createdAt, isExpired]);

  const handleExpire = async () => {
    // Automatically cancel booking
    if (groupId) {
      const { cancelGroupBooking } = await import("@/app/payment/group/[groupId]/actions");
      await cancelGroupBooking(groupId);
    } else if (bookingId) {
      await cancelBooking(bookingId);
    }
    if (onExpire) {
      onExpire();
    }
    router.refresh(); // Refresh page to show expired state
  };

  if (isExpired || timeLeft <= 0) {
    return (
      <div className="flex items-center gap-2 text-[#F44336] font-bold text-lg bg-[#F44336]/10 p-4 rounded-xl border border-[#F44336]/20">
        <Clock size={24} />
        <span>หมดเวลาชำระเงิน (รายการจองถูกยกเลิกแล้ว)</span>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className={`flex flex-col items-center p-4 rounded-xl border-2 ${timeLeft < 60 ? 'bg-red-50 border-red-500 text-red-600 animate-pulse' : 'bg-[#FFEB3B]/20 border-[#FFEB3B] text-[#5D4037]'}`}>
      <span className="text-sm font-bold mb-1">กรุณาชำระเงินภายใน</span>
      <div className="flex items-center gap-2 text-3xl font-black tabular-nums">
        <Clock size={28} />
        <span>
          {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaymentCountdown({ createdAt }: { createdAt: Date | string }) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    const calculateTimeLeft = () => {
      const created = new Date(createdAt).getTime();
      const now = new Date().getTime();
      const tenMinutes = 10 * 60 * 1000;
      const difference = tenMinutes - (now - created);
      return Math.max(0, Math.floor(difference / 1000));
    };

    const initialTime = calculateTimeLeft();
    setTimeLeft(initialTime);

    if (initialTime <= 0) return;

    const timer = setInterval(() => {
      const newTime = calculateTimeLeft();
      setTimeLeft(newTime);
      
      if (newTime <= 0) {
        clearInterval(timer);
        router.refresh();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [createdAt, router]);

  if (timeLeft <= 0) {
    return <span className="text-red-500 text-sm font-semibold flex items-center gap-1"><Clock size={14} /> หมดเวลาชำระเงิน</span>;
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <span className="text-orange-600 text-sm font-semibold flex items-center gap-1">
      <Clock size={14} />
      เหลือเวลา {minutes}:{seconds.toString().padStart(2, '0')}
    </span>
  );
}

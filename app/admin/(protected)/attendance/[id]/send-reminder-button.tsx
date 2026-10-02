"use client";

import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useState } from "react";
import { sendClassReminder } from "./actions";
import { toast } from "sonner";

export function SendReminderButton({ classEventId, totalSeats }: { classEventId: string, totalSeats: number }) {
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (totalSeats === 0) {
      toast.error("ไม่สามารถส่งได้", {
        description: "ไม่มีลูกค้าที่ชำระเงินแล้วในรอบนี้"
      });
      return;
    }

    if (!confirm(`ยืนยันการส่งข้อความแจ้งเตือนใกล้ถึงวันเรียนไปยังลูกค้าทั้งหมด ${totalSeats} ท่านผ่าน LINE?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await sendClassReminder(classEventId);
      if (res.error) {
        toast.error("เกิดข้อผิดพลาด", {
          description: res.error
        });
      } else {
        toast.success("ส่งข้อความสำเร็จ", {
          description: `ส่งข้อความแจ้งเตือนผ่าน LINE ไปยังลูกค้า ${res.sentCount} ท่านเรียบร้อยแล้ว`
        });
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด", {
        description: "ไม่สามารถส่งข้อความได้ กรุณาลองใหม่อีกครั้ง"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleSend} 
      disabled={loading}
      className="gap-2 bg-[#8a6d1f] hover:bg-[#6f5719] text-white"
    >
      <Bell className="h-4 w-4" />
      {loading ? "กำลังส่งข้อความ..." : "ส่งข้อความแจ้งเตือนลูกค้า"}
    </Button>
  );
}

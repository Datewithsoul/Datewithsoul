"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { retryNotification } from "@/app/admin/(protected)/notifications/actions";

export function RetryNotificationButton({ notificationId }: { notificationId: string }) {
  const [isPending, setIsPending] = useState(false);

  async function handleRetry() {
    setIsPending(true);
    try {
      const formData = new FormData();
      formData.append("id", notificationId);
      
      const result = await retryNotification(formData);
      
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("ส่งข้อความแจ้งเตือนอีกครั้งเรียบร้อยแล้ว");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการส่งซ้ำ");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleRetry} 
      disabled={isPending}
      className="h-8 gap-1.5"
    >
      <RefreshCw className={`h-3 w-3 ${isPending ? 'animate-spin' : ''}`} />
      <span className="hidden sm:inline">ส่งซ้ำ</span>
    </Button>
  );
}

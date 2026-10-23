"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setClassGroupBookingPaused } from "@/app/admin/(protected)/classes/actions";

type PauseClassBookingButtonProps = {
  className: string;
  openRoundCount: number;
  pausedRoundCount: number;
  triggerClassName?: string;
};

/** Toggles booking for a class: pauses its open rounds, or reopens its paused ones. */
export function PauseClassBookingButton({ className, openRoundCount, pausedRoundCount, triggerClassName }: PauseClassBookingButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Pausing wins when some rounds are still open, so one click always stops new bookings
  const willPause = openRoundCount > 0;
  if (!willPause && pausedRoundCount === 0) return null;

  const toggle = () =>
    startTransition(async () => {
      const res = await setClassGroupBookingPaused(className, willPause);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(willPause ? `ปิดรับจอง "${className}" ชั่วคราวแล้ว` : `เปิดรับจอง "${className}" อีกครั้งแล้ว`);
      router.refresh();
    });

  const Icon = willPause ? Pause : Play;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={isPending}
      className={triggerClassName}
      title={willPause ? "ลูกค้ายังเห็นคอร์ส แต่จองไม่ได้จนกว่าจะเปิดอีกครั้ง" : "เปิดให้ลูกค้าจองได้อีกครั้ง"}
    >
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
      {willPause ? "ปิดจองชั่วคราว" : "เปิดรับจอง"}
    </Button>
  );
}

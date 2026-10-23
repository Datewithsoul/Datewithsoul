"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setClassGroupHidden } from "@/app/admin/(protected)/classes/actions";

type HideClassButtonProps = {
  className: string;
  visibleRoundCount: number;
  hiddenRoundCount: number;
  triggerClassName?: string;
};

/** Hides a class from customers, or shows it again when every round is hidden. */
export function HideClassButton({ className, visibleRoundCount, hiddenRoundCount, triggerClassName }: HideClassButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Hiding wins when any round is still visible, so one click always takes the class off the site
  const willHide = visibleRoundCount > 0;
  if (!willHide && hiddenRoundCount === 0) return null;

  const toggle = () =>
    startTransition(async () => {
      const res = await setClassGroupHidden(className, willHide);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success(willHide ? `ซ่อน "${className}" จากหน้าเว็บแล้ว` : `แสดง "${className}" บนหน้าเว็บแล้ว`);
      router.refresh();
    });

  const Icon = willHide ? EyeOff : Eye;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={isPending}
      className={triggerClassName}
      title={willHide ? "ลูกค้าจะไม่เห็นคอร์สนี้บนหน้าเว็บ ผู้ที่จองไว้แล้วยังอยู่ครบ" : "แสดงบนหน้าเว็บ รอบที่ยังไม่ถึงจะเปิดรับจองทันที"}
    >
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
      {willHide ? "ซ่อน" : "แสดง"}
    </Button>
  );
}

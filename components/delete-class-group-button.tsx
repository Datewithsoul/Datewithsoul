"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { deleteClassGroup } from "@/app/admin/(protected)/classes/actions";

type DeleteClassGroupButtonProps = {
  className: string;
  roundCount: number;
  // Bookings of any status; they are kept as history when the class is deleted
  bookingCount: number;
  triggerClassName?: string;
};

export function DeleteClassGroupButton({ className, roundCount, bookingCount, triggerClassName }: DeleteClassGroupButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const hasBookings = bookingCount > 0;

  const handleDelete = async () => {
    setDeleting(true);
    const res = await deleteClassGroup(className);
    setDeleting(false);

    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success(`ลบคอร์ส "${className}" แล้ว`);
    setOpen(false);
    router.refresh();
  };

  return (
    <AlertDialog open={open} onOpenChange={(next) => !deleting && setOpen(next)}>
      <AlertDialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn("text-(--admin-danger) hover:text-(--admin-danger)", triggerClassName)}
            aria-label={`ลบคอร์ส ${className}`}
          />
        }
      >
        <Trash2 className="h-3.5 w-3.5" /> ลบ
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ลบคอร์สนี้?</AlertDialogTitle>
          <AlertDialogDescription
            render={
              <div className="space-y-2 text-sm">
                <p className="font-medium text-foreground">{className}</p>
                <p>คอร์สทั้ง {roundCount} รอบจะหายไปจากหน้านี้และหน้าเว็บ ลูกค้าจะจองไม่ได้อีก</p>
                {hasBookings ? (
                  <p>
                    ประวัติการจอง {bookingCount} รายการ รวมการชำระเงินและสลิป ยังเก็บไว้ครบ ดูได้ที่หน้ารายการจอง
                    ระบบจะไม่ยกเลิกการจองให้อัตโนมัติ
                  </p>
                ) : (
                  <p>คอร์สนี้ยังไม่มีการจอง จะถูกลบถาวร</p>
                )}
              </div>
            }
          />
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={deleting}
            // The dialog portals outside [data-admin], where --admin-danger isn't defined, so use its value directly
            className="bg-[#8f3b2c] text-white hover:bg-[#7a3125]"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            ลบคอร์ส
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

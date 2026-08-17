"use client";

import { useState } from "react";
import { cancelBooking } from "@/app/payment/[bookingId]/actions";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
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

export default function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const [isCanceling, setIsCanceling] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    setIsCanceling(true);
    try {
      const result = await cancelBooking(bookingId);
      if (result.success) {
        setIsOpen(false);
        router.refresh();
      } else {
        alert(result.error || "เกิดข้อผิดพลาดในการยกเลิก");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการยกเลิก");
    } finally {
      setIsCanceling(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger 
        render={
          <button 
            disabled={isCanceling}
            className="flex items-center justify-center gap-1 bg-white border border-gray-200 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 hover:border-red-200 disabled:opacity-50 transition-colors"
          />
        }
      >
        {isCanceling ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <X size={16} />
        )}
        ยกเลิกการจอง
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ยืนยันการยกเลิกการจอง?</AlertDialogTitle>
          <AlertDialogDescription>
            การดำเนินการนี้ไม่สามารถยกเลิกได้ เมื่อคุณยกเลิกการจอง ระบบจะคืนที่นั่งกลับสู่คลาสเรียน
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isCanceling}>ปิด</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleCancel();
            }}
            disabled={isCanceling}
            className="bg-red-600 text-white hover:bg-red-700 font-semibold"
          >
            {isCanceling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            ยืนยันการยกเลิก
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

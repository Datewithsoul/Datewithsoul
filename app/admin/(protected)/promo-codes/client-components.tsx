"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { togglePromoCodeStatus, deletePromoCode } from "./actions";
import { Loader2, Power, PowerOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
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

export function PromoCodeStatusToggle({ id, isActive }: { id: string; isActive: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    const res = await togglePromoCodeStatus(id, !isActive);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`เปลี่ยนสถานะโค้ดเป็น ${!isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"} เรียบร้อยแล้ว`);
    }
    setLoading(false);
  }

  return (
    <Button 
      variant={isActive ? "outline" : "default"} 
      size="sm" 
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isActive ? (
        <>
          <PowerOff className="h-4 w-4 mr-2" />
          ปิดใช้งาน
        </>
      ) : (
        <>
          <Power className="h-4 w-4 mr-2" />
          เปิดใช้งาน
        </>
      )}
    </Button>
  );
}

export function DeletePromoButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const res = await deletePromoCode(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("ลบรหัสส่วนลดเรียบร้อยแล้ว");
    }
    setLoading(false);
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
        <Trash2 className="h-4 w-4" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ยืนยันการลบ?</AlertDialogTitle>
          <AlertDialogDescription>
            การดำเนินการนี้ไม่สามารถย้อนกลับได้ คุณต้องการลบโค้ดส่วนลดนี้ใช่หรือไม่? 
            (ไม่สามารถลบโค้ดที่มีประวัติการใช้งานแล้วได้)
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            ลบข้อมูล
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RequestType } from "@/app/generated/prisma";
import { createChangeRequest } from "@/app/actions/requests";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { REQUEST_DEADLINE_DAYS, canSubmitBookingRequest } from "@/lib/booking-status";
import { bangkokToday } from "@/lib/bangkok-date";

interface ChangeRequestButtonsProps {
  bookingId: string;
  classDate: Date;
  availableClasses: { id: string; name: string; date: Date; startTime: string }[];
}

const textareaClassName =
  "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function ChangeRequestButtons({ bookingId, classDate, availableClasses }: ChangeRequestButtonsProps) {
  const [openDialog, setOpenDialog] = useState<RequestType | null>(null);
  const [reason, setReason] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (new Date(classDate) < bangkokToday()) {
    return <span className="text-xs text-red-500 font-medium">*เลยวันและเวลาคลาสเรียนแล้ว ไม่สามารถขอเปลี่ยนรอบได้</span>;
  }

  if (!canSubmitBookingRequest(classDate)) {
    return (
      <span className="mt-4 text-xs text-[#6a5d50] sm:mt-0">
        ขอเปลี่ยนรอบหรือยกเลิกได้ล่วงหน้าอย่างน้อย {REQUEST_DEADLINE_DAYS} วันก่อนวันเรียน หากจำเป็นกรุณาติดต่อแอดมินทาง LINE
      </span>
    );
  }

  const closeDialog = () => {
    setOpenDialog(null);
    setReason("");
    setSelectedEventId("");
  };

  const submit = async (type: RequestType) => {
    if (type === RequestType.COURSE_CHANGE && !selectedEventId) {
      toast.error("กรุณาเลือกรอบเรียนที่ต้องการเปลี่ยน");
      return;
    }
    if (type === RequestType.CANCELLATION && !reason.trim()) {
      toast.error("กรุณาระบุเหตุผลที่ต้องการยกเลิก");
      return;
    }

    setIsLoading(true);
    try {
      const eventId = type === RequestType.COURSE_CHANGE ? selectedEventId : undefined;
      const result = await createChangeRequest(bookingId, type, reason, eventId);
      if (result.success) {
        toast.success(type === RequestType.CANCELLATION ? "ส่งคำขอยกเลิกสำเร็จ" : "ส่งคำขอเปลี่ยนรอบเรียนสำเร็จ");
        closeDialog();
      } else {
        toast.error(result.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-0">
        <Button variant="outline" size="sm" className="text-[#6a5d50] border-[#ddd4c8]" onClick={() => setOpenDialog(RequestType.COURSE_CHANGE)}>
          ขอเปลี่ยนรอบ
        </Button>
        <Button variant="outline" size="sm" className="text-[#8f3b2c] border-[#e5c4bc]" onClick={() => setOpenDialog(RequestType.CANCELLATION)}>
          ขอยกเลิก
        </Button>
      </div>

      <Dialog open={openDialog === RequestType.COURSE_CHANGE} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ขอเปลี่ยนรอบเรียน</DialogTitle>
            <DialogDescription>กรุณาเลือกรอบเรียนที่ต้องการเปลี่ยน แอดมินจะตรวจสอบที่นั่งว่างและแจ้งผลผ่าน LINE OA</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-class">เลือกรอบเรียนใหม่</Label>
              <Select value={selectedEventId} onValueChange={(value) => setSelectedEventId(value ?? "")}>
                <SelectTrigger id="new-class"><SelectValue placeholder="คลิกเพื่อเลือกรอบเรียน" /></SelectTrigger>
                <SelectContent>
                  {availableClasses.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} - {new Date(c.date).toLocaleDateString("th-TH")} ({c.startTime})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="change-reason">หมายเหตุเพิ่มเติม (ถ้ามี)</Label>
              <textarea id="change-reason" placeholder="ระบุเพิ่มเติม..." value={reason} onChange={(e) => setReason(e.target.value)} className={textareaClassName} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isLoading}>ยกเลิก</Button>
            <Button onClick={() => submit(RequestType.COURSE_CHANGE)} disabled={isLoading}>{isLoading ? "กำลังส่ง..." : "ยืนยันการขอเปลี่ยนรอบ"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog === RequestType.CANCELLATION} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ขอยกเลิกการจอง</DialogTitle>
            <DialogDescription>
              แอดมินจะตรวจสอบคำขอและแจ้งผลผ่าน LINE OA หากอนุมัติ แอดมินจะโอนเงินคืนให้ตามช่องทางที่ชำระมา
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <Label htmlFor="cancel-reason">เหตุผลที่ต้องการยกเลิก</Label>
            <textarea id="cancel-reason" placeholder="เช่น ติดธุระด่วน" value={reason} onChange={(e) => setReason(e.target.value)} className={textareaClassName} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isLoading}>ปิด</Button>
            <Button onClick={() => submit(RequestType.CANCELLATION)} disabled={isLoading}>{isLoading ? "กำลังส่ง..." : "ยืนยันการขอยกเลิก"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RequestType } from "@/app/generated/prisma";
import { createChangeRequest } from "@/app/actions/requests";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChangeRequestButtonsProps {
  bookingId: string;
  classDate: Date;
  availableClasses: { id: string; name: string; date: Date; startTime: string }[];
}

export function ChangeRequestButtons({ bookingId, classDate, availableClasses }: ChangeRequestButtonsProps) {
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isChangeOpen, setIsChangeOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Determine if class has already passed
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(classDate);
  eventDate.setHours(0, 0, 0, 0);
  const isPast = eventDate < today;

  const handleSubmit = async (type: RequestType) => {
    if (type === RequestType.CANCELLATION && !reason.trim()) {
      toast.error("กรุณาระบุเหตุผล");
      return;
    }
    if (type === RequestType.COURSE_CHANGE && !selectedEventId) {
      toast.error("กรุณาเลือกรอบเรียนที่ต้องการเปลี่ยน");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await createChangeRequest(bookingId, type, reason, selectedEventId);
      if (res.success) {
        toast.success(
          type === RequestType.CANCELLATION 
            ? "ส่งคำขอยกเลิกและคืนเงินสำเร็จ" 
            : "ส่งคำขอเปลี่ยนรอบเรียนสำเร็จ"
        );
        setIsCancelOpen(false);
        setIsChangeOpen(false);
        setReason("");
      } else {
        toast.error(res.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPast) {
    return (
      <div className="flex flex-col text-right">
         <span className="text-xs text-red-500 font-medium">*เลยวันและเวลาคลาสเรียนแล้ว ไม่สามารถขอคืนเงินหรือเปลี่ยนรอบได้</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 mt-4 sm:mt-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-[#6a5d50] border-[#ddd4c8]"
          onClick={() => setIsChangeOpen(true)}
        >
          ขอเปลี่ยนรอบ
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          onClick={() => setIsCancelOpen(true)}
        >
          ขอคืนเงิน
        </Button>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ขอยกเลิกและคืนเงิน</DialogTitle>
            <DialogDescription>
              กรุณาระบุเหตุผลในการขอยกเลิกและคืนเงิน แอดมินจะทำการตรวจสอบและแจ้งผลผ่าน LINE OA
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cancel-reason">เหตุผลที่ขอยกเลิก</Label>
              <textarea 
                id="cancel-reason" 
                placeholder="เช่น ไม่สะดวกเข้าเรียนในวันดังกล่าว..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <p className="text-xs text-red-500">
              *หมายเหตุ: หากเกินวันที่สายหรือเลยเวลาคลาสแล้ว จะไม่สามารถขอคืนเงินได้
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelOpen(false)} disabled={isLoading}>ยกเลิก</Button>
            <Button onClick={() => handleSubmit(RequestType.CANCELLATION)} disabled={isLoading} className="bg-red-600 hover:bg-red-700 text-white">
              {isLoading ? "กำลังส่ง..." : "ยืนยันการขอยกเลิก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Dialog */}
      <Dialog open={isChangeOpen} onOpenChange={setIsChangeOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ขอเปลี่ยนรอบเรียน</DialogTitle>
            <DialogDescription>
              กรุณาเลือกรอบเรียนที่ต้องการเปลี่ยน แอดมินจะตรวจสอบที่นั่งว่างและแจ้งผลผ่าน LINE OA
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-class">เลือกรอบเรียนใหม่</Label>
              <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                <SelectTrigger id="new-class">
                  <SelectValue placeholder="คลิกเพื่อเลือกรอบเรียน" />
                </SelectTrigger>
                <SelectContent>
                  {availableClasses.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} - {new Date(c.date).toLocaleDateString("th-TH")} ({c.startTime})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="change-reason">หมายเหตุเพิ่มเติม (ถ้ามี)</Label>
              <textarea 
                id="change-reason" 
                placeholder="ระบุเพิ่มเติม..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <p className="text-xs text-red-500">
              *หมายเหตุ: หากเกินวันที่สายหรือเลยเวลาคลาสแล้ว จะไม่สามารถขอเปลี่ยนรอบได้
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangeOpen(false)} disabled={isLoading}>ยกเลิก</Button>
            <Button onClick={() => handleSubmit(RequestType.COURSE_CHANGE)} disabled={isLoading}>
              {isLoading ? "กำลังส่ง..." : "ยืนยันการขอเปลี่ยนรอบ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

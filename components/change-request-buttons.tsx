"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RequestType } from "@/app/generated/prisma";
import { createChangeRequest } from "@/app/actions/requests";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChangeRequestButtonsProps {
  bookingId: string;
  classDate: Date;
  availableClasses: { id: string; name: string; date: Date; startTime: string }[];
}

export function ChangeRequestButtons({ bookingId, classDate, availableClasses }: ChangeRequestButtonsProps) {
  const [isChangeOpen, setIsChangeOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(classDate);
  eventDate.setHours(0, 0, 0, 0);

  if (eventDate < today) {
    return <span className="text-xs text-red-500 font-medium">*เลยวันและเวลาคลาสเรียนแล้ว ไม่สามารถขอเปลี่ยนรอบได้</span>;
  }

  const handleSubmit = async () => {
    if (!selectedEventId) {
      toast.error("กรุณาเลือกรอบเรียนที่ต้องการเปลี่ยน");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createChangeRequest(bookingId, RequestType.COURSE_CHANGE, reason, selectedEventId);
      if (result.success) {
        toast.success("ส่งคำขอเปลี่ยนรอบเรียนสำเร็จ");
        setIsChangeOpen(false);
        setReason("");
        setSelectedEventId("");
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
      <Button variant="outline" size="sm" className="text-[#6a5d50] border-[#ddd4c8] mt-4 sm:mt-0" onClick={() => setIsChangeOpen(true)}>
        ขอเปลี่ยนรอบ
      </Button>

      <Dialog open={isChangeOpen} onOpenChange={setIsChangeOpen}>
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
              <textarea id="change-reason" placeholder="ระบุเพิ่มเติม..." value={reason} onChange={(e) => setReason(e.target.value)} className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangeOpen(false)} disabled={isLoading}>ยกเลิก</Button>
            <Button onClick={handleSubmit} disabled={isLoading}>{isLoading ? "กำลังส่ง..." : "ยืนยันการขอเปลี่ยนรอบ"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

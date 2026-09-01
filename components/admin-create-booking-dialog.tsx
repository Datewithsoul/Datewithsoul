"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { adminCreateBooking } from "@/app/admin/(protected)/bookings/actions";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="admin-btn-primary">
      {pending ? "กำลังบันทึก..." : "สร้างการจอง"}
    </Button>
  );
}

export function AdminCreateBookingDialog({ 
  users, 
  classEvents 
}: { 
  users: { id: string, name: string, email?: string | null, phone?: string | null }[],
  classEvents: { id: string, name: string, date: Date, startTime: string, endTime: string, totalSeats: number }[]
}) {
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    const res = await adminCreateBooking(formData);
    if (!res.success) {
      setError(res.error || "เกิดข้อผิดพลาด");
    } else {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="admin-btn-primary h-9 px-3.5 text-sm gap-2">
          <span>+ สร้างการจองให้ลูกค้า</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#f4f1ec] border-[#ddd4c8]">
        <DialogHeader>
          <DialogTitle className="text-[#3d3229]">สร้างการจองใหม่</DialogTitle>
          <DialogDescription className="text-[#6a5d50]">
            สำหรับแอดมินสร้างการจองแทนลูกค้า
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4 py-4">
          {error && <div className="text-red-600 text-sm">{error}</div>}
          
          <div className="flex flex-col gap-2">
            <Label htmlFor="userId" className="text-[#3d3229]">เลือกลูกค้า</Label>
            <select 
              name="userId" 
              id="userId" 
              required
              className="flex h-10 w-full items-center justify-between rounded-md border border-[#ddd4c8] bg-white px-3 py-2 text-sm text-[#3d3229] placeholder:text-[#a09486] focus:outline-none focus:ring-2 focus:ring-[#e25d3a]/20 focus:border-[#e25d3a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">-- เลือกลูกค้า --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} {u.phone ? `(${u.phone})` : ""}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="classEventId" className="text-[#3d3229]">คอร์สเรียน</Label>
            <select 
              name="classEventId" 
              id="classEventId" 
              required
              className="flex h-10 w-full items-center justify-between rounded-md border border-[#ddd4c8] bg-white px-3 py-2 text-sm text-[#3d3229] placeholder:text-[#a09486] focus:outline-none focus:ring-2 focus:ring-[#e25d3a]/20 focus:border-[#e25d3a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">-- เลือกคอร์สเรียน --</option>
              {classEvents.map(c => (
                <option key={c.id} value={c.id} disabled={c.totalSeats === 0}>
                  {c.name} ({new Date(c.date).toLocaleDateString("th-TH")} {c.startTime}-{c.endTime}) - ว่าง {c.totalSeats}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="seats" className="text-[#3d3229]">จำนวนที่นั่ง</Label>
            <Input 
              type="number" 
              id="seats" 
              name="seats" 
              min="1" 
              defaultValue="1" 
              required 
              className="bg-white border-[#ddd4c8]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="note" className="text-[#3d3229]">หมายเหตุ</Label>
            <textarea 
              id="note" 
              name="note" 
              placeholder="เช่น สร้างโดยแอดมินแทนลูกค้า..."
              className="flex min-h-[80px] w-full rounded-md border border-[#ddd4c8] bg-white px-3 py-2 text-sm text-[#3d3229] placeholder:text-[#a09486] focus:outline-none focus:ring-2 focus:ring-[#e25d3a]/20 focus:border-[#e25d3a]"
            />
          </div>

          <div className="flex items-center space-x-2 mt-2">
            <input type="checkbox" id="markAsPaid" name="markAsPaid" className="h-4 w-4 rounded border-[#ddd4c8] text-[#e25d3a] focus:ring-[#e25d3a]" />
            <Label htmlFor="markAsPaid" className="text-[#3d3229]">
              ยืนยันการชำระเงินทันที (ข้ามขั้นตอนรอสลิป)
            </Label>
          </div>

          <DialogFooter className="mt-4">
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

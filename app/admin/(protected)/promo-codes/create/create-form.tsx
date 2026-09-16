"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { createPromoCode } from "../actions";
import { Loader2 } from "lucide-react";
import { ClassEvent } from "@prisma/client";

export function CreatePromoCodeForm({ classEvents }: { classEvents: ClassEvent[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT" | "FREE">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("0");
  const [applyToAll, setApplyToAll] = useState(true);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [maxUses, setMaxUses] = useState("");
  const [perUserLimit, setPerUserLimit] = useState("1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      toast.error("กรุณาระบุรหัสส่วนลด");
      return;
    }

    if (discountType !== "FREE" && Number(discountValue) <= 0) {
      toast.error("กรุณาระบุมูลค่าส่วนลดให้ถูกต้อง");
      return;
    }

    if (!applyToAll && selectedClasses.length === 0) {
      toast.error("กรุณาเลือกคอร์สเรียนที่สามารถใช้โค้ดได้");
      return;
    }

    setLoading(true);
    const res = await createPromoCode({
      code,
      discountType,
      discountValue: discountType === "FREE" ? 0 : Number(discountValue),
      applyToAll,
      maxUses: maxUses ? Number(maxUses) : null,
      perUserLimit: Number(perUserLimit) || 1,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      isActive,
      applicableEventIds: selectedClasses
    });

    setLoading(false);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("สร้างรหัสส่วนลดเรียบร้อยแล้ว");
      router.push("/admin/promo-codes");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="code">รหัสส่วนลด (Code)</Label>
          <Input 
            id="code" 
            placeholder="เช่น SUMMER2026, FREECOURSE" 
            value={code} 
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required 
          />
        </div>

        <div className="space-y-2">
          <Label>ประเภทส่วนลด</Label>
          <RadioGroup 
            value={discountType} 
            onValueChange={(val: any) => setDiscountType(val)} 
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="PERCENTAGE" id="pct" />
              <Label htmlFor="pct">เปอร์เซ็นต์ (%)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="FIXED_AMOUNT" id="fixed" />
              <Label htmlFor="fixed">ลดเป็นบาท (฿)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="FREE" id="free" />
              <Label htmlFor="free">เรียนฟรี (100%)</Label>
            </div>
          </RadioGroup>
        </div>

        {discountType !== "FREE" && (
          <div>
            <Label htmlFor="discountValue">มูลค่าส่วนลด</Label>
            <Input 
              id="discountValue" 
              type="number" 
              min="0"
              value={discountValue} 
              onChange={(e) => setDiscountValue(e.target.value)}
              required 
            />
          </div>
        )}

        <div className="space-y-2 pt-4 border-t">
          <Label>ขอบเขตการใช้งาน</Label>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="applyToAll" 
              checked={applyToAll} 
              onCheckedChange={(checked) => setApplyToAll(checked as boolean)} 
            />
            <Label htmlFor="applyToAll">ใช้ได้กับทุกคอร์ส</Label>
          </div>
        </div>

        {!applyToAll && (
          <div className="space-y-2 p-4 border rounded-md bg-muted/20">
            <Label>เลือกคอร์สที่ร่วมรายการ</Label>
            {classEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">ไม่มีคอร์สที่เปิดสอน</p>
            ) : (
              <div className="grid gap-2 mt-2">
                {classEvents.map(ce => (
                  <div key={ce.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`class-${ce.id}`} 
                      checked={selectedClasses.includes(ce.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedClasses([...selectedClasses, ce.id]);
                        } else {
                          setSelectedClasses(selectedClasses.filter(id => id !== ce.id));
                        }
                      }}
                    />
                    <Label htmlFor={`class-${ce.id}`} className="font-normal">{ce.name}</Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <Label htmlFor="maxUses">จำกัดจำนวนสิทธิ์รวมทั้งหมด (เว้นว่างถ้าไม่จำกัด)</Label>
            <Input 
              id="maxUses" 
              type="number" 
              placeholder="เช่น 100" 
              value={maxUses} 
              onChange={(e) => setMaxUses(e.target.value)} 
            />
          </div>
          <div>
            <Label htmlFor="perUserLimit">จำกัดสิทธิ์ต่อ 1 ผู้ใช้</Label>
            <Input 
              id="perUserLimit" 
              type="number" 
              min="1"
              value={perUserLimit} 
              onChange={(e) => setPerUserLimit(e.target.value)} 
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">วันที่เริ่มใช้งาน</Label>
            <Input 
              id="startDate" 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
          </div>
          <div>
            <Label htmlFor="endDate">วันที่สิ้นสุด (วันหมดอายุ)</Label>
            <Input 
              id="endDate" 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-4 border-t">
          <Checkbox 
            id="isActive" 
            checked={isActive} 
            onCheckedChange={(checked) => setIsActive(checked as boolean)} 
          />
          <Label htmlFor="isActive">เปิดใช้งานทันที</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" type="button" onClick={() => router.back()}>
          ยกเลิก
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          บันทึกโค้ดส่วนลด
        </Button>
      </div>
    </form>
  );
}

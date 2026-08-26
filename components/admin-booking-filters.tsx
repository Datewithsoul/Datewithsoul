"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

const STATUS_LABELS: Record<string, string> = {
  ALL: "สถานะทั้งหมด",
  PENDING_PAYMENT: "กำลังจอง/ชำระเงิน",
  PAYMENT_REVIEW: "รอตรวจสอบชำระเงิน",
  CONFIRMED: "ยืนยันแล้ว",
  CHANGE_REQUESTED: "ขอเปลี่ยนรอบ",
  CANCELLED: "ยกเลิกแล้ว",
  EXPIRED: "หมดอายุ",
  COMPLETED: "เรียนแล้ว",
};

export function AdminBookingFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("q") ?? "";
  const currentStatus = searchParams.get("status") ?? "ALL";

  const [search, setSearch] = useState(currentSearch);
  const debouncedSearch = useDebounce(search, 500);

  // Use a ref to track the previous debounced value so we only push when it actually changes
  const prevDebouncedRef = useRef(currentSearch);

  useEffect(() => {
    if (debouncedSearch === prevDebouncedRef.current) return;
    prevDebouncedRef.current = debouncedSearch;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      params.delete("q");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "ALL") {
      params.set("status", value);
    } else {
      params.delete("status");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center p-4 border-b border-[#ddd4c8] bg-white">
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#6a5d50]" />
        <Input
          type="text"
          placeholder="ค้นหาชื่อ, เบอร์โทร..."
          className="pl-9 bg-[#fcfbf9] border-[#ddd4c8] focus-visible:ring-[#8f3b2c]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-[200px]">
        <Select value={currentStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="bg-[#fcfbf9] border-[#ddd4c8] focus:ring-[#8f3b2c]">
            <SelectValue placeholder="สถานะทั้งหมด">
              {STATUS_LABELS[currentStatus]}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">สถานะทั้งหมด</SelectItem>
            <SelectItem value="PENDING_PAYMENT">กำลังจอง/ชำระเงิน</SelectItem>
            <SelectItem value="PAYMENT_REVIEW">รอตรวจสอบชำระเงิน</SelectItem>
            <SelectItem value="CONFIRMED">ยืนยันแล้ว</SelectItem>
            <SelectItem value="CHANGE_REQUESTED">ขอเปลี่ยนรอบ</SelectItem>
            <SelectItem value="CANCELLED">ยกเลิกแล้ว</SelectItem>
            <SelectItem value="EXPIRED">หมดอายุ</SelectItem>
            <SelectItem value="COMPLETED">เรียนแล้ว</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isPending && <span className="text-sm text-[#6a5d50]">กำลังโหลด...</span>}
    </div>
  );
}

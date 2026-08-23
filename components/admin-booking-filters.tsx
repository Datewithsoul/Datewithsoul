"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export function AdminBookingFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("q") ?? "";
  const currentStatus = searchParams.get("status") ?? "ALL";

  const [search, setSearch] = useState(currentSearch);
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      params.delete("q");
    }
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [debouncedSearch, pathname, router, searchParams]);

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
            <SelectValue placeholder="สถานะทั้งหมด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">สถานะทั้งหมด</SelectItem>
            <SelectItem value="BOOKING">กำลังจอง</SelectItem>
            <SelectItem value="AWAITING_PAYMENT">รอชำระเงิน</SelectItem>
            <SelectItem value="PAYMENT_REVIEW">รอตรวจสอบชำระเงิน</SelectItem>
            <SelectItem value="PAID">ชำระเงินแล้ว</SelectItem>
            <SelectItem value="CANCELLED">ยกเลิกแล้ว</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {isPending && <span className="text-sm text-[#6a5d50]">กำลังโหลด...</span>}
    </div>
  );
}

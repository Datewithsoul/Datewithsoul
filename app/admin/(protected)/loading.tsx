import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4 text-[#6a5d50]">
      <Loader2 className="h-8 w-8 animate-spin text-[#8f3b2c]" />
      <p className="text-sm">กำลังโหลดข้อมูล...</p>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";

export function CloseClassButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      type="submit" 
      className={className}
      onClick={(e) => {
        if (!window.confirm("แน่ใจหรือไม่ว่าต้องการปิดรับสมัครคลาสนี้? (ผู้จองเดิมจะยังคงอยู่ แต่จะไม่มีการรับจองเพิ่ม)")) {
          e.preventDefault();
        }
      }}
      {...props}
    >
      ปิดรับสมัคร
    </Button>
  );
}

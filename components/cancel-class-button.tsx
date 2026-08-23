"use client";

import { Button } from "@/components/ui/button";

export function CancelClassButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button 
      variant="destructive" 
      size="sm" 
      type="submit" 
      className={className}
      onClick={(e) => {
        if (!window.confirm("แน่ใจหรือไม่ว่าต้องการยกเลิกคลาสนี้? ระบบจะยกเลิกการจองทั้งหมดที่เกี่ยวข้องด้วย")) {
          e.preventDefault();
        }
      }}
      {...props}
    >
      ยกเลิกคลาส
    </Button>
  );
}

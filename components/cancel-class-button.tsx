"use client";

import { Button } from "@/components/ui/button";

export function CancelClassButton() {
  return (
    <Button 
      variant="destructive" 
      size="sm" 
      type="submit" 
      onClick={(e) => {
        if (!window.confirm("แน่ใจหรือไม่ว่าต้องการยกเลิกคลาสนี้? ระบบจะยกเลิกการจองทั้งหมดที่เกี่ยวข้องด้วย")) {
          e.preventDefault();
        }
      }}
    >
      ยกเลิกคลาส
    </Button>
  );
}

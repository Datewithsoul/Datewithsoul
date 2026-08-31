"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="rounded-full bg-red-100 p-3 text-red-600">
        <AlertCircle className="h-8 w-8" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-[#3d3229]">เกิดข้อผิดพลาดในการโหลดข้อมูล</h2>
        <p className="text-sm text-[#6a5d50] max-w-md">
          {error.message || "ระบบไม่สามารถดึงข้อมูลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง"}
        </p>
      </div>
      <Button 
        onClick={() => reset()}
        className="mt-4 bg-[#8f3b2c] hover:bg-[#7a3124] text-white"
      >
        ลองใหม่อีกครั้ง
      </Button>
    </div>
  );
}

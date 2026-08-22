"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-[#222222] p-4">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertTriangle size={32} />
            </div>
            
            <h1 className="text-2xl font-bold">เกิดข้อผิดพลาดร้ายแรง</h1>
            <p className="text-gray-500 text-sm">
              ระบบเกิดข้อผิดพลาดที่ไม่สามารถทำงานต่อได้ กรุณารีเฟรชหน้าเว็บหรือติดต่อผู้ดูแลระบบ
            </p>
            
            <div className="pt-4 flex flex-col gap-3">
              <button
                onClick={() => reset()}
                className="w-full bg-[#FFC107] hover:bg-[#FFB300] text-[#222222] font-bold py-3 px-6 rounded-full transition-all transform active:scale-[0.98]"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

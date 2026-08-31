"use client";

import React, { useState, useRef, useTransition } from "react";
import { Upload, Image as ImageIcon, Loader2, X } from "lucide-react";
import { compressImage } from "@/lib/image-compression";

interface SlipUploadFormProps {
  id: string;
  type?: "booking" | "group";
  action: (formData: FormData) => Promise<void>;
  buttonText?: string;
}

export function SlipUploadForm({
  id,
  type = "booking",
  action,
  buttonText = "แจ้งชำระเงิน",
}: SlipUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [fileSizeInfo, setFileSizeInfo] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const originalSizeMb = (file.size / (1024 * 1024)).toFixed(2);

    try {
      setIsCompressing(true);
      // Auto compress high-res mobile photos to prevent 413 Function Payload Too Large
      const compressed = await compressImage(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.85,
      });

      const compressedSizeKb = Math.round(compressed.size / 1024);
      setSelectedFile(compressed);
      setFileSizeInfo(
        file.size > 1024 * 1024
          ? `ลดขนาดจาก ${originalSizeMb} MB เหลือ ${compressedSizeKb} KB`
          : `ขนาด: ${compressedSizeKb} KB`
      );

      const objectUrl = URL.createObjectURL(compressed);
      setPreviewUrl(objectUrl);
    } catch (err) {
      console.error("Image compression error:", err);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } finally {
      setIsCompressing(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setFileSizeInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    if (type === "group") {
      formData.append("groupId", id);
      formData.append("slip", selectedFile);
    } else {
      formData.append("bookingId", id);
      formData.append("slipImage", selectedFile);
    }

    startTransition(async () => {
      await action(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="slipInput" className="font-semibold text-sm text-[#4a3b32]">
          อัปโหลดรูปสลิป <span className="text-red-500">*</span>
        </label>

        {!previewUrl ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-[#d4c7b8] hover:border-[#8f3b2c] bg-[#faf8f5] hover:bg-[#f5efe6] rounded-xl p-6 text-center transition-all flex flex-col items-center justify-center gap-2"
          >
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#8f3b2c] shadow-sm">
              <Upload size={22} />
            </div>
            <p className="text-sm font-semibold text-[#4a3b32]">
              คลิกเพื่อเลือกรูปภาพสลิป
            </p>
            <p className="text-xs text-gray-500">
              รองรับไฟล์ JPG, PNG, WEBP (บีบอัดรูปให้อัตโนมัติ)
            </p>
          </div>
        ) : (
          <div className="relative border border-[#d4c7b8] rounded-xl p-3 bg-[#faf8f5] flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-lg border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
              <img
                src={previewUrl}
                alt="สลิปพรีวิว"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-[#4a3b32] truncate">
                <ImageIcon size={16} className="text-[#8f3b2c] flex-shrink-0" />
                <span className="truncate">{selectedFile?.name}</span>
              </div>
              {fileSizeInfo && (
                <p className="text-xs text-green-700 font-medium mt-1">
                  ✓ {fileSizeInfo}
                </p>
              )}
              {isCompressing && (
                <p className="text-xs text-[#8f3b2c] mt-1 flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin" /> กำลังประมวลผลรูปภาพ...
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleClear}
              disabled={isPending}
              className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 hover:text-red-600 transition-colors"
              title="ยกเลิกรูปนี้"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          id="slipInput"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={isPending}
        />
      </div>

      <button
        type="submit"
        disabled={!selectedFile || isCompressing || isPending}
        className="mt-2 pop-btn-red text-white py-3.5 rounded-xl font-bold transition-all w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-base"
      >
        {isPending ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            <span>กำลังส่งหลักฐาน...</span>
          </>
        ) : (
          <span>{buttonText}</span>
        )}
      </button>
    </form>
  );
}

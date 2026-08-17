"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";

export default function ShareButton({ url, title }: { url?: string, title?: string }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      const shareUrl = url || window.location.href;
      
      // Try to use the native Web Share API first if available (great for mobile)
      if (navigator.share) {
        await navigator.share({
          title: title || "Date With Soul",
          url: shareUrl
        });
        return;
      }
      
      // Fallback to clipboard copy
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to share", err);
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors relative"
    >
      <Share2 size={16} /> 
      <span className="underline">{copied ? "คัดลอกลิงก์แล้ว!" : "แชร์"}</span>
    </button>
  );
}

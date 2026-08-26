"use client";

import { PlayCircle, X, Maximize2 } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { useState } from "react";

interface MediaItem {
  id: string;
  type: string;
  url: string;
}

interface MediaGalleryProps {
  media: MediaItem[];
  classNameTitle: string;
}

export default function MediaGallery({ media, classNameTitle }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!media || media.length === 0) {
    return (
      <div className="w-full aspect-video rounded-2xl overflow-hidden mb-12 bg-gray-100 relative group flex flex-col items-center justify-center text-gray-400">
        <PlayCircle size={48} className="mb-2" />
        <span className="font-bold">ไม่มีรูปภาพประกอบ</span>
      </div>
    );
  }

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % media.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + media.length) % media.length);
    }
  };

  return (
    <>
      <div className="w-full aspect-video rounded-2xl overflow-hidden mb-12 bg-gray-100 relative group">
        <Carousel opts={{ align: "start", loop: true }} className="w-full h-full">
          <CarouselContent className="h-full">
            {media.map((m, index) => (
              <CarouselItem key={m.id} className="h-full pl-0 basis-full">
                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                  {m.type === "VIDEO" ? (
                    <video 
                      src={m.url} 
                      className="block w-full h-full object-cover"
                      controls 
                    />
                  ) : (
                    <div 
                      className="relative w-full h-full cursor-pointer group/image"
                      onClick={() => setSelectedIndex(index)}
                    >
                      <img 
                        src={m.url} 
                        alt={classNameTitle}
                        className="block w-full h-full object-cover object-center"
                      />
                      <div className="absolute top-4 right-4 bg-black/60 text-white text-[13px] px-3 py-1.5 rounded-full flex items-center gap-1.5 pointer-events-none backdrop-blur-sm shadow-sm transition-opacity opacity-80 group-hover/image:opacity-100">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>กดเพื่อดูรูปเต็ม</span>
                      </div>
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {media.length > 1 && (
            <>
              <CarouselPrevious className="left-4 bg-white/80 hover:bg-white shadow-md border-none h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity text-black" />
              <CarouselNext className="right-4 bg-white/80 hover:bg-white shadow-md border-none h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity text-black" />
            </>
          )}
        </Carousel>
      </div>

      <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && setSelectedIndex(null)}>
        <DialogContent className="max-w-7xl w-full p-0 bg-transparent border-none shadow-none flex flex-col items-center justify-center">
          <DialogTitle className="sr-only">View Image</DialogTitle>
          {selectedIndex !== null && (
            <div className="relative w-full h-[85vh] flex items-center justify-center group">
              {media[selectedIndex].type === "VIDEO" ? (
                <video 
                  src={media[selectedIndex].url} 
                  className="max-w-full max-h-full rounded-md"
                  controls
                  autoPlay
                />
              ) : (
                <img 
                  src={media[selectedIndex].url} 
                  alt={classNameTitle}
                  className="max-w-full max-h-full object-contain rounded-md select-none"
                />
              )}
              
              <DialogClose className="absolute top-0 right-0 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors m-4 z-50">
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </DialogClose>

              {media.length > 1 && (
                <>
                  <button 
                    onClick={handlePrev}
                    className="absolute left-4 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 z-50"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  <button 
                    onClick={handleNext}
                    className="absolute right-4 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 z-50"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

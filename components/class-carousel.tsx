"use client";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Link from "next/link";

interface ClassCarouselProps {
  classId: string;
  classNameTitle: string;
  media: {
    id: string;
    url: string;
    type: string;
  }[];
}

export default function ClassCarousel({ classId, classNameTitle, media }: ClassCarouselProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-gray-200">
      <Carousel 
        opts={{ align: "start", loop: true }} 
        className="w-full"
      >
        <CarouselContent>
          {media.map((m) => (
            <CarouselItem key={m.id} className="relative cursor-pointer">
              <Link href={`/classes/${classId}`} className="w-full block aspect-[4/3]">
                {m.type === "VIDEO" ? (
                  <video 
                    src={m.url} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img 
                    src={m.url} 
                    alt={classNameTitle}
                    className="w-full h-full object-cover"
                  />
                )}
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

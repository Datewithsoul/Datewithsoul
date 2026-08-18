"use client";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";

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
  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-gray-200">
      <Carousel 
        opts={{ align: "start", loop: true }} 
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
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

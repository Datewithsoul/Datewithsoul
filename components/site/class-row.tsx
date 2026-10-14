import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { HomeClassCard, type HomeClassGroup } from "@/components/site/home-class-card";
import { SectionHeading } from "@/components/site/page-hero";
import { Reveal } from "@/components/motion/reveal";

/** Titled horizontal row of class cards, used on the home page. */
export function ClassRow({
  eyebrow,
  title,
  classes,
  href = "/classes",
}: {
  eyebrow: string;
  title: React.ReactNode;
  classes: HomeClassGroup[];
  href?: string;
}) {
  if (classes.length === 0) return null;

  return (
    <Reveal as="section">
      <div className="mb-8 flex items-end justify-between gap-4">
        <SectionHeading align="left" eyebrow={eyebrow} title={title} />
        <Link
          href={href}
          className="group hidden shrink-0 items-center gap-1 text-sm font-semibold text-lux-gold underline-offset-4 hover:underline sm:inline-flex"
        >
          ดูทั้งหมด <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
        </Link>
      </div>

      <Carousel opts={{ align: "start" }} className="w-full">
        <CarouselContent className="-ml-4 md:-ml-5">
          {classes.map((c) => (
            <CarouselItem key={c.id} className="basis-[70%] pl-4 sm:basis-1/2 md:basis-1/3 md:pl-5 lg:basis-1/4 xl:basis-1/5">
              <div className="h-full py-2">
                <HomeClassCard c={c} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-5 hidden border-lux-line bg-white shadow-md md:flex" />
        <CarouselNext className="-right-5 hidden border-lux-line bg-white shadow-md md:flex" />
      </Carousel>
    </Reveal>
  );
}

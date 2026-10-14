import Navbar from "@/components/navbar";
import { BookingCardSkeleton, LoadingScreen, PageHeroSkeleton, SectionHeadingSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <LoadingScreen label="กำลังโหลดการจองของคุณ">
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <PageHeroSkeleton stats />
        <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-20">
          <SectionHeadingSkeleton className="mb-8 border-b border-lux-line pb-5" />
          <div className="flex flex-col gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <BookingCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    </LoadingScreen>
  );
}

import Navbar from "@/components/navbar";
import { ClassCardSkeleton, LoadingScreen, PageHeroSkeleton, SectionHeadingSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <LoadingScreen>
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <PageHeroSkeleton chips={4} />
        <main className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 md:py-24">
          <SectionHeadingSkeleton className="mb-10 border-b border-lux-line pb-6" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ClassCardSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    </LoadingScreen>
  );
}

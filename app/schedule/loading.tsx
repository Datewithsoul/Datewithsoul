import Navbar from "@/components/navbar";
import { LoadingScreen, PageHeroSkeleton, Sk, TimelineItemSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <LoadingScreen>
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <PageHeroSkeleton stats />
        <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-24">
          <div className="mb-10 flex items-end justify-between border-b border-lux-line pb-5">
            <div className="flex flex-col gap-3">
              <Sk className="h-3 w-14 rounded-full" />
              <Sk className="h-9 w-48 rounded-lg" />
            </div>
            <Sk className="h-4 w-12 rounded-full" />
          </div>
          <ol className="relative ml-3 border-l border-lux-line sm:ml-[5.5rem]">
            {Array.from({ length: 4 }).map((_, i) => (
              <TimelineItemSkeleton key={i} />
            ))}
          </ol>
        </main>
      </div>
    </LoadingScreen>
  );
}

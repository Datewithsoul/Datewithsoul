import Navbar from "@/components/navbar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white text-[#1c1d1f] font-sans overflow-x-hidden">
      {/* We can render a static navbar or just skeleton navbar. A static navbar without user might look strange, but loading.tsx renders while the page is resolving, so we can mock a simple navbar shape. */}
      <header className="border-b border-gray-200 bg-white py-4 px-6 sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-full" />
            <Skeleton className="w-32 h-6" />
          </div>
          <div className="flex items-center gap-6">
            <Skeleton className="w-20 h-5" />
            <Skeleton className="w-9 h-9 rounded-full" />
          </div>
        </div>
      </header>

      {/* Pop Art Class Calendar Section Skeleton */}
      <div className="w-full bg-[#fcf9f5] border-b border-[#e2d5c5] py-8 sm:py-16">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-1/3 pt-4">
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-6" />
              <Skeleton className="h-12 w-40 rounded-full" />
            </div>
            <div className="w-full md:w-2/3">
              <div className="border-4 border-[#5D4037] bg-white rounded-2xl shadow-[8px_8px_0px_#5D4037] p-6 h-[400px]">
                <Skeleton className="w-full h-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Dashboard Section Skeleton */}
      <section className="max-w-[1340px] mx-auto px-6 py-8 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="w-48 h-8" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Classes Skeleton */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="w-40 h-7" />
              <Skeleton className="w-24 h-5" />
            </div>
            <div className="flex flex-col gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4 p-4 border border-gray-200 rounded-xl bg-white">
                  <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-lg" />
                  <div className="flex flex-col justify-center gap-2 flex-1">
                    <Skeleton className="w-3/4 h-6" />
                    <Skeleton className="w-1/2 h-4" />
                    <Skeleton className="w-1/3 h-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Bookings Skeleton */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="w-40 h-7" />
            </div>
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50">
                  <div className="flex flex-col gap-2 flex-1">
                    <Skeleton className="w-2/3 h-5" />
                    <Skeleton className="w-1/3 h-4" />
                  </div>
                  <Skeleton className="w-16 h-6 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Course Carousel Section Skeleton */}
      <section className="max-w-[1340px] mx-auto px-6 py-8">
        <Skeleton className="w-64 h-8 mb-6" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-[280px] shrink-0">
              <Skeleton className="w-full aspect-video rounded-xl mb-3" />
              <Skeleton className="w-full h-5 mb-2" />
              <Skeleton className="w-1/2 h-4 mb-2" />
              <Skeleton className="w-1/3 h-5" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

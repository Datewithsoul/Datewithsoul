import Navbar from "@/components/navbar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-white text-[#222222] font-sans pb-24">
      <Navbar />

      <div className="max-w-[1180px] mx-auto px-6 mt-6 mb-8 relative">
        
        {/* Title Section Skeleton */}
        <div className="mb-6">
          <Skeleton className="w-3/4 md:w-1/2 h-10 rounded-md mb-4 bg-orange-100" />
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <Skeleton className="w-32 h-5 rounded-md bg-gray-100" />
              <Skeleton className="w-40 h-5 rounded-md bg-gray-100" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="w-24 h-5 rounded-md bg-gray-100" />
              <Skeleton className="w-24 h-5 rounded-md bg-gray-100" />
            </div>
          </div>
        </div>

        {/* Media Skeleton */}
        <div className="w-full aspect-video md:aspect-[21/9] rounded-2xl overflow-hidden mb-10 border border-gray-100 shadow-sm">
          <Skeleton className="w-full h-full rounded-none bg-gray-200" />
        </div>

        {/* Content Section Skeleton */}
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Info */}
          <div className="w-full lg:w-[65%]">
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <Skeleton className="w-14 h-14 rounded-full bg-gray-200" />
              <div className="flex flex-col gap-2">
                <Skeleton className="w-40 h-6 rounded-md bg-gray-100" />
                <Skeleton className="w-32 h-5 rounded-md bg-gray-100" />
              </div>
            </div>
            
            <div className="mb-10 flex flex-col gap-3">
              <Skeleton className="w-full h-5 rounded-md bg-gray-100" />
              <Skeleton className="w-11/12 h-5 rounded-md bg-gray-100" />
              <Skeleton className="w-4/5 h-5 rounded-md bg-gray-100" />
              <Skeleton className="w-full h-5 rounded-md bg-gray-100" />
            </div>
          </div>

          {/* Sticky Booking Box Skeleton */}
          <div className="w-full lg:w-[35%] relative">
            <div className="sticky top-24 bg-white p-6 rounded-2xl border border-gray-200 shadow-xl shadow-black/5">
              <Skeleton className="w-32 h-8 rounded-md mb-6 bg-yellow-200" />
              <Skeleton className="w-full h-[60px] rounded-xl mb-4 bg-gray-100" />
              <Skeleton className="w-full h-[50px] rounded-xl mb-6 bg-[#ff385c]/20" />
              <Skeleton className="w-full h-[40px] rounded-xl mb-4 bg-gray-100" />
              <div className="flex justify-between pt-4 border-t border-gray-200 mt-4">
                <Skeleton className="w-20 h-6 rounded-md bg-gray-100" />
                <Skeleton className="w-24 h-6 rounded-md bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

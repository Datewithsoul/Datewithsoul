import Navbar from "@/components/navbar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white text-brand-brown font-sans pb-24 halftone-bg">
      <Navbar />

      <section className="pt-12 pb-6 px-6 max-w-[1280px] mx-auto">
        {/* Page Header Skeleton */}
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 mb-12 text-center max-w-3xl mx-auto flex flex-col items-center">
          <Skeleton className="w-[300px] md:w-[400px] h-10 rounded-xl mb-4 bg-orange-100" />
          <Skeleton className="w-[250px] md:w-[350px] h-6 rounded-md bg-gray-100" />
        </div>

        <div className="flex flex-col gap-16">
          <div>
            <Skeleton className="w-[150px] h-8 rounded-lg mb-6 bg-yellow-200" />
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  <Skeleton className="w-full aspect-[4/3] rounded-none bg-gray-200" />
                  <div className="flex flex-col flex-1 p-5">
                    <div className="flex gap-2 mb-3">
                      <Skeleton className="w-16 h-5 rounded-full bg-green-100" />
                      <Skeleton className="w-16 h-5 rounded-full bg-blue-100" />
                    </div>
                    <Skeleton className="w-full h-6 rounded-md mb-2 bg-gray-200" />
                    <Skeleton className="w-1/2 h-5 rounded-md mb-4 bg-gray-100" />
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-2">
                          <Skeleton className="w-24 h-5 rounded-md bg-gray-100" />
                          <Skeleton className="w-16 h-4 rounded-md bg-gray-100" />
                        </div>
                        <Skeleton className="w-20 h-5 rounded-md bg-gray-100" />
                      </div>
                      <Skeleton className="w-24 h-6 rounded-md bg-gray-200 mt-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

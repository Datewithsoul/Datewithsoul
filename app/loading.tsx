import Navbar from "@/components/navbar";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white text-brand-brown font-sans pb-24 halftone-bg">
      <Navbar />

      {/* Hero Section Skeleton */}
      <section className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden bg-[#faf8f5]">
        <div className="relative z-10 text-center px-4 md:px-8 max-w-4xl mx-auto flex flex-col items-center">
          <Skeleton className="w-[120px] h-8 rounded-full mb-6 bg-yellow-200" />
          <Skeleton className="w-[300px] md:w-[600px] h-[50px] md:h-[80px] rounded-xl mb-4 bg-orange-100" />
          <Skeleton className="w-[200px] md:w-[400px] h-[30px] md:h-[50px] rounded-xl mb-8 bg-orange-100" />
          <Skeleton className="w-[250px] md:w-[450px] h-6 rounded-md mb-8 bg-gray-200" />
          <Skeleton className="w-[180px] h-[50px] rounded-full bg-red-200" />
        </div>
      </section>

      {/* Featured Classes Skeleton */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8 md:mb-12">
          <div>
            <Skeleton className="w-[100px] h-6 rounded-full mb-3 bg-yellow-200" />
            <Skeleton className="w-[250px] h-10 rounded-xl bg-orange-100" />
          </div>
          <Skeleton className="hidden md:block w-[120px] h-10 rounded-full bg-gray-100" />
        </div>

        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-[280px] md:min-w-[300px] xl:min-w-[320px] flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <Skeleton className="w-full aspect-[4/3] rounded-none bg-gray-200" />
              <div className="flex flex-col flex-1 p-4">
                <div className="flex gap-2 mb-3">
                  <Skeleton className="w-16 h-5 rounded-full bg-green-100" />
                  <Skeleton className="w-16 h-5 rounded-full bg-blue-100" />
                </div>
                <Skeleton className="w-full h-6 rounded-md mb-2 bg-gray-200" />
                <Skeleton className="w-2/3 h-5 rounded-md mb-6 bg-gray-100" />
                
                <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-end">
                  <div className="flex flex-col gap-2">
                    <Skeleton className="w-24 h-5 rounded-md bg-gray-100" />
                    <Skeleton className="w-16 h-4 rounded-md bg-gray-100" />
                  </div>
                  <Skeleton className="w-20 h-6 rounded-md bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

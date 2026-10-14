import Navbar from "@/components/navbar";
import { FieldSkeleton, LoadingScreen, Sk } from "@/components/skeletons";

export default function Loading() {
  return (
    <LoadingScreen>
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <main className="mx-auto max-w-[800px] px-6 py-12">
          <Sk className="mb-8 h-9 w-44 rounded-lg" />
          <div className="flex flex-col gap-6 rounded-2xl border border-gray-200 p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <Sk className="h-16 w-16 rounded-full" />
              <div className="flex flex-col gap-2">
                <Sk className="h-5 w-32" />
                <Sk className="h-3.5 w-20 rounded-full" />
              </div>
            </div>
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
            <Sk className="h-12 w-40 rounded-xl" />
          </div>
        </main>
      </div>
    </LoadingScreen>
  );
}

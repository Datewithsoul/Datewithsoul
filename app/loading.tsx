import Navbar from "@/components/navbar";
import { CalendarSkeleton, ClassRowSkeleton, LoadingScreen } from "@/components/skeletons";

export default function Loading() {
  return (
    <LoadingScreen>
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <CalendarSkeleton />
        <div className="mx-auto flex max-w-[1340px] flex-col gap-16 px-4 py-12 sm:px-6 md:gap-20 md:py-16">
          <ClassRowSkeleton />
          <ClassRowSkeleton />
        </div>
      </div>
    </LoadingScreen>
  );
}

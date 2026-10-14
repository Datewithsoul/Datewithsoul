import Navbar from "@/components/navbar";
import { ContentSkeleton, LoadingScreen, PageHeroSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <LoadingScreen>
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <PageHeroSkeleton chips={4} />
        <ContentSkeleton blocks={3} />
      </div>
    </LoadingScreen>
  );
}

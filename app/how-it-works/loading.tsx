import Navbar from "@/components/navbar";
import { ContentSkeleton, LoadingScreen, PageHeroSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <LoadingScreen>
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <PageHeroSkeleton action />
        <ContentSkeleton blocks={2} />
      </div>
    </LoadingScreen>
  );
}

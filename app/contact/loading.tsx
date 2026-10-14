import Navbar from "@/components/navbar";
import { LoadingScreen, PageHeroSkeleton, SectionHeadingSkeleton, Sk } from "@/components/skeletons";

export default function Loading() {
  return (
    <LoadingScreen>
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <PageHeroSkeleton />
        <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 md:py-24">
          <div className="grid items-center gap-10 rounded-[2rem] bg-brand-brown/90 p-8 sm:p-12 md:grid-cols-[1.3fr_1fr]">
            <div className="flex flex-col gap-4">
              <Sk className="h-3 w-40 rounded-full bg-white/15" />
              <Sk className="h-10 w-4/5 rounded-xl bg-white/15" />
              <Sk className="h-4 w-full rounded-full bg-white/10" />
              <Sk className="h-4 w-2/3 rounded-full bg-white/10" />
            </div>
            <div className="flex flex-col items-start gap-4 md:items-end">
              <Sk className="h-12 w-52 rounded-xl bg-white/15" />
              <Sk className="h-14 w-56 rounded-full bg-white/15" />
            </div>
          </div>
          <SectionHeadingSkeleton align="center" className="mb-10 mt-20 md:mt-28" />
          <div className="grid gap-5 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-lux-line p-7">
                <Sk className="h-12 w-12 rounded-full" />
                <Sk className="mt-5 h-5 w-32" />
                <Sk className="mt-3 h-3.5 w-full rounded-full" />
                <Sk className="mt-2 h-3.5 w-3/4 rounded-full" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </LoadingScreen>
  );
}

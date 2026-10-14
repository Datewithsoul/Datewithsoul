import Navbar from "@/components/navbar";
import { LoadingScreen, PageHeroSkeleton, Sk } from "@/components/skeletons";

export default function Loading() {
  return (
    <LoadingScreen>
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <PageHeroSkeleton />
        <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
          <div className="grid gap-12 lg:grid-cols-[16rem_1fr] lg:gap-16">
            <aside className="hidden flex-col gap-4 lg:flex">
              <Sk className="h-3 w-20 rounded-full" />
              {Array.from({ length: 6 }).map((_, i) => (
                <Sk key={i} className="h-4 rounded-full" style={{ width: `${85 - (i % 3) * 15}%` }} />
              ))}
            </aside>
            <article className="flex flex-col gap-12">
              <div className="flex flex-col gap-2.5 border-l-2 border-lux-line pl-5">
                <Sk className="h-5 w-full rounded-full" />
                <Sk className="h-5 w-3/4 rounded-full" />
              </div>
              {Array.from({ length: 3 }).map((_, i) => (
                <section key={i}>
                  <div className="flex items-baseline gap-4 border-b border-lux-line pb-4">
                    <Sk className="h-8 w-9" />
                    <Sk className="h-7 w-56 rounded-lg" />
                  </div>
                  <div className="mt-5 flex flex-col gap-3">
                    {[0, 1, 2].map((j) => (
                      <Sk key={j} className="h-4 rounded-full" style={{ width: `${95 - j * 15}%` }} />
                    ))}
                  </div>
                </section>
              ))}
            </article>
          </div>
        </main>
      </div>
    </LoadingScreen>
  );
}

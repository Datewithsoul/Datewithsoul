import Navbar from "@/components/navbar";
import { LoadingScreen, MapSkeleton, SectionHeadingSkeleton, Sk } from "@/components/skeletons";

export default function Loading() {
  return (
    <LoadingScreen label="กำลังโหลดรายละเอียดคลาส">
      <main className="min-h-screen bg-white pb-28 font-sans lg:pb-0">
        <Navbar />
        <div className="mx-auto max-w-[1180px] px-4 pt-6 sm:px-6 md:pt-10">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Sk className="h-4 w-16 rounded-full" />
            <Sk className="h-4 w-14 rounded-full" />
            <Sk className="h-4 w-28 rounded-full" />
          </div>

          {/* Title */}
          <header className="mb-8">
            <Sk className="h-3 w-20 rounded-full" />
            <Sk className="mt-4 h-10 w-3/4 max-w-2xl rounded-xl sm:h-12" />
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-4">
                <Sk className="h-4 w-44 rounded-full" />
                <Sk className="h-4 w-24 rounded-full" />
                <Sk className="h-4 w-32 rounded-full" />
              </div>
              <Sk className="h-9 w-24 rounded-full" />
            </div>
          </header>

          {/* Gallery */}
          <Sk className="mb-12 aspect-video w-full rounded-2xl" />

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
            <div className="min-w-0">
              {/* Key facts */}
              <div className="grid grid-cols-2 gap-3 border-b border-lux-line pb-10 sm:grid-cols-3 sm:gap-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className={`rounded-2xl border border-lux-line p-4 sm:p-5 ${i === 2 ? "col-span-2 sm:col-span-1" : ""}`}>
                    <Sk className="h-5 w-5 rounded-md" />
                    <Sk className="mt-3 h-3 w-14 rounded-full" />
                    <Sk className="mt-2 h-5 w-24" />
                  </div>
                ))}
              </div>

              {/* About */}
              <div className="border-b border-lux-line py-10">
                <SectionHeadingSkeleton className="mb-6" />
                <div className="flex flex-col gap-3">
                  {["100%", "96%", "92%", "98%", "70%"].map((w, i) => (
                    <Sk key={i} className="h-4 rounded-full" style={{ width: w }} />
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="py-10">
                <SectionHeadingSkeleton className="mb-6" />
                <MapSkeleton />
              </div>
            </div>

            {/* Booking card */}
            <aside>
              <div className="rounded-3xl border border-lux-line bg-white p-6 shadow-[0_30px_60px_-30px_oklch(0.35_0.065_55/0.4)] sm:p-7">
                <Sk className="h-9 w-36" />
                <div className="mt-5">
                  <div className="mb-2 flex justify-between">
                    <Sk className="h-3 w-28 rounded-full" />
                    <Sk className="h-3 w-14 rounded-full" />
                  </div>
                  <Sk className="h-2 w-full rounded-full" />
                </div>
                <div className="my-6 h-px bg-lux-line" />
                <Sk className="h-3 w-24 rounded-full" />
                <Sk className="mt-3 h-16 w-full rounded-2xl" />
                <Sk className="mt-6 h-14 w-full rounded-full" />
                <Sk className="mt-3 h-12 w-full rounded-full" />
                <div className="mt-6 flex flex-col gap-3 border-t border-lux-line pt-5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <Sk className="h-4 w-4 rounded-full" />
                      <Sk className="h-3.5 w-52 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </LoadingScreen>
  );
}

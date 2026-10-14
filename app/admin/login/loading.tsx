import { LoadingScreen, Sk } from "@/components/skeletons";

export default function Loading() {
  return (
    <LoadingScreen>
      <div className="flex min-h-screen flex-col bg-white font-sans lg:flex-row">
        <aside className="hidden flex-col justify-between bg-brand-brown p-14 lg:flex lg:w-[42%]">
          <Sk className="h-7 w-52 bg-white/10" />
          <div className="flex flex-col gap-4">
            <Sk className="h-4 w-28 rounded-full bg-white/10" />
            <Sk className="h-12 w-4/5 rounded-xl bg-white/10" />
            <Sk className="h-12 w-3/5 rounded-xl bg-white/10" />
            <div className="mt-6 flex flex-col gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Sk className="h-10 w-10 rounded-full bg-white/10" />
                  <Sk className="h-4 w-56 rounded-full bg-white/10" />
                </div>
              ))}
            </div>
          </div>
          <Sk className="h-3 w-36 rounded-full bg-white/10" />
        </aside>
        <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-8">
          <div className="flex w-full max-w-md flex-col items-center gap-4">
            <div className="flex w-full flex-col gap-5 rounded-3xl border border-lux-line p-8 sm:p-10">
              <Sk className="h-14 w-14 rounded-2xl" />
              <Sk className="h-8 w-56 rounded-lg" />
              <Sk className="h-4 w-full rounded-full" />
              <Sk className="mt-3 h-12 w-full rounded-xl" />
              <Sk className="h-12 w-full rounded-xl" />
              <Sk className="mt-2 h-12 w-full rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    </LoadingScreen>
  );
}

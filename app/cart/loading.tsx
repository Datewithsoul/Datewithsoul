import Navbar from "@/components/navbar";
import { FieldSkeleton, FormTitleSkeleton, LoadingScreen, Sk } from "@/components/skeletons";

export default function Loading() {
  return (
    <LoadingScreen>
      <div className="min-h-screen bg-white pb-24 font-sans">
        <Navbar />
        <section className="mx-auto max-w-4xl px-6 pt-12">
          <FormTitleSkeleton />
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div className="h-fit rounded-2xl border border-gray-200 bg-gray-50 p-8">
              <Sk className="mb-6 h-7 w-3/4" />
              <Sk className="h-28 w-full rounded-xl" />
              <div className="mt-6 flex justify-between border-b border-gray-200 pb-3">
                <Sk className="h-4 w-24 rounded-full" />
                <Sk className="h-4 w-16 rounded-full" />
              </div>
              <div className="mt-4 flex justify-between">
                <Sk className="h-6 w-24" />
                <Sk className="h-6 w-20" />
              </div>
            </div>
            <div className="flex flex-col gap-5">
              <Sk className="h-6 w-32" />
              <FieldSkeleton />
              <FieldSkeleton />
              <FieldSkeleton />
              <Sk className="mt-2 h-12 w-full rounded-xl" />
            </div>
          </div>
        </section>
      </div>
    </LoadingScreen>
  );
}

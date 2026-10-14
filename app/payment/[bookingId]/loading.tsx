import Navbar from "@/components/navbar";
import { FieldSkeleton, LoadingScreen, Sk } from "@/components/skeletons";

export default function Loading() {
  return (
    <LoadingScreen label="กำลังโหลดหน้าชำระเงิน">
      <div className="min-h-screen bg-white pb-24 font-sans">
        <Navbar />
        <section className="mx-auto max-w-4xl px-6 pt-12">
          {/* Title + progress */}
          <div className="mb-8 flex flex-col items-center border-b border-gray-200 pb-8">
            <Sk className="h-9 w-40 rounded-lg" />
            <Sk className="mt-3 h-4 w-44 rounded-full" />
            <div className="mt-8 grid w-full max-w-xl grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <Sk className="h-9 w-9 rounded-full" />
                  <Sk className="h-3 w-14 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
            {/* QR */}
            <div className="flex flex-col items-center rounded-2xl border border-gray-200 bg-gray-50 p-8">
              <Sk className="h-14 w-full rounded-xl" />
              <Sk className="mt-6 h-5 w-48 rounded-full" />
              <Sk className="mt-3 h-6 w-20 rounded-md" />
              <Sk className="mt-6 h-64 w-64 rounded-xl" />
              <Sk className="mt-6 h-9 w-32" />
              <Sk className="mt-4 h-20 w-full rounded-lg" />
            </div>

            {/* Summary + upload */}
            <div className="flex flex-col gap-8">
              <div className="rounded-2xl border border-gray-200 p-8">
                <Sk className="h-6 w-32" />
                <div className="mt-5 flex flex-col gap-4">
                  <Sk className="h-4 w-20 rounded-full" />
                  <Sk className="h-5 w-3/4" />
                  <Sk className="h-4 w-24 rounded-full" />
                  <Sk className="h-5 w-1/2" />
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 p-8">
                <Sk className="mb-6 h-6 w-44" />
                <FieldSkeleton />
                <Sk className="mt-4 h-28 w-full rounded-xl" />
                <Sk className="mt-6 h-12 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </LoadingScreen>
  );
}

import { FieldSkeleton, LoadingScreen, Sk } from "@/components/skeletons";

export default function Loading() {
  return (
    <LoadingScreen>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 font-sans">
        <div className="flex w-full max-w-md flex-col gap-5 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
          <Sk className="mx-auto h-16 w-16 rounded-full" />
          <Sk className="mx-auto h-7 w-48" />
          <Sk className="mx-auto h-4 w-64 rounded-full" />
          <FieldSkeleton />
          <FieldSkeleton />
          <Sk className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </LoadingScreen>
  );
}

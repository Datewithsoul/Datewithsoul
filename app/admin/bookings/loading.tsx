import { AdminPageHeader } from "@/components/admin-page-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookingsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <AdminPageHeader
        title="รายการจอง"
        description="ดูสลิปจากลูกค้า ตรวจสอบว่าชำระเงินจริง แล้วยืนยันเป็นชำระเงินแล้ว หรือเปลี่ยนสถานะได้เอง"
      />

      <section className="border border-[#ddd4c8] bg-white shadow-sm">
        <div className="border-b border-[#ddd4c8] px-5 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24 mt-2" />
          </div>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </section>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { updateClass } from "../../actions";
import MediaUploader, { MediaItem } from "@/components/media-uploader";
import { AdminPageHeader } from "@/components/admin-page-header";
import ListRepeater from "../../new/list-repeater";
import ScheduleRepeater from "../../new/schedule-repeater";
import { SubmitButton } from "@/components/submit-button";

export default async function EditClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const classEvent = await prisma.classEvent.findUnique({
    where: { id },
    include: { media: true }
  });

  if (!classEvent) {
    notFound();
  }

  // format date to YYYY-MM-DD for input type="date"
  const formattedDate = classEvent.date.toISOString().split('T')[0];
  
  // cast media to MediaItem[]
  const initialMedia: MediaItem[] = classEvent.media.map(m => ({
    id: m.id,
    url: m.url,
    type: m.type as "IMAGE" | "VIDEO",
    order: m.order,
  }));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-start gap-3">
        <Link href="/admin/classes">
          <Button variant="outline" size="icon" aria-label="กลับไปรายการคอร์ส">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <AdminPageHeader
          className="flex-1"
          title="แก้ไขคอร์สเรียน"
          description={`ปรับปรุงรายละเอียดของ ${classEvent.name}`}
        />
      </div>

      <section className="border border-[#ddd4c8] bg-white">
        <div className="border-b border-[#ddd4c8] px-5 py-4">
          <h2 className="text-base font-semibold text-[#3d3229]">ข้อมูลคอร์ส</h2>
          <p className="mt-1 text-sm text-[#6a5d50]">บันทึกเมื่อแก้ไขครบแล้ว</p>
        </div>
        <div className="px-5 py-5">
          <form action={updateClass} className="flex flex-col gap-6">
            <input type="hidden" name="id" value={classEvent.id} />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium leading-none">ชื่อคอร์ส</label>
                <Input 
                  type="text" 
                  id="name" 
                  name="name" 
                  required
                  defaultValue={classEvent.name}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium leading-none">หมวดหมู่</label>
                <Input 
                  type="text" 
                  id="category" 
                  name="category" 
                  defaultValue={classEvent.category || "เวิร์กชอป"}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium leading-none">รายละเอียด</label>
              <textarea 
                id="description" 
                name="description" 
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue={classEvent.description || ""}
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">รูปภาพและวิดีโอแนะนำ</label>
              <MediaUploader initialMedia={initialMedia} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">รอบเวลาเรียน (วัน/เวลา)</label>
              <ScheduleRepeater 
                initialData={[{
                  date: formattedDate,
                  timeslots: [{ startTime: classEvent.startTime, endTime: classEvent.endTime, totalSeats: classEvent.totalSeats.toString() }]
                }]}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium leading-none">ราคา (บาท)</label>
                <Input 
                  type="number" 
                  id="price" 
                  name="price" 
                  min="0"
                  step="0.01"
                  required
                  defaultValue={classEvent.price}
                />
              </div>
            </div>

            <ListRepeater 
              name="learningOutcomes"
              label="สิ่งที่คุณจะได้เรียนรู้"
              placeholder="เช่น พื้นฐานการเตรียมดินและการนวดดิน"
              defaultItems={classEvent.learningOutcomes.length > 0 ? classEvent.learningOutcomes : ["", "", ""]}
            />

            <ListRepeater 
              name="requirements"
              label="ข้อกำหนดและสิ่งที่ต้องเตรียม"
              placeholder="เช่น ไม่ต้องมีพื้นฐานมาก่อน เหมาะสำหรับมือใหม่"
              defaultItems={classEvent.requirements.length > 0 ? classEvent.requirements : ["", ""]}
            />

            <SubmitButton className="admin-btn-primary mt-2 inline-flex h-9 w-full items-center justify-center text-sm">
              บันทึกการแก้ไข
            </SubmitButton>
          </form>
        </div>
      </section>
    </div>
  );
}

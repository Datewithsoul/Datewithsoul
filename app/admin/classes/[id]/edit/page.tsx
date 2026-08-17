import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { updateClass } from "../../actions";
import MediaUploader, { MediaItem } from "@/components/media-uploader";

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
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/classes">
          <Button variant="outline" size="icon">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">แก้ไขคอร์สเรียน</h1>
          <p className="text-muted-foreground mt-1">
            ปรับปรุงรายละเอียดคอร์สเรียน {classEvent.name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลคอร์สเรียน</CardTitle>
          <CardDescription>อัปเดตข้อมูลให้เป็นปัจจุบัน</CardDescription>
        </CardHeader>
        <CardContent>
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
              <label htmlFor="instructor" className="text-sm font-medium leading-none">ชื่อผู้สอน</label>
              <Input 
                type="text" 
                id="instructor" 
                name="instructor" 
                required
                defaultValue={classEvent.instructor}
              />
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium leading-none">วันที่เริ่มจัดกิจกรรม</label>
                <Input 
                  type="date" 
                  id="date" 
                  name="date" 
                  required
                  defaultValue={formattedDate}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="endDate" className="text-sm font-medium leading-none">วันที่สุดท้าย (ถ้ามีหลายวัน)</label>
                <Input 
                  type="date" 
                  id="endDate" 
                  name="endDate" 
                  defaultValue={classEvent.endDate ? classEvent.endDate.toISOString().split('T')[0] : ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="startTime" className="text-sm font-medium leading-none">เวลาเริ่ม</label>
                <Input 
                  type="time" 
                  id="startTime" 
                  name="startTime" 
                  required
                  defaultValue={classEvent.startTime}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="endTime" className="text-sm font-medium leading-none">เวลาสิ้นสุด</label>
                <Input 
                  type="time" 
                  id="endTime" 
                  name="endTime" 
                  required
                  defaultValue={classEvent.endTime}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <label htmlFor="totalSeats" className="text-sm font-medium leading-none">จำนวนที่นั่ง</label>
                <Input 
                  type="number" 
                  id="totalSeats" 
                  name="totalSeats" 
                  min="1"
                  required
                  defaultValue={classEvent.totalSeats}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="learningOutcomes" className="text-sm font-medium leading-none">สิ่งที่คุณจะได้เรียนรู้ (แยกแต่ละข้อด้วยการขึ้นบรรทัดใหม่)</label>
              <textarea 
                id="learningOutcomes" 
                name="learningOutcomes" 
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                defaultValue={(classEvent.learningOutcomes || []).join("\n")}
              ></textarea>
            </div>

            <div className="space-y-2">
              <label htmlFor="requirements" className="text-sm font-medium leading-none">ข้อกำหนด (แยกแต่ละข้อด้วยการขึ้นบรรทัดใหม่)</label>
              <textarea 
                id="requirements" 
                name="requirements" 
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                defaultValue={(classEvent.requirements || []).join("\n")}
              ></textarea>
            </div>

            <Button type="submit" className="w-full mt-2">
              บันทึกการแก้ไข
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

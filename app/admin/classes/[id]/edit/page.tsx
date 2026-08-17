import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { updateClass } from "../../actions";

export default async function EditClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const classEvent = await prisma.classEvent.findUnique({
    where: { id }
  });

  if (!classEvent) {
    notFound();
  }

  // format date to YYYY-MM-DD for input type="date"
  const formattedDate = classEvent.date.toISOString().split('T')[0];

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
            <input type="hidden" name="existingImageUrl" value={classEvent.imageUrl || ""} />
            <input type="hidden" name="existingVideoUrl" value={classEvent.videoUrl || ""} />

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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="imageFile" className="text-sm font-medium leading-none">รูปภาพหน้าปกใหม่ (ถ้าต้องการเปลี่ยน)</label>
                <Input 
                  type="file" 
                  id="imageFile" 
                  name="imageFile" 
                  accept="image/*"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="videoFile" className="text-sm font-medium leading-none">วิดีโอแนะนำใหม่ (ถ้าต้องการเปลี่ยน)</label>
                <Input 
                  type="file" 
                  id="videoFile" 
                  name="videoFile" 
                  accept="video/*"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium leading-none">วันที่จัดกิจกรรม</label>
              <Input 
                type="date" 
                id="date" 
                name="date" 
                required
                defaultValue={formattedDate}
              />
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

            <Button type="submit" className="w-full mt-2">
              บันทึกการแก้ไข
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

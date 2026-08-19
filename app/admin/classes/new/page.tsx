import { createClass } from "./actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MediaUploader from "@/components/media-uploader";
import { AdminPageHeader } from "@/components/admin-page-header";

export default function NewClassPage() {
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
          title="เพิ่มคอร์สเรียน"
          description="กำหนดรายละเอียดเพื่อเปิดรับจอง"
        />
      </div>

      <section className="border border-[#ddd4c8] bg-white">
        <div className="border-b border-[#ddd4c8] px-5 py-4">
          <h2 className="text-base font-semibold text-[#3d3229]">ข้อมูลคอร์ส</h2>
          <p className="mt-1 text-sm text-[#6a5d50]">กรอกข้อมูลให้ครบก่อนบันทึก</p>
        </div>
        <div className="px-5 py-5">
          <form action={createClass} className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium leading-none">ชื่อคอร์ส</label>
                <Input 
                  type="text" 
                  id="name" 
                  name="name" 
                  required
                  placeholder="เช่น คอร์สปั้นดินเผาสำหรับผู้เริ่มต้น"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium leading-none">หมวดหมู่</label>
                <Input 
                  type="text" 
                  id="category" 
                  name="category" 
                  defaultValue="เวิร์กชอป"
                  placeholder="เช่น เวิร์กชอป, สัมมนา, กิจกรรมพิเศษ"
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
                placeholder="เช่น ครูวิ"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium leading-none">รายละเอียด</label>
              <textarea 
                id="description" 
                name="description" 
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="รายละเอียดสั้นๆ เกี่ยวกับคอร์สนี้..."
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">รูปภาพและวิดีโอแนะนำ</label>
              <MediaUploader />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium leading-none">วันที่เริ่มจัดกิจกรรม</label>
                <Input 
                  type="date" 
                  id="date" 
                  name="date" 
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="endDate" className="text-sm font-medium leading-none">วันที่สุดท้าย (ถ้ามีหลายวัน)</label>
                <Input 
                  type="date" 
                  id="endDate" 
                  name="endDate" 
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
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="endTime" className="text-sm font-medium leading-none">เวลาสิ้นสุด</label>
                <Input 
                  type="time" 
                  id="endTime" 
                  name="endTime" 
                  required
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
                  placeholder="1500"
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
                  placeholder="10"
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
                placeholder="พื้นฐานการเตรียมดินและการนวดดิน&#10;เทคนิคการขึ้นรูปทรงพื้นฐานด้วยมือ (Hand-building)&#10;การสร้างลวดลายและพื้นผิวบนชิ้นงาน"
              ></textarea>
            </div>

            <div className="space-y-2">
              <label htmlFor="requirements" className="text-sm font-medium leading-none">ข้อกำหนด (แยกแต่ละข้อด้วยการขึ้นบรรทัดใหม่)</label>
              <textarea 
                id="requirements" 
                name="requirements" 
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="ไม่ต้องมีพื้นฐานมาก่อน เหมาะสำหรับมือใหม่&#10;เตรียมชุดที่ทะมัดทะแมงและพร้อมเลอะได้"
              ></textarea>
            </div>

            <button type="submit" className="admin-btn-primary mt-2 inline-flex h-9 w-full items-center justify-center text-sm">
              บันทึกคอร์สเรียน
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

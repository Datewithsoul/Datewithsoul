import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AdminPageHeader, AdminPrimaryLink } from "@/components/admin-page-header";
import { CancelClassButton } from "@/components/cancel-class-button";

export default async function AdminClasses() {
  const classes = await prisma.classEvent.findMany({
    orderBy: { date: "desc" },
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <AdminPageHeader
        title="คอร์สเรียน"
        description="สร้าง แก้ไข และลบคอร์สที่เปิดให้จอง"
        action={
          <AdminPrimaryLink href="/admin/classes/new">
            <Plus className="h-4 w-4" /> เพิ่มคอร์สเรียน
          </AdminPrimaryLink>
        }
      />

      <section className="border border-[#ddd4c8] bg-white">
        <div className="border-b border-[#ddd4c8] px-5 py-4">
          <h2 className="text-base font-semibold text-[#3d3229]">รายการทั้งหมด</h2>
          <p className="mt-1 text-sm text-[#6a5d50]">{classes.length.toLocaleString("th-TH")} คอร์ส</p>
        </div>
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-5 text-[#6a5d50]">ชื่อคอร์ส</TableHead>
                <TableHead className="text-[#6a5d50]">วันที่</TableHead>
                <TableHead className="text-[#6a5d50]">เวลา</TableHead>
                <TableHead className="text-[#6a5d50]">ราคา (บาท)</TableHead>
                <TableHead className="text-[#6a5d50]">ที่นั่งว่าง</TableHead>
                <TableHead className="text-[#6a5d50]">สถานะ</TableHead>
                <TableHead className="px-5 text-right text-[#6a5d50]">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="px-5 py-10 text-center text-[#6a5d50]">
                    ยังไม่มีคอร์สเรียน ใช้ปุ่มเพิ่มคอร์สเรียนเพื่อเปิดรอบแรก
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((c) => (
                  <TableRow key={c.id} className="border-[#eee8e0]">
                    <TableCell className="px-5 font-medium text-[#3d3229]">{c.name}</TableCell>
                    <TableCell className="tabular-nums">{c.date.toLocaleDateString("th-TH")}</TableCell>
                    <TableCell className="tabular-nums">{c.startTime} – {c.endTime}</TableCell>
                    <TableCell className="tabular-nums">{c.price.toLocaleString("th-TH")}</TableCell>
                    <TableCell className="tabular-nums">
                      <span className={c.totalSeats <= 3 && c.status === "PUBLISHED" ? "text-[#8f3b2c] font-bold" : ""}>
                        {c.totalSeats}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        c.status === "PUBLISHED" ? "bg-green-100 text-green-800" :
                        c.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                        c.status === "DRAFT" ? "bg-gray-100 text-gray-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {c.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/classes/${c.id}/edit`}>
                          <Button variant="outline" size="sm">แก้ไข</Button>
                        </Link>
                        {c.status !== "CANCELLED" && (
                          <form action={async () => {
                            "use server";
                            const { deleteClass } = await import("./actions");
                            const formData = new FormData();
                            formData.append("id", c.id);
                            await deleteClass(formData);
                          }}>
                            <CancelClassButton />
                          </form>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col gap-4 p-4 bg-[#f4f1ec]">
          {classes.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#6a5d50] bg-white rounded-md border border-[#ddd4c8]">
              ยังไม่มีคอร์สเรียน ใช้ปุ่มเพิ่มคอร์สเรียนเพื่อเปิดรอบแรก
            </div>
          ) : (
            classes.map((c) => (
              <div key={c.id} className="bg-white p-4 rounded-md border border-[#ddd4c8] shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2 border-b border-[#ddd4c8] pb-3">
                  <div className="font-medium text-[#3d3229] text-base">{c.name}</div>
                  <span className={`px-2 py-1 text-xs rounded-full font-semibold shrink-0 ${
                    c.status === "PUBLISHED" ? "bg-green-100 text-green-800" :
                    c.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                    c.status === "DRAFT" ? "bg-gray-100 text-gray-800" :
                    "bg-blue-100 text-blue-800"
                  }`}>
                    {c.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-[#6a5d50]">วันที่:</div>
                  <div className="text-[#3d3229] text-right">{c.date.toLocaleDateString("th-TH")}</div>
                  
                  <div className="text-[#6a5d50]">เวลา:</div>
                  <div className="text-[#3d3229] text-right">{c.startTime} – {c.endTime}</div>
                  
                  <div className="text-[#6a5d50]">ราคา:</div>
                  <div className="font-medium text-[#3d3229] text-right">{c.price.toLocaleString("th-TH")} บาท</div>

                  <div className="text-[#6a5d50]">ที่นั่งว่าง:</div>
                  <div className="text-right">
                    <span className={c.totalSeats <= 3 && c.status === "PUBLISHED" ? "text-[#8f3b2c] font-bold" : "text-[#3d3229]"}>
                      {c.totalSeats}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#ddd4c8] flex justify-end gap-2">
                  <Link href={`/admin/classes/${c.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">แก้ไข</Button>
                  </Link>
                  {c.status !== "CANCELLED" && (
                    <form className="flex-1" action={async () => {
                      "use server";
                      const { deleteClass } = await import("./actions");
                      const formData = new FormData();
                      formData.append("id", c.id);
                      await deleteClass(formData);
                    }}>
                      <div className="w-full">
                        <CancelClassButton className="w-full" />
                      </div>
                    </form>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

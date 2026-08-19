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
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-5 text-[#6a5d50]">ชื่อคอร์ส</TableHead>
              <TableHead className="text-[#6a5d50]">วันที่</TableHead>
              <TableHead className="text-[#6a5d50]">เวลา</TableHead>
              <TableHead className="text-[#6a5d50]">ราคา (บาท)</TableHead>
              <TableHead className="text-[#6a5d50]">ที่นั่ง</TableHead>
              <TableHead className="px-5 text-right text-[#6a5d50]">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {classes.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="px-5 py-10 text-center text-[#6a5d50]">
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
                  <TableCell className="tabular-nums">{c.totalSeats}</TableCell>
                  <TableCell className="px-5 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/classes/${c.id}/edit`}>
                        <Button variant="outline" size="sm">แก้ไข</Button>
                      </Link>
                      <form action={async () => {
                        "use server";
                        const { deleteClass } = await import("./actions");
                        const formData = new FormData();
                        formData.append("id", c.id);
                        await deleteClass(formData);
                      }}>
                        <Button variant="destructive" size="sm" type="submit">ลบ</Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}

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
import { CloseClassButton } from "@/components/close-class-button";

import { SearchBar } from "@/components/search-bar";
import { DataTablePagination } from "@/components/data-table-pagination";

export default async function AdminClasses({ searchParams }: { searchParams: Promise<{ q?: string, page?: string }> }) {
  const { q, page } = await searchParams;
  const currentPage = Number(page) || 1;
  const pageSize = 20;

  const where = q ? {
    name: { contains: q }
  } : {};

  const allClasses = await prisma.classEvent.findMany({
    where,
    orderBy: { date: "desc" },
  });

  const allGroupedClasses = allClasses.reduce((acc: Record<string, typeof allClasses>, c) => {
    if (!acc[c.name]) acc[c.name] = [];
    acc[c.name].push(c);
    return acc;
  }, {});

  const groupedArray = Object.values(allGroupedClasses);
  const totalItems = groupedArray.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedGroups = groupedArray.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
        <div className="border-b border-[#ddd4c8] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-[#3d3229]">รายการทั้งหมด</h2>
            <p className="mt-1 text-sm text-[#6a5d50]">ค้นพบ {totalItems.toLocaleString("th-TH")} คอร์ส</p>
          </div>
          <SearchBar placeholder="ค้นหาชื่อคอร์ส..." />
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
              {paginatedGroups.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="px-5 py-10 text-center text-[#6a5d50]">
                    ยังไม่มีคอร์สเรียน ใช้ปุ่มเพิ่มคอร์สเรียนเพื่อเปิดรอบแรก
                  </TableCell>
                </TableRow>
              ) : (
                paginatedGroups.map((group: any) => {
                  const firstClass = group[0];
                  return (
                  <TableRow key={firstClass.id} className="border-[#eee8e0]">
                    <TableCell className="px-5 font-medium text-[#3d3229]">{firstClass.name}</TableCell>
                    <TableCell className="tabular-nums">
                      {group.length === 1 ? firstClass.date.toLocaleDateString("th-TH") : `มี ${group.length} รอบ (ดูด้านใน)`}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {group.length === 1 ? `${firstClass.startTime} – ${firstClass.endTime}` : "-"}
                    </TableCell>
                    <TableCell className="tabular-nums">{firstClass.price.toLocaleString("th-TH")}</TableCell>
                    <TableCell className="tabular-nums">
                      {group.reduce((acc: number, c: any) => acc + c.totalSeats, 0)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        firstClass.status === "PUBLISHED" ? "bg-green-100 text-green-800" :
                        firstClass.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                        firstClass.status === "DRAFT" ? "bg-gray-100 text-gray-800" :
                        "bg-blue-100 text-blue-800"
                      }`}>
                        {firstClass.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/classes/group-edit/${encodeURIComponent(firstClass.name)}`}>
                          <Button variant="outline" size="sm">แก้ไขกลุ่มนี้</Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                )})
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col gap-4 p-4 bg-[#f4f1ec]">
          {paginatedGroups.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#6a5d50] bg-white rounded-md border border-[#ddd4c8]">
              ยังไม่มีคอร์สเรียน ใช้ปุ่มเพิ่มคอร์สเรียนเพื่อเปิดรอบแรก
            </div>
          ) : (
            paginatedGroups.map((group: any) => {
              const firstClass = group[0];
              return (
              <div key={firstClass.id} className="bg-white p-4 rounded-md border border-[#ddd4c8] shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2 border-b border-[#ddd4c8] pb-3">
                  <div className="font-medium text-[#3d3229] text-base">{firstClass.name}</div>
                  <span className={`px-2 py-1 text-xs rounded-full font-semibold shrink-0 ${
                    firstClass.status === "PUBLISHED" ? "bg-green-100 text-green-800" :
                    firstClass.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                    firstClass.status === "DRAFT" ? "bg-gray-100 text-gray-800" :
                    "bg-blue-100 text-blue-800"
                  }`}>
                    {firstClass.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-[#6a5d50]">จำนวนรอบ:</div>
                  <div className="text-[#3d3229] text-right">{group.length} รอบ</div>
                  
                  <div className="text-[#6a5d50]">ราคา:</div>
                  <div className="font-medium text-[#3d3229] text-right">{firstClass.price.toLocaleString("th-TH")} บาท</div>

                  <div className="text-[#6a5d50]">ที่นั่งว่างรวม:</div>
                  <div className="text-right">
                    <span className="text-[#3d3229]">
                      {group.reduce((acc: number, c: any) => acc + c.totalSeats, 0)}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#ddd4c8] flex flex-wrap justify-end gap-2">
                  <Link href={`/admin/classes/group-edit/${encodeURIComponent(firstClass.name)}`} className="flex-1 min-w-[30%]">
                    <Button variant="outline" size="sm" className="w-full">แก้ไขกลุ่มนี้</Button>
                  </Link>
                </div>
              </div>
            )})
          )}
        </div>
        
        {totalPages > 1 && (
          <div className="border-t border-[#ddd4c8] p-4">
            <DataTablePagination totalPages={totalPages} />
          </div>
        )}
      </section>
    </div>
  );
}

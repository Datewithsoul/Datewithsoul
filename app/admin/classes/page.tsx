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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminClasses() {
  const classes = await prisma.classEvent.findMany({
    orderBy: { date: "desc" },
  });

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">จัดการคอร์สเรียน</h1>
          <p className="text-muted-foreground mt-2">
            ดูและเพิ่มคอร์สเรียนเวิร์กชอปใหม่ๆ
          </p>
        </div>
        <Link href="/admin/classes/new">
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            เพิ่มคอร์สเรียน
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการคอร์สเรียนทั้งหมด</CardTitle>
          <CardDescription>แสดงข้อมูลคอร์สเรียนที่เปิดให้จอง</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อคอร์ส</TableHead>
                <TableHead>วันที่</TableHead>
                <TableHead>เวลา</TableHead>
                <TableHead>ราคา (฿)</TableHead>
                <TableHead>จำนวนที่นั่ง</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    ยังไม่มีคอร์สเรียน กรุณาเพิ่มคอร์สใหม่
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.date.toLocaleDateString('th-TH')}</TableCell>
                    <TableCell>{c.startTime} - {c.endTime}</TableCell>
                    <TableCell>{c.price.toLocaleString()}</TableCell>
                    <TableCell>{c.totalSeats}</TableCell>
                    <TableCell className="text-right">
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
        </CardContent>
      </Card>
    </div>
  );
}

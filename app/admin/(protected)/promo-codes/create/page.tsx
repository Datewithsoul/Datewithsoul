import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreatePromoCodeForm } from "./create-form";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "สร้างโค้ดส่วนลด",
};

export default async function CreatePromoCodePage() {
  const classEvents = await prisma.classEvent.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { date: "asc" }
  });

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">สร้างโค้ดส่วนลด</h1>
        <p className="text-muted-foreground">กำหนดรายละเอียด เงื่อนไข และเวลาของโค้ดส่วนลด</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายละเอียดโค้ด</CardTitle>
          <CardDescription>กรอกข้อมูลเพื่อสร้างโค้ดส่วนลดใหม่</CardDescription>
        </CardHeader>
        <CardContent>
          <CreatePromoCodeForm classEvents={classEvents} />
        </CardContent>
      </Card>
    </div>
  );
}

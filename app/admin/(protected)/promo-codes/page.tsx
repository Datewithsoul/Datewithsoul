import { getPromoCodes, togglePromoCodeStatus, deletePromoCode } from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { PlusCircle, Ticket, Trash2 } from "lucide-react";
import { PromoCodeStatusToggle, DeletePromoButton } from "./client-components";

export const metadata = {
  title: "จัดการโค้ดส่วนลด",
};

export default async function PromoCodesPage() {
  const promoCodes = await getPromoCodes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">โค้ดส่วนลด</h1>
          <p className="text-muted-foreground">จัดการโค้ดโปรโมชั่นและส่วนลดต่างๆ</p>
        </div>
        <Link href="/admin/promo-codes/create">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            สร้างโค้ดส่วนลด
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>รายการโค้ดส่วนลดทั้งหมด</CardTitle>
          <CardDescription>แสดงโค้ดส่วนลดทั้งหมดในระบบ</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>โค้ด</TableHead>
                <TableHead>ส่วนลด</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead>การใช้งาน</TableHead>
                <TableHead>วันหมดอายุ</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    ยังไม่มีโค้ดส่วนลดในระบบ
                  </TableCell>
                </TableRow>
              ) : (
                promoCodes.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                        {promo.code}
                      </div>
                    </TableCell>
                    <TableCell>
                      {promo.discountType === "PERCENTAGE" && `${promo.discountValue}%`}
                      {promo.discountType === "FIXED_AMOUNT" && `฿${promo.discountValue.toLocaleString()}`}
                      {promo.discountType === "FREE" && <Badge variant="secondary">เรียนฟรี</Badge>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={promo.isActive ? "default" : "secondary"}>
                        {promo.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {promo.usedCount} / {promo.maxUses ? promo.maxUses : "ไม่จำกัด"}
                    </TableCell>
                    <TableCell>
                      {promo.endDate 
                        ? format(new Date(promo.endDate), "dd MMM yyyy", { locale: th }) 
                        : "ไม่มีวันหมดอายุ"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <PromoCodeStatusToggle 
                          id={promo.id} 
                          isActive={promo.isActive} 
                        />
                        <DeletePromoButton id={promo.id} />
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

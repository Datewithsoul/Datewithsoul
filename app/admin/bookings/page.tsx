import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminBookings() {
  const bookings = await prisma.booking.findMany({
    include: {
      user: true,
      classEvent: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">จัดการรายการจอง</h1>
        <p className="text-muted-foreground mt-2">
          ตรวจสอบและจัดการรายการจองคอร์สเรียนทั้งหมด
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>รายการจองทั้งหมด</CardTitle>
          <CardDescription>ข้อมูลการจองและสถานะการชำระเงินของลูกค้า</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ลูกค้า</TableHead>
                <TableHead>คอร์สเรียน</TableHead>
                <TableHead className="text-center">ที่นั่ง</TableHead>
                <TableHead className="text-right">ยอดรวม (฿)</TableHead>
                <TableHead>สถานะจอง</TableHead>
                <TableHead>สถานะชำระเงิน</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    ยังไม่มีรายการจอง
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.user.name}</TableCell>
                    <TableCell>
                      <div className="font-medium">{b.classEvent.name}</div>
                      <div className="text-xs text-muted-foreground">{b.classEvent.date.toLocaleDateString('th-TH')}</div>
                    </TableCell>
                    <TableCell className="text-center">{b.seats}</TableCell>
                    <TableCell className="text-right">{b.totalPrice.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        b.status === "CONFIRMED" ? "default" :
                        b.status === "PENDING" ? "secondary" : "destructive"
                      }>
                        {b.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {b.payment ? (
                        <Badge variant={
                          b.payment.status === "VERIFIED" ? "default" :
                          b.payment.status === "REJECTED" ? "destructive" : "outline"
                        }>
                          {b.payment.status}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">ยังไม่ชำระเงิน</span>
                      )}
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

import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminPageHeader } from "@/components/admin-page-header";
import { RoleBadge } from "@/components/admin-status-badge";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <AdminPageHeader
        title="ผู้ใช้งาน"
        description="รายชื่อผู้ใช้ที่สมัครผ่านระบบ"
      />

      <section className="border border-[#ddd4c8] bg-white">
        <div className="border-b border-[#ddd4c8] px-5 py-4">
          <h2 className="text-base font-semibold text-[#3d3229]">รายชื่อทั้งหมด</h2>
          <p className="mt-1 text-sm text-[#6a5d50]">{users.length.toLocaleString("th-TH")} คน</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-5 text-[#6a5d50]">ชื่อ</TableHead>
              <TableHead className="text-[#6a5d50]">อีเมล</TableHead>
              <TableHead className="text-[#6a5d50]">บทบาท</TableHead>
              <TableHead className="px-5 text-[#6a5d50]">วันที่สมัคร</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="px-5 py-10 text-center text-[#6a5d50]">
                  ยังไม่มีผู้ใช้งานในระบบ
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} className="border-[#eee8e0]">
                  <TableCell className="px-5 font-medium text-[#3d3229]">{user.name}</TableCell>
                  <TableCell>{user.email || "—"}</TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell className="px-5 tabular-nums">{new Date(user.createdAt).toLocaleDateString("th-TH")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}

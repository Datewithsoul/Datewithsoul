import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin-page-header";
import { UsersClient } from "./users-table";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string, page?: string, role?: string }> }) {
  const { q, page, role } = await searchParams;
  const currentPage = Number(page) || 1;
  const pageSize = 20;

  const where: any = {};
  
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { phone: { contains: q } },
      { username: { contains: q } }
    ];
  }
  
  if (role && role !== "ALL") {
    where.role = role;
  }

  const [users, totalItems] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where })
  ]);
  
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <AdminPageHeader
        title="ผู้ใช้งาน"
        description="รายชื่อผู้ใช้ที่สมัครผ่านระบบ"
      />

      <section className="border border-[#ddd4c8] bg-white">
        <UsersClient 
          initialUsers={users} 
          totalItems={totalItems} 
          totalPages={totalPages} 
        />
      </section>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin-page-header";
import { UsersClient } from "./users-table";

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
        <UsersClient initialUsers={users} />
      </section>
    </div>
  );
}

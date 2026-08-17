import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
  if (dbUser?.role !== "ADMIN") redirect("/");

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex min-h-screen w-full flex-1 flex-col bg-[#fbf8f2]">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-[#e7dfd2] bg-[#fffdf9]/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1" />
            <div className="hidden h-5 w-px bg-[#e7dfd2] sm:block" />
            <span className="hidden text-sm font-medium text-[#806f5a] sm:block">จัดการระบบ</span>
          </div>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[#68452f] transition-colors hover:bg-[#fff3b5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d19a00]">
            ดูหน้าเว็บไซต์ <ExternalLink className="h-4 w-4" />
          </Link>
        </header>
        <div className="flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </SidebarProvider>
  );
}

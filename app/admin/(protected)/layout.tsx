
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
  
  if (!user) {
    redirect("/admin/login");
  }
  
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  
  if (dbUser?.role !== "ADMIN") {
    redirect("/admin/login?error=Unauthorized");
  }

  return (
    <div data-admin className="flex min-h-screen">
      <SidebarProvider>
        <AppSidebar />
        <main className="flex min-h-screen w-full flex-1 flex-col bg-muted/30">
          <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1 text-foreground" />
              <div className="hidden h-4 w-px bg-border sm:block" />
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-sm font-semibold text-foreground">ระบบจัดการหลังบ้าน</p>
                <p className="truncate text-xs text-muted-foreground">จัดการคลาส การจอง และการชำระเงิน</p>
              </div>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              ดูหน้าเว็บไซต์ <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </header>
          <div className="flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  );
}

"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { BookOpen, Calendar, LayoutDashboard, Users, CreditCard, MessageSquare, BarChart3, CheckSquare, GalleryVerticalEnd } from "lucide-react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar"

const navItems = [
  { title: "ภาพรวม", url: "/admin", icon: LayoutDashboard },
  { title: "รายการจอง", url: "/admin/bookings", icon: BookOpen },
  { title: "ตรวจสอบการชำระเงิน", url: "/admin/payments", icon: CreditCard },
  { title: "คำขอเปลี่ยนรอบ", url: "/admin/requests", icon: MessageSquare },
  { title: "คอร์สและตารางเรียน", url: "/admin/classes", icon: Calendar },
  { title: "เช็คชื่อเข้าเรียน", url: "/admin/attendance", icon: CheckSquare },
  { title: "ลูกค้า", url: "/admin/users", icon: Users },
  { title: "การแจ้งเตือน LINE", url: "/admin/notifications", icon: MessageSquare },
  { title: "รายงาน", url: "/admin/reports", icon: BarChart3 },

]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="/admin" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">Date with Soul Love</span>
                <span className="">ระบบจัดการหลังบ้าน</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>เมนู</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = item.url === "/admin" ? pathname === "/admin" : pathname.startsWith(item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={active}
                      render={<a href={item.url} />}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

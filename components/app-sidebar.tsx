"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { BookOpen, Calendar, LayoutDashboard, Users, CreditCard, MessageSquare, BarChart3, CheckSquare, GalleryVerticalEnd, Ticket } from "lucide-react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar"

const navGroups = [
  {
    label: "จัดการงานประจำวัน",
    items: [
      { title: "ภาพรวม", url: "/admin", icon: LayoutDashboard },
      { title: "รายการจอง", url: "/admin/bookings", icon: BookOpen },
      { title: "ชำระเงิน", url: "/admin/payments", icon: CreditCard },
      { title: "ขอเปลี่ยนรอบ", url: "/admin/requests", icon: MessageSquare },
    ],
  },
  {
    label: "จัดการคลาสเรียน",
    items: [
      { title: "คอร์สเรียน", url: "/admin/classes", icon: Calendar },
      { title: "เช็คชื่อเข้าเรียน", url: "/admin/attendance", icon: CheckSquare },
    ],
  },
  {
    label: "ข้อมูลและการตั้งค่า",
    items: [
      { title: "ลูกค้า", url: "/admin/users", icon: Users },
      { title: "แจ้งเตือน LINE", url: "/admin/notifications", icon: MessageSquare },
      { title: "รายงาน", url: "/admin/reports", icon: BarChart3 },
      { title: "โค้ดส่วนลด", url: "/admin/promo-codes", icon: Ticket },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<a href="/admin" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEnd className="size-4" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-bold">Date with Soul Love</span>
                <span className="text-sidebar-foreground/60">จัดการการจองและคลาสเรียน</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label} className="px-2 py-1.5">
            <SidebarGroupLabel className="h-7 px-2 text-[11px] font-semibold tracking-wide text-sidebar-foreground/55">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = item.url === "/admin" ? pathname === "/admin" : pathname.startsWith(item.url)
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={active}
                        className="h-9 gap-3 px-3"
                        render={<a href={item.url} />}
                      >
                        <item.icon aria-hidden="true" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}


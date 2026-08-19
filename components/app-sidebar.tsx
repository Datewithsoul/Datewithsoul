"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { BookOpen, Calendar, LayoutDashboard, Users } from "lucide-react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar"

const navItems = [
  { title: "ภาพรวม", url: "/admin", icon: LayoutDashboard },
  { title: "คอร์สเรียน", url: "/admin/classes", icon: Calendar },
  { title: "รายการจอง", url: "/admin/bookings", icon: BookOpen },
  { title: "ผู้ใช้งาน", url: "/admin/users", icon: Users },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  return (
    <Sidebar {...props} className="border-r border-[#ddd4c8] bg-[#faf8f5]">
      <SidebarHeader className="h-14 justify-center border-b border-[#ddd4c8] px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#3d3229] text-[11px] font-semibold tracking-wide text-white">
            DS
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#3d3229]">Date with Soul Love</p>
            <p className="text-xs text-[#6a5d50]">ระบบจัดการหลังบ้าน</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-2 py-4">
          <SidebarGroupLabel className="px-3 text-xs font-medium text-[#6a5d50]">เมนู</SidebarGroupLabel>
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
                      className="h-9 rounded-md px-3 text-[#6a5d50] hover:bg-[#ece7e1] hover:text-[#3d3229] data-[active=true]:bg-[#ece7e1] data-[active=true]:font-medium data-[active=true]:text-[#3d3229]"
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

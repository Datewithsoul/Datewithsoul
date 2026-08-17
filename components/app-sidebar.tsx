"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { BookOpen, Calendar, LayoutDashboard, Users, Heart } from "lucide-react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar"

const data = {
  navMain: [
    { title: "ภาพรวม (Dashboard)", url: "/admin", icon: LayoutDashboard },
    { title: "จัดการคอร์สเรียน", url: "/admin/classes", icon: Calendar },
    { title: "รายการจอง (Bookings)", url: "/admin/bookings", icon: BookOpen },
    { title: "จัดการผู้ใช้ (Users)", url: "/admin/users", icon: Users },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  return (
    <Sidebar {...props} className="border-r border-[#e7dfd2] bg-[#fffdf9]">
      <SidebarHeader className="h-auto border-b border-[#e7dfd2] px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#68452f] bg-[#f7d64a] shadow-[3px_3px_0_#68452f]">
            <Heart className="h-5 w-5 text-[#68452f]" fill="currentColor" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a18e75]">Date with</p>
            <h2 className="text-lg font-black tracking-tight text-[#68452f]">Soul Love</h2>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-3 py-5">
          <SidebarGroupLabel className="px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#a18e75]">เมนูหลัก</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} isActive={pathname === item.url} render={<a href={item.url} />} className="h-11 rounded-xl px-3 text-[#806f5a] data-[active=true]:bg-[#fff3b5] data-[active=true]:font-bold data-[active=true]:text-[#68452f] data-[active=true]:shadow-sm hover:bg-[#fcf4e8] hover:text-[#68452f]">
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

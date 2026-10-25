"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Calendar, LayoutDashboard, Users, CreditCard, MessageSquare, BarChart3, CheckSquare, GalleryVerticalEnd, Ticket, Landmark, History, Bell } from "lucide-react"
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar"

/** Work waiting for an admin, shown as a badge on its menu item */
export type AdminPendingCounts = {
  payments: number
  requests: number
}

type NavItem = {
  title: string
  url: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  countKey?: keyof AdminPendingCounts
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "จัดการงานประจำวัน",
    items: [
      { title: "ภาพรวม", url: "/admin", icon: LayoutDashboard },
      { title: "รายการจอง", url: "/admin/bookings", icon: BookOpen },
      { title: "ชำระเงิน", url: "/admin/payments", icon: CreditCard, countKey: "payments" },
      { title: "คำขอจากลูกค้า", url: "/admin/requests", icon: MessageSquare, countKey: "requests" },
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
      { title: "แจ้งเตือน LINE", url: "/admin/notifications", icon: Bell },
      { title: "รายงาน", url: "/admin/reports", icon: BarChart3 },
      { title: "ประวัติตรวจสลิป", url: "/admin/audit-logs", icon: History },
      { title: "โค้ดส่วนลด", url: "/admin/promo-codes", icon: Ticket },
      { title: "บัญชีรับชำระเงิน", url: "/admin/payment-settings", icon: Landmark },
    ],
  },
]

// Beyond this the exact number doesn't change what the admin does next
const MAX_BADGE_COUNT = 99

export function AppSidebar({ counts, ...props }: React.ComponentProps<typeof Sidebar> & { counts?: AdminPendingCounts }) {
  const pathname = usePathname()
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/admin" />}>
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
                  const count = item.countKey ? counts?.[item.countKey] ?? 0 : 0
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={count > 0 ? `${item.title} (${count})` : item.title}
                        isActive={active}
                        className="h-9 gap-3 px-3"
                        render={<Link href={item.url} />}
                      >
                        <item.icon aria-hidden="true" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      {count > 0 ? (
                        <SidebarMenuBadge
                          className="top-2 bg-brand-red text-white peer-hover/menu-button:text-white peer-data-active/menu-button:text-white"
                          aria-label={`${count} รายการรอดำเนินการ`}
                        >
                          {count > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : count}
                        </SidebarMenuBadge>
                      ) : null}
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

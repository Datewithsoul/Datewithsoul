import { AdminPageHeader } from "@/components/admin-page-header";
import { getAllMessageTemplates } from "@/lib/message-templates";
import { TemplateEditor } from "./template-editor";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Bell, History } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminTemplatesPage() {
  const templates = await getAllMessageTemplates();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <AdminPageHeader
          title="จัดการเทมเพลตข้อความ LINE OA"
          description="กำหนดรูปแบบข้อความแจ้งเตือนอัตโนมัติที่ส่งหาลูกค้าและแอดมินทาง LINE Official Account"
        />
        <div className="flex items-center gap-2">
          <Link
            href="/admin/notifications"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#3d3229] bg-white border border-[#ddd4c8] rounded-md hover:bg-[#ece7e1] transition-all"
          >
            <History className="h-3.5 w-3.5" />
            ดูประวัติการส่งแจ้งเตือน
          </Link>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#ddd4c8] gap-4 text-sm">
        <Link
          href="/admin/notifications"
          className="pb-2.5 text-[#6a5d50] hover:text-[#3d3229] flex items-center gap-1.5 transition-colors"
        >
          <History className="h-4 w-4" />
          ประวัติการแจ้งเตือน (Logs)
        </Link>
        <Link
          href="/admin/notifications/templates"
          className="pb-2.5 border-b-2 border-[#3d3229] font-bold text-[#3d3229] flex items-center gap-1.5"
        >
          <MessageSquare className="h-4 w-4 text-[#8a6d1f]" />
          เทมเพลตข้อความ LINE (Message Templates)
        </Link>
      </div>

      <TemplateEditor initialTemplates={templates} />
    </div>
  );
}

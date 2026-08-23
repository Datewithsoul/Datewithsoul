import { AdminPageHeader } from "@/components/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminSettings() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <AdminPageHeader
        title="การตั้งค่า"
        description="จัดการข้อมูลเว็บไซต์และการเชื่อมต่อระบบภายนอก"
      />

      <section className="border border-[#ddd4c8] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#3d3229] mb-4 border-b border-[#ddd4c8] pb-2">ข้อมูลทั่วไป</h2>
        <div className="grid gap-4 max-w-md">
          <div className="grid gap-2">
            <Label htmlFor="shopName">ชื่อร้าน / ธุรกิจ</Label>
            <Input id="shopName" defaultValue="Datewithsoul" className="border-[#ddd4c8]" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contactEmail">อีเมลติดต่อ</Label>
            <Input id="contactEmail" defaultValue="contact@datewithsoul.com" className="border-[#ddd4c8]" />
          </div>
          <Button className="w-fit mt-2 bg-[#3d3229] text-white hover:bg-[#3d3229]/90">
            บันทึกข้อมูล
          </Button>
        </div>
      </section>

      <section className="border border-[#ddd4c8] bg-white p-6">
        <h2 className="text-lg font-semibold text-[#3d3229] mb-4 border-b border-[#ddd4c8] pb-2">LINE Official Account</h2>
        <div className="grid gap-4 max-w-md">
          <div className="grid gap-2">
            <Label htmlFor="lineChannelId">Channel ID</Label>
            <Input id="lineChannelId" defaultValue="**********" type="password" className="border-[#ddd4c8]" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lineChannelSecret">Channel Secret</Label>
            <Input id="lineChannelSecret" defaultValue="**********" type="password" className="border-[#ddd4c8]" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lineAccessToken">Channel Access Token</Label>
            <Input id="lineAccessToken" defaultValue="**********" type="password" className="border-[#ddd4c8]" />
          </div>
          <Button className="w-fit mt-2 bg-[#06C755] text-white hover:bg-[#06C755]/90">
            ตรวจสอบการเชื่อมต่อและบันทึก
          </Button>
        </div>
      </section>
    </div>
  );
}
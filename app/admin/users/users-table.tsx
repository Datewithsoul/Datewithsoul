"use client";

import { useState } from "react";
import { User, Role } from "@/app/generated/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleBadge } from "@/components/admin-status-badge";
import { deleteUser, addUser, editUser } from "./actions";
import { MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface UsersClientProps {
  initialUsers: User[];
}

export function UsersClient({ initialUsers }: UsersClientProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // form states
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("CUSTOMER");
  const [phone, setPhone] = useState("");

  const handleAdd = async () => {
    if (!name) return toast.error("กรุณากรอกชื่อ");
    const res = await addUser({ name, role, phone });
    if (res.success) {
      toast.success("เพิ่มผู้ใช้สำเร็จ");
      setIsAddOpen(false);
      setName("");
      setRole("CUSTOMER");
      setPhone("");
    } else {
      toast.error(res.error || "เกิดข้อผิดพลาด");
    }
  };

  const handleEdit = async () => {
    if (!editingUser) return;
    if (!name) return toast.error("กรุณากรอกชื่อ");
    const res = await editUser(editingUser.id, { name, role, phone });
    if (res.success) {
      toast.success("อัปเดตผู้ใช้สำเร็จ");
      setIsEditOpen(false);
      setEditingUser(null);
    } else {
      toast.error(res.error || "เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?")) return;
    const res = await deleteUser(id);
    if (res.success) {
      toast.success("ลบผู้ใช้สำเร็จ");
    } else {
      toast.error(res.error || "เกิดข้อผิดพลาด");
    }
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setRole(user.role);
    setPhone(user.phone || "");
    setIsEditOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4 border-b border-[#ddd4c8] px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-[#3d3229]">รายชื่อทั้งหมด</h2>
          <p className="mt-1 text-sm text-[#6a5d50]">{initialUsers.length.toLocaleString("th-TH")} คน</p>
        </div>
        <Button onClick={() => {
          setName("");
          setRole("CUSTOMER");
          setPhone("");
          setIsAddOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> เพิ่มผู้ใช้
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-5 text-[#6a5d50]">ชื่อ</TableHead>
            <TableHead className="text-[#6a5d50]">เบอร์โทรศัพท์</TableHead>
            <TableHead className="text-[#6a5d50]">บทบาท</TableHead>
            <TableHead className="px-5 text-[#6a5d50]">วันที่สมัคร</TableHead>
            <TableHead className="px-5 text-right text-[#6a5d50]">จัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialUsers.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={5} className="px-5 py-10 text-center text-[#6a5d50]">
                ยังไม่มีผู้ใช้งานในระบบ
              </TableCell>
            </TableRow>
          ) : (
            initialUsers.map((user) => (
              <TableRow key={user.id} className="border-[#eee8e0]">
                <TableCell className="px-5 font-medium text-[#3d3229]">{user.name}</TableCell>
                <TableCell>{user.phone || "—"}</TableCell>
                <TableCell>
                  <RoleBadge role={user.role} />
                </TableCell>
                <TableCell className="px-5 tabular-nums">{new Date(user.createdAt).toLocaleDateString("th-TH")}</TableCell>
                <TableCell className="px-5 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-[#f7f4ef] h-8 w-8 p-0">
                      <span className="sr-only">เปิดเมนู</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>การกระทำ</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => openEdit(user)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        แก้ไข
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                        <Trash2 className="mr-2 h-4 w-4" />
                        ลบ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มผู้ใช้ใหม่</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลเพื่อเพิ่มผู้ใช้เข้าสู่ระบบ
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                ชื่อ
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                เบอร์โทร
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                บทบาท
              </Label>
              <Select value={role} onValueChange={(v) => v && setRole(v as Role)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="เลือกบทบาท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleAdd}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขผู้ใช้</DialogTitle>
            <DialogDescription>
              แก้ไขข้อมูลหรือระดับสิทธิ์ของผู้ใช้งาน
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                ชื่อ
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">
                เบอร์โทร
              </Label>
              <Input
                id="edit-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                บทบาท
              </Label>
              <Select value={role} onValueChange={(v) => v && setRole(v as Role)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="เลือกบทบาท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>ยกเลิก</Button>
            <Button onClick={handleEdit}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

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
  DropdownMenuGroup,
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

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SearchBar } from "@/components/search-bar";
import { DataTablePagination } from "@/components/data-table-pagination";

interface UsersClientProps {
  initialUsers: User[];
  totalItems: number;
  totalPages: number;
}

export function UsersClient({ initialUsers, totalItems, totalPages }: UsersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const currentRole = searchParams.get("role") || "ALL";
  
  const handleRoleChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "ALL") {
      params.set("role", value);
    } else {
      params.delete("role");
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  // form states
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("CUSTOMER");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const filteredUsers = initialUsers;

  const handleAdd = async () => {
    if (!name) return toast.error("กรุณากรอกชื่อ");
    if (role === "ADMIN" && (!username || !password)) return toast.error("กรุณากรอกชื่อผู้ใช้และรหัสผ่านสำหรับแอดมิน");
    
    const res = await addUser({ name, role, phone, username, password });
    if (res.success) {
      toast.success("เพิ่มผู้ใช้สำเร็จ");
      setIsAddOpen(false);
      setName("");
      setRole("CUSTOMER");
      setPhone("");
      setUsername("");
      setPassword("");
      router.refresh();
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
      router.refresh();
    } else {
      toast.error(res.error || "เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?")) return;
    const res = await deleteUser(id);
    if (res.success) {
      toast.success("ลบผู้ใช้สำเร็จ");
      router.refresh();
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
      <div className="flex flex-col gap-4 border-b border-[#ddd4c8] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-[#3d3229]">รายชื่อทั้งหมด</h2>
          <p className="mt-1 text-sm text-[#6a5d50]">
            ค้นพบ {totalItems.toLocaleString("th-TH")} คน
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchBar placeholder="ค้นหาชื่อ, เบอร์โทร..." />
              <Select value={currentRole} onValueChange={handleRoleChange}>
            <SelectTrigger id="role-filter" className="w-full sm:w-36">
              <SelectValue placeholder="ทุกบทบาท">
                {{ "ALL": "ทั้งหมด", "ADMIN": "Admin", "CUSTOMER": "User" }[currentRole] || "ทุกบทบาท"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">ทั้งหมด</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="CUSTOMER">User</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => {
            setName("");
            setRole("CUSTOMER");
            setPhone("");
            setIsAddOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" /> เพิ่มผู้ใช้
          </Button>
        </div>
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
          {filteredUsers.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={5} className="px-5 py-10 text-center text-[#6a5d50]">
                {initialUsers.length === 0 ? "ยังไม่มีผู้ใช้งานในระบบ" : "ไม่พบผู้ใช้งานตามบทบาทที่เลือก"}
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((user) => (
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
                      <DropdownMenuGroup>
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
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {totalPages > 1 && (
        <div className="border-t border-[#ddd4c8] p-4">
          <DataTablePagination totalPages={totalPages} />
        </div>
      )}

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
              <Label htmlFor="username" className="text-right">
                ชื่อผู้ใช้ (Login)
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="เช่น Datewithsoul"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                รหัสผ่าน
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="รหัสผ่านสำหรับเข้าสู่ระบบ"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                บทบาท
              </Label>
              <Select value={role} onValueChange={(v) => v && setRole(v as Role)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="เลือกบทบาท">
                    {{ "ADMIN": "Admin", "CUSTOMER": "Customer" }[role]}
                  </SelectValue>
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
                  <SelectValue placeholder="เลือกบทบาท">
                    {{ "ADMIN": "Admin", "CUSTOMER": "Customer" }[role]}
                  </SelectValue>
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

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateUserRole(userId: string, role: "ADMIN" | "CUSTOMER") {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update role" };
  }
}

export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete user" };
  }
}

export async function addUser(data: { name: string; role: "ADMIN" | "CUSTOMER"; phone?: string; lineId?: string }) {
  try {
    await prisma.user.create({
      data: {
        name: data.name,
        role: data.role,
        phone: data.phone || null,
        lineId: data.lineId || null,
      },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to add user" };
  }
}

export async function editUser(userId: string, data: { name: string; role: "ADMIN" | "CUSTOMER"; phone?: string }) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        role: data.role,
        phone: data.phone || null,
      },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update user" };
  }
}

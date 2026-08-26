"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";

export async function updateUserRole(userId: string, role: "ADMIN" | "CUSTOMER") {
  await requireAdmin();
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
  await requireAdmin();
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

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function addUser(data: { name: string; role: "ADMIN" | "CUSTOMER"; phone?: string; username?: string; password?: string }) {
  await requireAdmin();
  try {
    let newUserId = undefined;

    // If username and password are provided, we should create a Supabase Auth user
    if (data.username && data.password) {
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SECRET_KEY! || process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const dummyEmail = data.username.includes("@") ? data.username : `${data.username}@admin.local`.toLowerCase();

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: dummyEmail,
        password: data.password,
        email_confirm: true,
        user_metadata: { name: data.name }
      });

      if (authError) {
        console.error("Failed to create Supabase user", authError);
        return { success: false, error: authError.message };
      }

      newUserId = authData.user.id;
    }

    const emailToSave = data.username ? (data.username.includes("@") ? data.username : `${data.username}@admin.local`.toLowerCase()) : null;

    // Check if email already exists in Prisma to prevent unique constraint error
    if (emailToSave) {
      const existingUser = await prisma.user.findUnique({ where: { email: emailToSave } });
      if (existingUser) {
        return { success: false, error: "ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว" };
      }
    }

    if (newUserId) {
      await prisma.user.upsert({
        where: { id: newUserId },
        update: {
          name: data.name,
          role: data.role,
          phone: data.phone || null,
          email: emailToSave,
        },
        create: {
          id: newUserId,
          name: data.name,
          role: data.role,
          phone: data.phone || null,
          email: emailToSave,
        },
      });
    } else {
      await prisma.user.create({
        data: {
          name: data.name,
          role: data.role,
          phone: data.phone || null,
          email: emailToSave,
        },
      });
    }
    
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || "Failed to add user" };
  }
}

export async function editUser(userId: string, data: { name: string; role: "ADMIN" | "CUSTOMER"; phone?: string }) {
  await requireAdmin();
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

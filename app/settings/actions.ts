'use server';

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "กรุณาเข้าสู่ระบบก่อน" };
  }

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;

  if (!name || !phone || !email) {
    return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }

  try {
    // Check if real email is already used by someone else
    const existingEmail = await prisma.user.findFirst({
      where: {
        email: email,
        id: { not: user.id }
      }
    });

    if (existingEmail) {
      return { error: "อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น" };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        phone,
        email,
      }
    });
    
  } catch (error: unknown) {
    console.error("Update profile error:", error);
    return { error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" };
  }

  revalidatePath("/settings");
  revalidatePath("/");
  return { success: "บันทึกข้อมูลเรียบร้อยแล้ว" };
}

export async function deleteAccount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "กรุณาเข้าสู่ระบบก่อน" };
  }

  try {
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );
    
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    
    const randomSuffix = Math.random().toString(36).substring(7);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: `Deleted User ${randomSuffix}`,
        email: `deleted-${randomSuffix}@example.com`,
        phone: null,
        lineId: null,
        image: null,
      }
    });
    
  } catch (error: unknown) {
    console.error("Delete account error:", error);
    return { error: "เกิดข้อผิดพลาดในการลบบัญชี" };
  }

  await supabase.auth.signOut();
  return { success: true };
}

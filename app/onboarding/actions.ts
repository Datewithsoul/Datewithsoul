'use server';

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function submitOnboarding(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;

  if (!name || !phone || !email) {
    return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
  }

  try {
    // Check if real email is already used by someone else in Prisma
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
    
    // Success, redirect to home
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return { error: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง" };
  }

  revalidatePath("/");
  redirect("/");
}

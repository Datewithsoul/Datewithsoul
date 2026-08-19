"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export async function adminLogin(formData: FormData) {
  const emailInput = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  if (!emailInput || !password) {
    redirect("/admin/login?error=" + encodeURIComponent("กรุณากรอกข้อมูลให้ครบถ้วน"));
  }

  // If user entered a username instead of email, convert it to a dummy email for Supabase Auth
  const email = emailInput.includes("@") ? emailInput : `${emailInput}@admin.local`.toLowerCase();

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    // If login fails, check if we need to auto-bootstrap an admin account
    // This allows them to login with a new email/password and it will become the admin
    // ONLY IF there are 0 admins currently in the database.
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    
    if (adminCount === 0) {
      try {
        const supabaseAdmin = createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SECRET_KEY! || process.env.SUPABASE_SERVICE_ROLE_KEY!
        );
        
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { name: 'System Admin' }
        });
        
        if (!createError && newUser.user) {
          // Sync to Prisma DB
          await prisma.user.upsert({
            where: { id: newUser.user.id },
            update: { role: 'ADMIN', name: 'System Admin', email },
            create: { id: newUser.user.id, role: 'ADMIN', name: 'System Admin', email }
          });
          
          // Sign in again with the new credentials
          await supabase.auth.signInWithPassword({ email, password });
          redirect("/admin");
        }
      } catch (e) {
        console.error("Auto-bootstrap admin failed", e);
      }
    }
    
    redirect("/admin/login?error=" + encodeURIComponent("อีเมลหรือรหัสผ่านไม่ถูกต้อง"));
  }

  // Ensure they are actually an admin in the database
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (dbUser?.role !== "ADMIN") {
      await supabase.auth.signOut();
      redirect("/admin/login?error=" + encodeURIComponent("บัญชีนี้ไม่มีสิทธิ์เข้าถึงระบบจัดการ"));
    }
  }

  redirect("/admin");
}

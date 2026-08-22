"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";


export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function loginWithLine() {
  const lineClientId = process.env.LINE_CLIENT_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://datewithsoul.vercel.app";
  const redirectUri = `${siteUrl}/api/auth/line/callback`;
  
  if (!lineClientId) {
    redirect("/login?error=" + encodeURIComponent("LINE_CLIENT_ID is missing in .env.local"));
  }

  const authUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${lineClientId}&redirect_uri=${redirectUri}&state=datewithsoul123&scope=profile openid&bot_prompt=aggressive`;
  
  redirect(authUrl);
}

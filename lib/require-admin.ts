import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

type AdminCheck =
  | { ok: true; admin: NonNullable<Awaited<ReturnType<typeof prisma.user.findUnique>>> }
  | { ok: false; reason: "unauthenticated" | "forbidden" };

/** Admin check without redirecting, for route handlers that answer 401/403 themselves. */
export async function checkAdmin(): Promise<AdminCheck> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, reason: "unauthenticated" };

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (dbUser?.role !== "ADMIN") return { ok: false, reason: "forbidden" };

  return { ok: true, admin: dbUser };
}

export async function requireAdmin() {
  const result = await checkAdmin();
  if (!result.ok) {
    redirect(result.reason === "unauthenticated" ? "/login" : "/");
  }
  return result.admin;
}

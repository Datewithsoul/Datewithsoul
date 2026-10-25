import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

type AdminCheck =
  | { ok: true; admin: NonNullable<Awaited<ReturnType<typeof prisma.user.findUnique>>> }
  | { ok: false; reason: "unauthenticated" | "forbidden" };

/**
 * Admin check without redirecting, for route handlers that answer 401/403 themselves.
 * Cached per request, so the layout and the page share one Supabase + DB lookup.
 */
export const checkAdmin = cache(async (): Promise<AdminCheck> => {
  const supabase = await createClient();
  // getClaims verifies the JWT signature locally when the project uses asymmetric
  // signing keys (no round trip to Supabase Auth), and falls back to the server otherwise
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;

  if (!userId) return { ok: false, reason: "unauthenticated" };

  const dbUser = await prisma.user.findUnique({ where: { id: userId } });
  if (dbUser?.role !== "ADMIN") return { ok: false, reason: "forbidden" };

  return { ok: true, admin: dbUser };
});

export async function requireAdmin() {
  const result = await checkAdmin();
  if (!result.ok) {
    redirect(result.reason === "unauthenticated" ? "/login" : "/");
  }
  return result.admin;
}

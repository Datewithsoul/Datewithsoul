import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import NavbarClient from "./navbar-client";

export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let dbUser = null;
  let isAdmin = false;

  if (user) {
    dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (dbUser?.role === "ADMIN") {
      isAdmin = true;
    }
  }

  return <NavbarClient user={dbUser} isAdmin={isAdmin} />;
}

import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Heart } from "lucide-react";
import UserMenu from "./user-menu";

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let dbUser = null;
  let isAdmin = false;

  if (user) {
    dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (dbUser?.role === "ADMIN") {
      isAdmin = true;
    }
  }

  return (
    <header className="border-b border-gray-200 bg-white py-4 px-6 sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="text-[#F44336]" size={28} fill="currentColor" />
          <span className="text-xl font-bold tracking-tight text-[#F44336]">
            Date With Soul
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/classes" className="text-sm font-semibold text-gray-700 hover:text-black transition-colors">
            คลาสเรียน
          </Link>
          <UserMenu user={dbUser} isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  );
}

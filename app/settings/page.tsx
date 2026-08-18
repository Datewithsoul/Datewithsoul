import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import SettingsForm from "./settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });

  if (!dbUser) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans">
      <Navbar />
      
      <main className="max-w-[800px] mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">ตั้งค่าผู้ใช้</h1>
        
        <SettingsForm 
          initialName={dbUser.name}
          initialPhone={dbUser.phone || ""}
          initialEmail={dbUser.email || ""}
          role={dbUser.role}
          image={dbUser.image}
        />
      </main>
    </div>
  );
}

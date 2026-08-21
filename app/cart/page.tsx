import { createClient } from "@/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/navbar";
import CheckoutClient from "./checkout-client";

export default async function CartPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  let dbUser = null;
  if (authUser) {
    dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
    });
  }

  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans pb-24">
      <Navbar />

      <section className="pt-12 px-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-8 border-b border-gray-200 pb-4">
          ดำเนินการชำระเงิน (ตะกร้าสินค้า)
        </h1>
        
        <CheckoutClient 
          user={dbUser} 
          authUserEmail={authUser?.email}
        />
      </section>
    </div>
  );
}

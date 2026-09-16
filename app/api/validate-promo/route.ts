import { NextResponse } from "next/server";
import { validatePromoCode } from "@/app/cart/actions";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนใช้โค้ดส่วนลด" }, { status: 401 });
    }

    const { code, classEventIds } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "กรุณาระบุรหัสส่วนลด" });
    }

    const result = await validatePromoCode(code, user.id, classEventIds || []);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API Validate Promo Error:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการตรวจสอบรหัสส่วนลด" }, { status: 500 });
  }
}

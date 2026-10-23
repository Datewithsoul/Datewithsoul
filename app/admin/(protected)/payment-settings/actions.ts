"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { uploadMedia } from "@/utils/supabase/storage";
import { ensurePaymentSettingTable, getPaymentSettings, PAYMENT_SETTING_ID } from "@/lib/payment-settings";

const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB;
const MAX_QR_MB = 3;
const MAX_QR_BYTES = MAX_QR_MB * BYTES_PER_MB;
// Digits and dashes only: matches "123-4-56789-0", rejects "123 456" or "abc"
// https://regex101.com/?regex=%5E%5B0-9-%5D%2B%24&testString=123-4-56789-0
const ACCOUNT_NUMBER_PATTERN = /^[0-9-]+$/;

export async function savePaymentSettings(formData: FormData) {
  await requireAdmin();

  const bankName = String(formData.get("bankName") ?? "").trim();
  const accountName = String(formData.get("accountName") ?? "").trim();
  const accountNumber = String(formData.get("accountNumber") ?? "").trim();
  const removeQr = formData.get("removeQr") === "true";
  const qrFile = formData.get("qrImage");

  if (!bankName || !accountName || !accountNumber) {
    return { success: false, error: "กรุณากรอกชื่อธนาคาร ชื่อบัญชี และเลขที่บัญชีให้ครบถ้วน" };
  }
  if (!ACCOUNT_NUMBER_PATTERN.test(accountNumber)) {
    return { success: false, error: "เลขที่บัญชีต้องเป็นตัวเลขเท่านั้น (ใส่ขีด - ได้)" };
  }

  let qrImageUrl = removeQr ? null : (await getPaymentSettings()).qrImageUrl;

  if (qrFile instanceof File && qrFile.size > 0) {
    if (!qrFile.type.startsWith("image/")) {
      return { success: false, error: "ไฟล์ QR Code ต้องเป็นรูปภาพ" };
    }
    if (qrFile.size > MAX_QR_BYTES) {
      return { success: false, error: `รูป QR Code ต้องมีขนาดไม่เกิน ${MAX_QR_MB}MB` };
    }
    const ext = qrFile.name.split(".").pop() || "png";
    const uploaded = await uploadMedia(qrFile, `payment/qr-${Date.now()}.${ext}`);
    if (!uploaded) {
      return { success: false, error: "อัปโหลดรูป QR Code ไม่สำเร็จ กรุณาลองใหม่" };
    }
    qrImageUrl = uploaded;
  }

  await ensurePaymentSettingTable();

  try {
    const data = { bankName, accountName, accountNumber, qrImageUrl };
    await prisma.paymentSetting.upsert({
      where: { id: PAYMENT_SETTING_ID },
      create: { id: PAYMENT_SETTING_ID, ...data },
      update: data,
    });

    revalidatePath("/admin/payment-settings");
    revalidatePath("/payment", "layout");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error saving payment settings:", error);
    return { success: false, error: (error instanceof Error && error.message) || "เกิดข้อผิดพลาดในการบันทึก" };
  }
}

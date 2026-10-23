import { prisma } from "@/lib/prisma";

export const PAYMENT_SETTING_ID = "default";

export type PaymentSettings = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  qrImageUrl: string | null;
};

// Shown until an admin saves the payment settings for the first time
export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  bankName: "",
  accountName: "น.ส. ธนธรณ์ วณิชเพิ่มทรัพย์",
  accountNumber: "",
  qrImageUrl: "/qrcode.jpg",
};

/**
 * Ensure table exists in database safely.
 */
let isTableChecked = false;
export async function ensurePaymentSettingTable() {
  if (isTableChecked) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PaymentSetting" (
        "id" TEXT NOT NULL DEFAULT 'default',
        "bankName" TEXT NOT NULL,
        "accountName" TEXT NOT NULL,
        "accountNumber" TEXT NOT NULL,
        "qrImageUrl" TEXT,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PaymentSetting_pkey" PRIMARY KEY ("id")
      );
    `);
    isTableChecked = true;
  } catch (error) {
    console.warn("Could not ensure PaymentSetting table:", error);
  }
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  await ensurePaymentSettingTable();
  try {
    const setting = await prisma.paymentSetting.findUnique({ where: { id: PAYMENT_SETTING_ID } });
    if (setting) {
      return {
        bankName: setting.bankName,
        accountName: setting.accountName,
        accountNumber: setting.accountNumber,
        qrImageUrl: setting.qrImageUrl,
      };
    }
  } catch (error) {
    console.warn("Error loading PaymentSetting from DB:", error);
  }
  return DEFAULT_PAYMENT_SETTINGS;
}

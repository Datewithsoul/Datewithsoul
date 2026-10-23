import { AdminPageHeader } from "@/components/admin-page-header";
import { requireAdmin } from "@/lib/require-admin";
import { getPaymentSettings } from "@/lib/payment-settings";
import { PaymentSettingsForm } from "./settings-form";

export const metadata = {
  title: "บัญชีรับชำระเงิน",
};

export default async function PaymentSettingsPage() {
  await requireAdmin();
  const settings = await getPaymentSettings();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <AdminPageHeader
        title="บัญชีรับชำระเงิน"
        description="บัญชีที่ลูกค้าใช้โอนเงินในหน้าชำระเงิน แก้ไขแล้วมีผลทันที"
      />
      <PaymentSettingsForm settings={settings} />
    </div>
  );
}

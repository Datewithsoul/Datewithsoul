"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { ImagePlus, Loader2, QrCode, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BankAccountDetails, PaymentQr } from "@/components/payment-account-details";
import type { PaymentSettings } from "@/lib/payment-settings";
import { cn } from "@/lib/utils";
import { savePaymentSettings } from "./actions";

const THAI_BANKS = [
  "ธนาคารกสิกรไทย",
  "ธนาคารกรุงเทพ",
  "ธนาคารกรุงไทย",
  "ธนาคารไทยพาณิชย์",
  "ธนาคารกรุงศรีอยุธยา",
  "ธนาคารทหารไทยธนชาต (ttb)",
  "ธนาคารออมสิน",
  "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (ธ.ก.ส.)",
  "ธนาคารอาคารสงเคราะห์",
  "ธนาคารยูโอบี",
  "ธนาคารซีไอเอ็มบี ไทย",
  "ธนาคารเกียรตินาคินภัทร",
  "ธนาคารแลนด์ แอนด์ เฮ้าส์",
];

const BYTES_PER_KB = 1024;
const MAX_QR_MB = 3;
const MAX_QR_BYTES = MAX_QR_MB * BYTES_PER_KB * BYTES_PER_KB;
const PREVIEW_AMOUNT = 1500;

type Fields = Pick<PaymentSettings, "bankName" | "accountName" | "accountNumber">;

const fieldsOf = (settings: PaymentSettings): Fields => ({
  bankName: settings.bankName,
  accountName: settings.accountName,
  accountNumber: settings.accountNumber,
});

const sameFields = (a: Fields, b: Fields) =>
  a.bankName === b.bankName && a.accountName === b.accountName && a.accountNumber === b.accountNumber;

export function PaymentSettingsForm({ settings }: { settings: PaymentSettings }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<Fields>(() => fieldsOf(settings));
  const [fields, setFields] = useState<Fields>(() => fieldsOf(settings));
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [removeQr, setRemoveQr] = useState(false);

  const previewUrl = useMemo(() => (qrFile ? URL.createObjectURL(qrFile) : null), [qrFile]);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const shownQr = previewUrl ?? (removeQr ? null : settings.qrImageUrl);
  const isDirty = !sameFields(fields, saved) || qrFile !== null || removeQr;

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    maxSize: MAX_QR_BYTES,
    noClick: Boolean(shownQr),
    onDropAccepted: ([file]) => {
      setQrFile(file);
      setRemoveQr(false);
    },
    onDropRejected: () => toast.error(`กรุณาเลือกไฟล์รูปภาพขนาดไม่เกิน ${MAX_QR_MB}MB`),
  });

  const setField = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((prev) => ({ ...prev, [key]: e.target.value }));

  const resetChanges = () => {
    setFields(saved);
    setQrFile(null);
    setRemoveQr(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set("bankName", fields.bankName);
    formData.set("accountName", fields.accountName);
    formData.set("accountNumber", fields.accountNumber);
    if (qrFile) formData.set("qrImage", qrFile);
    formData.set("removeQr", String(removeQr && !qrFile));

    setLoading(true);
    const res = await savePaymentSettings(formData);
    setLoading(false);

    if (!res.success) {
      toast.error(res.error);
      return;
    }
    toast.success("บันทึกแล้ว ลูกค้าจะเห็นข้อมูลใหม่ทันที");
    setSaved(fields);
    setQrFile(null);
    setRemoveQr(false);
    router.refresh();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <form onSubmit={handleSubmit} className="rounded-lg border border-[var(--admin-line)] bg-white">
        <section className="space-y-4 p-5 sm:p-6">
          <div>
            <h2 className="text-base font-semibold">บัญชีธนาคาร</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">ต้องกรอกครบทั้ง 3 ช่อง</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bankName">ธนาคาร</Label>
            <Input
              id="bankName"
              list="thai-banks"
              placeholder="พิมพ์หรือเลือกธนาคาร"
              value={fields.bankName}
              onChange={setField("bankName")}
              autoComplete="off"
              required
            />
            <datalist id="thai-banks">
              {THAI_BANKS.map((bank) => (
                <option key={bank} value={bank} />
              ))}
            </datalist>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="accountName">ชื่อบัญชี</Label>
              <Input
                id="accountName"
                placeholder="ชื่อ-นามสกุลเจ้าของบัญชี"
                value={fields.accountName}
                onChange={setField("accountName")}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="accountNumber">เลขที่บัญชี</Label>
              <Input
                id="accountNumber"
                placeholder="123-4-56789-0"
                inputMode="numeric"
                pattern="[0-9-]+"
                title="ตัวเลขและขีด (-) เท่านั้น"
                className="tabular-nums"
                value={fields.accountNumber}
                onChange={setField("accountNumber")}
                required
              />
              <p className="text-xs text-muted-foreground">ใส่ขีดได้ ปุ่มคัดลอกของลูกค้าจะตัดขีดออกให้</p>
            </div>
          </div>
        </section>

        <section className="space-y-3 border-t border-[var(--admin-line)] p-5 sm:p-6">
          <div>
            <h2 className="text-base font-semibold">
              QR Code พร้อมเพย์ <span className="font-normal text-muted-foreground">(ไม่บังคับ)</span>
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">ถ้าไม่ใส่ หน้าชำระเงินจะแสดงเฉพาะบัญชีธนาคาร</p>
          </div>

          <div
            {...getRootProps()}
            className={cn(
              "rounded-lg border border-dashed border-[var(--admin-line)] transition-colors",
              isDragActive && "border-[var(--admin-gold)] bg-[#fbf6e9]",
              !shownQr && "cursor-pointer hover:bg-muted/40"
            )}
          >
            <input {...getInputProps()} />
            {shownQr ? (
              <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <img src={shownQr} alt="QR Code" className="h-36 w-36 shrink-0 rounded-md border bg-white object-contain p-2" />
                <div className="space-y-2">
                  {qrFile ? <p className="text-sm text-muted-foreground">รูปใหม่ จะใช้หลังกดบันทึก</p> : null}
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={open}>
                      <RefreshCw className="h-4 w-4" /> เปลี่ยนรูป
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-[var(--admin-danger)]"
                      onClick={() => {
                        setQrFile(null);
                        setRemoveQr(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" /> ลบรูป
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <ImagePlus className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm font-medium">{isDragActive ? "วางรูปที่นี่" : "ลากรูปมาวาง หรือคลิกเพื่อเลือกไฟล์"}</p>
                <p className="text-xs text-muted-foreground">PNG หรือ JPG ไม่เกิน {MAX_QR_MB}MB</p>
              </div>
            )}
          </div>
        </section>

        <div className="sticky bottom-0 flex flex-col-reverse gap-3 rounded-b-lg border-t border-[var(--admin-line)] bg-white/95 px-5 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className={cn("text-sm", isDirty ? "text-[var(--admin-gold)]" : "text-muted-foreground")}>
            {isDirty ? "มีการแก้ไขที่ยังไม่ได้บันทึก" : "บันทึกล่าสุดแล้ว"}
          </p>
          <div className="flex gap-2">
            {isDirty ? (
              <Button type="button" variant="ghost" onClick={resetChanges} disabled={loading}>
                ยกเลิก
              </Button>
            ) : null}
            <button type="submit" disabled={loading || !isDirty} className="admin-btn-primary inline-flex h-9 items-center gap-2 px-4 text-sm disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              บันทึก
            </button>
          </div>
        </div>
      </form>

      <aside className="lg:sticky lg:top-6">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--admin-gold)]">
          <QrCode className="h-3.5 w-3.5" aria-hidden="true" /> ตัวอย่างที่ลูกค้าเห็น
        </p>
        <div className="rounded-lg border border-[var(--admin-line)] bg-gray-50 p-5">
          <PaymentQr qrImageUrl={shownQr} />
          <p className="mb-4 text-center text-2xl font-bold text-[#F44336]">฿{PREVIEW_AMOUNT.toLocaleString()}</p>
          <BankAccountDetails
            settings={{
              bankName: fields.bankName || "ชื่อธนาคาร",
              accountName: fields.accountName || "ชื่อบัญชี",
              accountNumber: fields.accountNumber || "000-0-00000-0",
              qrImageUrl: shownQr,
            }}
          />
        </div>
      </aside>
    </div>
  );
}

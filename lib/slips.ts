import { createAdminClient } from "@/utils/supabase/admin";

// Private bucket: slips contain bank/account details, so they are only served
// through short-lived signed URLs from /api/slips/[paymentId]
export const SLIP_BUCKET = "payment-slips";

let bucketReady: Promise<void> | null = null;

function ensureSlipBucket() {
  bucketReady ??= (async () => {
    const supabase = createAdminClient();
    const { data } = await supabase.storage.getBucket(SLIP_BUCKET);
    if (data) return;
    const { error } = await supabase.storage.createBucket(SLIP_BUCKET, { public: false });
    if (error && !/already exists/i.test(error.message)) throw error;
  })().catch((error) => {
    bucketReady = null;
    throw error;
  });
  return bucketReady;
}

/**
 * Uploads a slip to the private bucket.
 * Returns the stored reference ("<bucket>/<path>") to save in Payment.slipUrl.
 */
export async function uploadPaymentSlip(file: File, fileName: string): Promise<string | null> {
  await ensureSlipBucket();
  const supabase = createAdminClient();
  const path = `slips/${fileName}`;

  const { error } = await supabase.storage
    .from(SLIP_BUCKET)
    .upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Slip upload error:", error);
    return null;
  }
  return `${SLIP_BUCKET}/${path}`;
}

/**
 * Resolves a stored slip reference to its bucket and path. Handles both the
 * current "<bucket>/<path>" format and legacy public URLs in class-media.
 */
export function parseSlipRef(ref: string): { bucket: string; path: string } | null {
  const legacy = ref.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/([^?]+)/);
  if (legacy) return { bucket: legacy[1], path: decodeURIComponent(legacy[2]) };
  if (/^https?:\/\//.test(ref)) return null;

  const slash = ref.indexOf("/");
  if (slash <= 0) return null;
  return { bucket: ref.slice(0, slash), path: ref.slice(slash + 1) };
}

export async function removeSlip(ref: string) {
  const parsed = parseSlipRef(ref);
  if (!parsed) return { error: null };
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(parsed.bucket).remove([parsed.path]);
  return { error };
}

export async function createSlipSignedUrl(ref: string, expiresInSeconds = 300) {
  const parsed = parseSlipRef(ref);
  if (!parsed) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from(parsed.bucket)
    .createSignedUrl(parsed.path, expiresInSeconds);
  if (error) {
    console.error("Slip signed URL error:", error);
    return null;
  }
  return data.signedUrl;
}

/** URL the browser should use to display a payment's slip (access-checked route). */
export function slipViewUrl(payment: { id: string; slipUrl: string | null } | null | undefined) {
  return payment?.slipUrl ? `/api/slips/${payment.id}` : null;
}

/** Replaces raw storage references with the access-checked view URL before sending to the client. */
export function maskSlipUrl(payment: { id: string; slipUrl: string | null } | null | undefined) {
  if (payment?.slipUrl) payment.slipUrl = slipViewUrl(payment);
}

import { createAdminClient } from "./admin";

export async function uploadMedia(file: File, path: string): Promise<string | null> {
  const supabase = createAdminClient();

  const buffer = Buffer.from(await file.arrayBuffer());

  const { data, error } = await supabase.storage
    .from("class-media")
    .upload(path, buffer, {
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    console.error("Storage upload error:", error);
    return null;
  }

  const { data: publicUrlData } = supabase.storage
    .from("class-media")
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

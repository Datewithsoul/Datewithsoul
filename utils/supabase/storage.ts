import { createClient } from "./server";

export async function uploadMedia(file: File, path: string): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from("class-media")
    .upload(path, file, {
      upsert: true,
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

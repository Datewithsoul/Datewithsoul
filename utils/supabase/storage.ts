import { createClient } from "@supabase/supabase-js";

export async function uploadMedia(file: File, path: string): Promise<string | null> {
  const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

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

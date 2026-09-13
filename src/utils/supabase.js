import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

const BUCKET = "storage-bucket";

export async function uploadPdf(file, onProgress) {
  const ext = file.name.split(".").pop() || "pdf";
  const path = `majalah/${crypto.randomUUID()}.${ext}`;

  if (onProgress) onProgress({ phase: "upload", current: 0, total: 1 });

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: "application/pdf", upsert: false });

  if (error) throw new Error(`Gagal upload: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deletePdf(url) {
  const path = url.split(`/${BUCKET}/`)[1];
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
}

import { promises as fs } from "node:fs";
import path from "node:path";
import { getSupabaseAdmin, supabaseConfigured } from "./supabase";

/**
 * Image uploads for portfolio items.
 *
 * With Supabase configured, files go to the public `portfolio` storage bucket
 * (see supabase/schema.sql) and the returned public URL is saved on the item.
 * Without it (local development), files are written to public/uploads so the
 * admin flow is testable offline.
 */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB, matches the bucket limit

const ALLOWED = [
  { mime: "image/jpeg", ext: "jpg" },
  { mime: "image/png", ext: "png" },
  { mime: "image/webp", ext: "webp" },
] as const;

export type UploadResult = { url: string; storage: "supabase" | "files" };

export function uploadValidationError(file: File | null): string | null {
  if (!file || typeof file === "string" || file.size === 0) {
    return "Choose an image file to upload.";
  }
  if (!ALLOWED.some((entry) => entry.mime === file.type)) {
    return "Upload a JPEG, PNG, or WebP image.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return "That image is larger than 5 MB. Compress it and try again.";
  }
  return null;
}

function safeBaseName(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "flyer";
}

export async function uploadPortfolioImage(file: File): Promise<UploadResult> {
  const extension = ALLOWED.find((entry) => entry.mime === file.type)?.ext ?? "jpg";
  const filename = `${safeBaseName(file.name)}-${Date.now().toString(36)}.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  if (supabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage
      .from("portfolio")
      .upload(filename, bytes, { contentType: file.type, upsert: false });
    if (error) throw new Error(`Upload failed: ${error.message}`);

    const { data } = supabase.storage.from("portfolio").getPublicUrl(filename);
    return { url: data.publicUrl, storage: "supabase" };
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), bytes);
  return { url: `/uploads/${filename}`, storage: "files" };
}

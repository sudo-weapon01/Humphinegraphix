"use client";

import { useId, useRef, useState } from "react";

/**
 * Uploads one flyer image and hands the resulting URL back to the editor.
 *
 * The file goes to Supabase Storage in production (or /public/uploads locally);
 * either way the saved value is just a URL in the content document, so nothing
 * else in the publish pipeline needs to change.
 */
export function ImageUpload({
  onUploaded,
  label = "Upload image",
}: {
  onUploaded: (url: string) => void;
  label?: string;
}) {
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body: form });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; url?: string; message?: string }
        | null;

      if (!response.ok || !payload?.ok || !payload.url) {
        setError(payload?.message ?? "The upload failed. Please try again.");
        return;
      }
      setDone(payload.url);
      onUploaded(payload.url);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label
        htmlFor={inputId}
        className="inline-flex cursor-pointer items-center gap-2 rounded-none border border-brand-line bg-brand-paper-deep px-3 py-2 text-[0.75rem] font-semibold text-brand-primary hover:bg-brand-line"
      >
        {busy ? "Uploading…" : label}
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />
      </label>
      <p className="mt-1 text-[0.68rem] text-brand-muted">JPEG, PNG, or WebP · up to 5 MB.</p>
      <div aria-live="polite">
        {error ? <p className="mt-1 text-[0.72rem] font-medium text-[#b3261e]">{error}</p> : null}
        {done ? (
          <p className="mt-1 break-all text-[0.68rem] text-emerald-800">
            Uploaded — the image URL is filled in below.
          </p>
        ) : null}
      </div>
    </div>
  );
}

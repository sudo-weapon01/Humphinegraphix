"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { PublishStatus } from "@/lib/content/types";

function formatDate(value: string | null): string {
  if (!value) return "never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "never";
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PublishBar({ status }: { status: PublishStatus }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"publish" | "discard" | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const pending = status.hasUnpublishedChanges;

  async function call(action: "publish" | "discard") {
    if (action === "discard" && !window.confirm("Discard all unpublished draft changes?")) return;
    setBusy(action);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/${action}`, { method: "POST" });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string }
        | null;

      if (!response.ok || !payload?.ok) {
        setMessage({
          tone: "error",
          text: payload?.message ?? "That didn't work. Please try again.",
        });
        return;
      }

      setMessage({
        tone: "success",
        text:
          action === "publish"
            ? "Published — the public site now shows these changes."
            : "Draft changes discarded.",
      });
      router.refresh();
    } catch {
      setMessage({ tone: "error", text: "Could not reach the server. Please try again." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div
      className={`border-b ${
        pending ? "border-brand-accent/30 bg-brand-accent-soft/60" : "border-brand-line bg-brand-surface/60"
      }`}
    >
      <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${pending ? "bg-brand-accent" : "bg-emerald-600"}`}
          />
          <p className="text-[0.82rem] text-brand-primary" aria-live="polite">
            {pending ? (
              <>
                Unpublished changes in{" "}
                <strong>{status.hasUnpublishedChanges.join(", ")}</strong>
              </>
            ) : (
              "All content is published"
            )}
            <span className="text-brand-muted"> · last published {formatDate(status.publishedAt)}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="md"
            onClick={() => void call("publish")}
            disabled={busy !== null || !pending}
          >
            {busy === "publish" ? "Publishing…" : "Publish changes"}
          </Button>
          <button
            type="button"
            onClick={() => void call("discard")}
            disabled={busy !== null || !pending}
            className="rounded-none px-3 py-2 text-[0.78rem] font-semibold text-brand-muted underline decoration-brand-line underline-offset-4 hover:text-brand-primary disabled:opacity-40"
          >
            {busy === "discard" ? "Discarding…" : "Discard drafts"}
          </button>
        </div>
      </div>

      {message ? (
        <div className="container-page pb-3">
          <p
            role={message.tone === "error" ? "alert" : "status"}
            className={`rounded-none px-3 py-2 text-[0.78rem] ${
              message.tone === "error"
                ? "border border-[#b3261e]/30 bg-[#fbeceb] text-[#8c1d18]"
                : "border border-emerald-700/25 bg-emerald-50 text-emerald-900"
            }`}
          >
            {message.text}
          </p>
        </div>
      ) : null}
    </div>
  );
}

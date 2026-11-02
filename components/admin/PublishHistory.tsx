"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type HistoryEntry = {
  id: string;
  publishedAt: string;
  publishedBy: string | null;
  note: string | null;
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Publish history with rollback.
 *
 * Every publish snapshots what went live. Restoring copies a snapshot back into
 * the published slot and revalidates the public site, so a bad edit can be undone
 * without a redeploy.
 */
export function PublishHistory() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/rollback", { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; history?: HistoryEntry[]; message?: string }
        | null;
      if (!response.ok || !payload?.ok) {
        setEntries([]);
        setMessage({ tone: "error", text: payload?.message ?? "Could not load the history." });
        return;
      }
      setEntries(payload.history ?? []);
    } catch {
      setEntries([]);
      setMessage({ tone: "error", text: "Could not reach the server." });
    }
  }, []);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  async function restore(id: string, when: string) {
    if (!window.confirm(`Restore the version published ${formatDate(when)}? The live site will change immediately.`)) {
      return;
    }
    setBusyId(id);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string }
        | null;
      if (!response.ok || !payload?.ok) {
        setMessage({ tone: "error", text: payload?.message ?? "Could not restore that version." });
        return;
      }
      setMessage({ tone: "success", text: "Restored. The public site now shows that version." });
      await load();
      router.refresh();
    } catch {
      setMessage({ tone: "error", text: "Could not reach the server." });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="container-page pb-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="publish-history"
        className="text-[0.75rem] font-semibold text-brand-primary underline decoration-brand-line underline-offset-4 hover:text-brand-accent-strong"
      >
        {open ? "Hide publish history" : "Publish history & rollback"}
      </button>

      {open ? (
        <div id="publish-history" className="mt-3 rounded-none border border-brand-line bg-brand-surface p-4">
          {entries === null ? (
            <p className="text-[0.78rem] text-brand-muted">Loading…</p>
          ) : entries.length === 0 ? (
            <p className="text-[0.78rem] text-brand-muted">
              No earlier versions yet. Each publish creates one.
            </p>
          ) : (
            <ul className="divide-y divide-brand-line">
              {entries.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <div>
                    <p className="text-[0.8rem] font-semibold text-brand-primary">
                      {formatDate(entry.publishedAt)}
                    </p>
                    <p className="text-[0.72rem] text-brand-muted">
                      {entry.note ?? "Full site publish"}
                      {entry.publishedBy ? ` · by ${entry.publishedBy}` : null}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void restore(entry.id, entry.publishedAt)}
                    disabled={busyId !== null}
                    className="rounded-none border border-brand-line px-2.5 py-1 text-[0.72rem] font-semibold text-brand-primary hover:border-brand-primary disabled:opacity-50"
                  >
                    {busyId === entry.id ? "Restoring…" : "Restore"}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div aria-live="polite">
            {message ? (
              <p
                className={`mt-3 rounded-none px-2.5 py-1.5 text-[0.75rem] ${
                  message.tone === "error"
                    ? "bg-[#fbeceb] text-[#8c1d18]"
                    : "bg-emerald-50 text-emerald-900"
                }`}
              >
                {message.text}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import { ENQUIRY_STATUSES, type EnquiryStatus } from "@/lib/quote";

const LABELS: Record<EnquiryStatus, string> = {
  new: "New",
  replied: "Replied",
  archived: "Archived",
};

/**
 * Triage control for one quote request.
 *
 * Only the status changes — there is no pricing, invoicing, or order flow here
 * by design. The studio replies to the sender by email as before.
 */
export function EnquiryTriage({ id, status }: { id: string; status: EnquiryStatus }) {
  const [current, setCurrent] = useState<EnquiryStatus>(status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function change(next: EnquiryStatus) {
    const previous = current;
    setCurrent(next);
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string }
        | null;
      if (!response.ok || !payload?.ok) {
        setCurrent(previous);
        setError(payload?.message ?? "Could not update the status.");
      }
    } catch {
      setCurrent(previous);
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className="sr-only" htmlFor={`status-${id}`}>
        Status for this request
      </label>
      <select
        id={`status-${id}`}
        value={current}
        disabled={busy}
        onChange={(event) => void change(event.target.value as EnquiryStatus)}
        className={`rounded-none border px-2 py-1.5 text-[0.75rem] font-semibold ${
          current === "new"
            ? "border-brand-accent/40 bg-brand-accent-soft text-brand-accent-strong"
            : current === "replied"
              ? "border-emerald-700/30 bg-emerald-50 text-emerald-900"
              : "border-brand-line bg-brand-paper-deep text-brand-muted"
        }`}
      >
        {ENQUIRY_STATUSES.map((option) => (
          <option key={option} value={option}>
            {LABELS[option]}
          </option>
        ))}
      </select>
      <div aria-live="polite">
        {error ? <p className="mt-1 max-w-[12rem] text-[0.68rem] text-[#b3261e]">{error}</p> : null}
      </div>
    </div>
  );
}

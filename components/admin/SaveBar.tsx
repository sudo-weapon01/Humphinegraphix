"use client";

import { Button } from "@/components/ui/Button";

type SaveBarProps = {
  dirty: boolean;
  saving: boolean;
  errorCount: number;
  message: { tone: "success" | "error"; text: string } | null;
  onSave: () => void;
  onReset: () => void;
  label?: string;
};

export function SaveBar({
  dirty,
  saving,
  errorCount,
  message,
  onSave,
  onReset,
  label = "Save draft",
}: SaveBarProps) {
  return (
    <div className="sticky top-16 z-30 -mx-4 mb-6 border-y border-brand-line bg-brand-paper/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={onSave} disabled={saving || !dirty}>
          {saving ? "Saving…" : label}
        </Button>
        <Button type="button" variant="quiet" onClick={onReset} disabled={saving || !dirty}>
          Discard changes
        </Button>

        <p className="text-[0.78rem] text-brand-muted" aria-live="polite">
          {dirty ? "Unsaved changes" : "No unsaved changes"}
          {errorCount > 0 ? ` · ${errorCount} field${errorCount === 1 ? "" : "s"} need attention` : ""}
        </p>
      </div>

      {message ? (
        <p
          role={message.tone === "error" ? "alert" : "status"}
          className={`mt-2 rounded-[2px] px-3 py-2 text-[0.8rem] ${
            message.tone === "error"
              ? "border border-[#b3261e]/30 bg-[#fbeceb] text-[#8c1d18]"
              : "border border-emerald-700/25 bg-emerald-50 text-emerald-900"
          }`}
        >
          {message.text}
        </p>
      ) : null}
    </div>
  );
}

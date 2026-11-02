"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { validateContent } from "@/lib/content/validate";

/**
 * Shared state machine for the three admin editors:
 * local edits → client validation → PUT draft → optional publish elsewhere.
 */
export function useDraftEditor<T>(key: "pages" | "services" | "portfolio", initial: T, template: T) {
  const router = useRouter();
  const [value, setValue] = useState<T>(initial);
  const [savedValue, setSavedValue] = useState<T>(initial);
  const [saving, setSaving] = useState(false);
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const dirty = useMemo(
    () => JSON.stringify(value) !== JSON.stringify(savedValue),
    [value, savedValue],
  );

  const validation = useMemo(() => validateContent(template, value), [template, value]);
  const errors = validation.ok ? serverErrors : { ...validation.errors, ...serverErrors };

  const save = useCallback(async () => {
    setMessage(null);
    setServerErrors({});
    if (!validation.ok) {
      setMessage({ tone: "error", text: "Fix the highlighted fields before saving." });
      return false;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string; errors?: Record<string, string> }
        | null;

      if (!response.ok || !payload?.ok) {
        setServerErrors(payload?.errors ?? {});
        setMessage({
          tone: "error",
          text: payload?.message ?? "Could not save your changes. Please try again.",
        });
        return false;
      }

      setSavedValue(value);
      setMessage({ tone: "success", text: "Draft saved. Publish when you're ready for it to go live." });
      router.refresh();
      return true;
    } catch {
      setMessage({
        tone: "error",
        text: "Could not reach the server. Check your connection and try again.",
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [key, router, validation, value]);

  const reset = useCallback(() => {
    setValue(savedValue);
    setServerErrors({});
    setMessage(null);
  }, [savedValue]);

  return {
    value,
    setValue,
    dirty,
    errors,
    valid: validation.ok,
    saving,
    message,
    save,
    reset,
  };
}

"use client";

import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  BUDGET_RANGES,
  EMPTY_QUOTE,
  UNSURE_FLYER_TYPE,
  validateQuoteInput,
  type QuoteInput,
} from "@/lib/quote";
import { ANALYTICS_EVENTS, track } from "@/lib/analytics";
import { TURNSTILE_SITE_KEY } from "@/lib/turnstile-config";
import { todayIso } from "@/lib/validation";
import { TurnstileWidget } from "./TurnstileWidget";
import type { SitePages } from "@/lib/content/types";

type QuoteFormProps = {
  flyerTypes: string[];
  copy: SitePages["contact"];
};

type FieldErrors = Partial<Record<keyof QuoteInput, string>>;

const inputClass = "field-input";

const labelClass =
  "block font-mono text-[0.6rem] uppercase tracking-[0.16em] text-brand-primary";

const errorClass = "mt-1.5 text-[0.78rem] font-medium text-[#a4221a]";

export function QuoteForm({ flyerTypes, copy }: QuoteFormProps) {
  const uid = useId();
  const fieldId = (name: string) => `${uid}-${name}`;
  const errorId = (name: string) => `${uid}-${name}-error`;

  const [values, setValues] = useState<QuoteInput>(EMPTY_QUOTE);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [spamToken, setSpamToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);
  const startedRef = useRef(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const typeOptions = [...flyerTypes, UNSURE_FLYER_TYPE];
  const today = todayIso();

  function update<K extends keyof QuoteInput>(key: K, value: string) {
    // First keystroke in a real field marks the start of a funnel step.
    if (!startedRef.current && key !== "company") {
      startedRef.current = true;
      track(ANALYTICS_EVENTS.quoteStarted);
    }
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    // Client-side validation mirrors the server rules in lib/quote.ts.
    const result = validateQuoteInput(values, flyerTypes);
    if (!result.ok) {
      const fieldErrors = Object.fromEntries(
        Object.entries(result.errors).filter(([key]) => key !== "company" && key !== "_"),
      ) as FieldErrors;
      setErrors(fieldErrors);
      // Move focus to the alert so screen-reader users hear what went wrong.
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setStatus("submitting");
    setErrors({});
    track(ANALYTICS_EVENTS.quoteSubmitted);

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, turnstileToken: spamToken ?? undefined }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string; errors?: FieldErrors }
        | null;

      if (!response.ok || !payload?.ok) {
        if (payload?.errors) setErrors(payload.errors);
        setSubmitError(
          payload?.message ??
            "We couldn't send your request just now. Please try again, or email us directly.",
        );
        track(ANALYTICS_EVENTS.quoteFailed, { status: response.status });
        setTurnstileReset((value) => value + 1);
        setStatus("idle");
        return;
      }

      track(ANALYTICS_EVENTS.quoteSucceeded);
      setStatus("success");
      setValues(EMPTY_QUOTE);
    } catch {
      setSubmitError(
        "We couldn't reach the studio — check your connection and try again, or email us directly.",
      );
      track(ANALYTICS_EVENTS.quoteFailed, { status: 0 });
      setTurnstileReset((value) => value + 1);
      setStatus("idle");
    }
  }

  if (status === "success") {
    return (
      <div
        className="border border-brand-primary bg-brand-surface p-8 md:p-10"
        role="status"
        aria-live="polite"
      >
        <span className="grid h-11 w-11 place-items-center bg-brand-accent text-brand-primary">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M4 12.5l5 5L20 6.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h3 className="mt-5 font-heading text-2xl font-extrabold tracking-[-0.04em] text-brand-primary">
          {copy.successTitle}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-brand-muted">{copy.successBody}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-semibold text-brand-primary underline decoration-brand-accent decoration-2 underline-offset-4 hover:text-brand-accent-strong"
        >
          Send another request
        </button>
      </div>
    );
  }

  const hasFieldErrors = Object.keys(errors).length > 0;

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="border border-brand-line bg-brand-surface p-6 md:p-8"
      aria-labelledby={`${uid}-form-title`}
    >
      <div className="mb-7 border-b border-brand-line pb-5">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="index text-brand-accent-strong">
            01
          </span>
          <span className="label text-brand-muted">Quote request</span>
        </div>
        <h2
          id={`${uid}-form-title`}
          className="mt-3 font-heading text-[1.5rem] font-extrabold tracking-[-0.04em] text-brand-primary"
        >
          {copy.formTitle}
        </h2>
        <p className="mt-2 text-[0.85rem] leading-relaxed text-brand-muted">{copy.formNote}</p>
      </div>

      {hasFieldErrors ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="mb-5 border border-[#a4221a]/30 bg-[#fbeceb] p-3 text-[0.82rem] text-[#8c1d18]"
        >
          Please check the highlighted fields below.
        </div>
      ) : null}

      {submitError ? (
        <div role="alert" className="mb-5 border border-[#a4221a]/30 bg-[#fbeceb] p-3 text-[0.82rem] text-[#8c1d18]">
          {submitError}
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={fieldId("name")} className={labelClass}>
            Name <span aria-hidden="true" className="text-brand-accent-strong">*</span>
          </label>
          <input
            id={fieldId("name")}
            name="name"
            type="text"
            autoComplete="name"
            required
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? errorId("name") : undefined}
            className={`mt-1.5 ${inputClass}`}
            placeholder="Your full name"
          />
          {errors.name ? (
            <p id={errorId("name")} className={errorClass}>
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor={fieldId("email")} className={labelClass}>
            Email <span aria-hidden="true" className="text-brand-accent-strong">*</span>
          </label>
          <input
            id={fieldId("email")}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? errorId("email") : undefined}
            className={`mt-1.5 ${inputClass}`}
            placeholder="name@example.com"
          />
          {errors.email ? (
            <p id={errorId("email")} className={errorClass}>
              {errors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor={fieldId("phone")} className={labelClass}>
            Phone <span className="ml-1 font-body text-[0.6rem] normal-case tracking-normal text-brand-muted">(optional)</span>
          </label>
          <input
            id={fieldId("phone")}
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={values.phone}
            onChange={(event) => update("phone", event.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? errorId("phone") : undefined}
            className={`mt-1.5 ${inputClass}`}
            placeholder="+233 20 000 0000"
          />
          {errors.phone ? (
            <p id={errorId("phone")} className={errorClass}>
              {errors.phone}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor={fieldId("flyerType")} className={labelClass}>
            Flyer type <span aria-hidden="true" className="text-brand-accent-strong">*</span>
          </label>
          <select
            id={fieldId("flyerType")}
            name="flyerType"
            required
            value={values.flyerType}
            onChange={(event) => update("flyerType", event.target.value)}
            aria-invalid={Boolean(errors.flyerType)}
            aria-describedby={errors.flyerType ? errorId("flyerType") : undefined}
            className={`mt-1.5 ${inputClass}`}
          >
            <option value="">Select a flyer type…</option>
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.flyerType ? (
            <p id={errorId("flyerType")} className={errorClass}>
              {errors.flyerType}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor={fieldId("eventDate")} className={labelClass}>
            Event date <span className="ml-1 font-body text-[0.6rem] normal-case tracking-normal text-brand-muted">(optional)</span>
          </label>
          <input
            id={fieldId("eventDate")}
            name="eventDate"
            type="date"
            min={today}
            value={values.eventDate}
            onChange={(event) => update("eventDate", event.target.value)}
            aria-invalid={Boolean(errors.eventDate)}
            aria-describedby={errors.eventDate ? errorId("eventDate") : undefined}
            className={`mt-1.5 ${inputClass}`}
          />
          {errors.eventDate ? (
            <p id={errorId("eventDate")} className={errorClass}>
              {errors.eventDate}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor={fieldId("deadline")} className={labelClass}>
            Deadline <span className="ml-1 font-body text-[0.6rem] normal-case tracking-normal text-brand-muted">(optional)</span>
          </label>
          <input
            id={fieldId("deadline")}
            name="deadline"
            type="date"
            min={today}
            value={values.deadline}
            onChange={(event) => update("deadline", event.target.value)}
            aria-invalid={Boolean(errors.deadline)}
            aria-describedby={errors.deadline ? errorId("deadline") : undefined}
            className={`mt-1.5 ${inputClass}`}
          />
          {errors.deadline ? (
            <p id={errorId("deadline")} className={errorClass}>
              {errors.deadline}
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={fieldId("budgetRange")} className={labelClass}>
            Budget range <span aria-hidden="true" className="text-brand-accent-strong">*</span>
          </label>
          <select
            id={fieldId("budgetRange")}
            name="budgetRange"
            required
            value={values.budgetRange}
            onChange={(event) => update("budgetRange", event.target.value)}
            aria-invalid={Boolean(errors.budgetRange)}
            aria-describedby={`${fieldId("budgetRange")}-hint${errors.budgetRange ? ` ${errorId("budgetRange")}` : ""}`}
            className={`mt-1.5 ${inputClass}`}
          >
            <option value="">Select a range…</option>
            {BUDGET_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
          <p id={`${fieldId("budgetRange")}-hint`} className="mt-1.5 text-[0.75rem] leading-relaxed text-brand-muted">
            A range only — this helps us scope the quote. Nothing is charged online.
          </p>
          {errors.budgetRange ? (
            <p id={errorId("budgetRange")} className={errorClass}>
              {errors.budgetRange}
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={fieldId("message")} className={labelClass}>
            Tell us about the flyer <span aria-hidden="true" className="text-brand-accent-strong">*</span>
          </label>
          <textarea
            id={fieldId("message")}
            name="message"
            required
            rows={5}
            value={values.message}
            onChange={(event) => update("message", event.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={`${fieldId("message")}-hint${errors.message ? ` ${errorId("message")}` : ""}`}
            className={`mt-1.5 min-h-28 resize-y ${inputClass}`}
            placeholder="What is the flyer for, where will it be seen, and what should people do after reading it?"
          />
          <p id={`${fieldId("message")}-hint`} className="mt-1.5 text-[0.75rem] leading-relaxed text-brand-muted">
            A few sentences is plenty. Include the venue or business name if it&apos;s relevant.
          </p>
          {errors.message ? (
            <p id={errorId("message")} className={errorClass}>
              {errors.message}
            </p>
          ) : null}
        </div>

        {/* Honeypot — hidden from people, attractive to bots. */}
        <div aria-hidden="true" className="hidden">
          <label htmlFor={fieldId("company")}>Company</label>
          <input
            id={fieldId("company")}
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.company ?? ""}
            onChange={(event) => update("company", event.target.value)}
          />
        </div>
      </div>

      <div className="mt-5">
        <TurnstileWidget
          siteKey={TURNSTILE_SITE_KEY}
          onToken={setSpamToken}
          resetSignal={turnstileReset}
        />
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-4 border-t border-brand-line pt-6">
        <Button type="submit" size="lg" disabled={status === "submitting"}>
          {status === "submitting" ? (
            <>
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-brand-paper/40 border-t-brand-paper"
              />
              Sending…
            </>
          ) : (
            <>
              Send quote request <span aria-hidden="true">→</span>
            </>
          )}
        </Button>
        <p className="font-mono text-[0.58rem] uppercase leading-relaxed tracking-[0.14em] text-brand-muted">
          No payment · No account · Reply by email
        </p>
      </div>

      <p aria-live="polite" className="sr-only">
        {status === "submitting" ? "Sending your quote request." : ""}
      </p>
    </form>
  );
}

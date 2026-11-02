"use client";

import { useId, type ReactNode } from "react";

const controlClass =
  "w-full rounded-none border border-brand-line bg-brand-surface px-3 py-2 text-sm text-brand-ink focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/25";

type FieldProps = {
  label: string;
  error?: string;
  hint?: string;
  children: (props: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
  className?: string;
};

/** Label + control + inline error, wired for screen readers. */
export function Field({ label, error, hint, children, className = "" }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-[0.78rem] font-semibold text-brand-primary">
        {label}
      </label>
      <div className="mt-1.5">{children({ id, describedBy, invalid: Boolean(error) })}</div>
      {hint ? (
        <p id={hintId} className="mt-1 text-[0.72rem] text-brand-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="mt-1 text-[0.75rem] font-medium text-[#b3261e]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type TextFieldProps = Omit<FieldProps, "children"> & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  list?: string;
};

export function TextField({
  value,
  onChange,
  placeholder,
  type = "text",
  multiline = false,
  rows = 4,
  list,
  ...field
}: TextFieldProps) {
  return (
    <Field {...field}>
      {({ id, describedBy, invalid }) =>
        multiline ? (
          <textarea
            id={id}
            value={value}
            rows={rows}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={`${controlClass} resize-y`}
          />
        ) : (
          <input
            id={id}
            type={type}
            list={list}
            value={value}
            placeholder={placeholder}
            onChange={(event) => onChange(event.target.value)}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            className={controlClass}
          />
        )
      }
    </Field>
  );
}

"use client";

import { labelForPath } from "@/lib/content/path";
import { Field, TextField } from "./Field";

type ContentNodeProps = {
  path: string;
  value: unknown;
  errors: Record<string, string>;
  onChange: (path: string, value: unknown) => void;
  depth?: number;
};

const MULTILINE = /(intro|body|Body|subtitle|tagline|description|note|paragraph|story|address|message)/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Recursive renderer used by the page-copy editor. Renders one labelled field
 * per string, with add/remove controls for lists — no hand-written form per
 * field, and it follows the shape of the content document automatically.
 */
export function ContentNode({ path, value, errors, onChange, depth = 0 }: ContentNodeProps) {
  const update = (nextPath: string, nextValue: unknown) => onChange(nextPath, nextValue);

  if (typeof value === "string") {
    const label = labelForPath(path);
    const multiline = MULTILINE.test(path) || value.length > 90;
    return (
      <TextField
        label={label}
        value={value}
        multiline={multiline}
        rows={multiline ? 4 : undefined}
        error={errors[path]}
        onChange={(next) => update(path, next)}
        className={multiline ? "sm:col-span-2" : ""}
      />
    );
  }

  if (Array.isArray(value)) {
    const first = value[0];
    const blank = (node: unknown): unknown => {
      if (typeof node === "string") return "";
      if (Array.isArray(node)) return [];
      if (isPlainObject(node)) {
        return Object.fromEntries(Object.entries(node).map(([key, child]) => [key, blank(child)]));
      }
      return "";
    };
    const addItem = () => update(path, [...value, blank(first)]);
    const removeItem = (index: number) => update(path, value.filter((_, i) => i !== index));

    return (
      <div className={`sm:col-span-2 ${depth > 0 ? "border-t border-brand-line pt-4" : ""}`}>
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-brand-primary/70">
            {labelForPath(path)}
          </h4>
          <button
            type="button"
            onClick={addItem}
            className="rounded-[2px] border border-brand-line px-2 py-1 text-[0.72rem] font-semibold text-brand-primary hover:bg-brand-paper-deep"
          >
            + Add {typeof first === "string" ? "line" : "item"}
          </button>
        </div>
        {errors[path] ? <p className="mt-1 text-[0.75rem] text-[#b3261e]">{errors[path]}</p> : null}
        <div className="mt-3 space-y-3">
          {value.map((child, index) => (
            <div key={index} className="rounded-[2px] border border-brand-line bg-brand-paper/60 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-brand-muted">
                  {typeof first === "string" ? `Line ${index + 1}` : `Item ${index + 1}`}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-[0.72rem] font-semibold text-[#b3261e] hover:underline"
                >
                  Remove
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <ContentNode
                  path={`${path}[${index}]`}
                  value={child}
                  errors={errors}
                  onChange={onChange}
                  depth={depth + 1}
                />
              </div>
            </div>
          ))}
          {value.length === 0 ? (
            <p className="text-[0.78rem] text-brand-muted">Nothing here yet — use “Add” above.</p>
          ) : null}
        </div>
      </div>
    );
  }

  if (isPlainObject(value)) {
    return (
      <fieldset className="sm:col-span-2">
        {depth > 0 ? (
          <legend className="mb-3 text-[0.8rem] font-bold uppercase tracking-[0.12em] text-brand-accent">
            {labelForPath(path)}
          </legend>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(value).map(([key, child]) => (
            <ContentNode
              key={key}
              path={path ? `${path}.${key}` : key}
              value={child}
              errors={errors}
              onChange={onChange}
            />
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <Field label={labelForPath(path)} error={`Unsupported field type at ${path}`}>
      {() => <p className="text-sm text-brand-muted">—</p>}
    </Field>
  );
}

"use client";

import { useState } from "react";
import { Field, TextField } from "./Field";
import { SaveBar } from "./SaveBar";
import { useDraftEditor } from "./useDraftEditor";
import { defaultServices } from "@/lib/content/defaults";
import { makeId } from "@/lib/content/validate";
import type { Service } from "@/lib/content/types";
import { Button } from "@/components/ui/Button";

export function ServicesEditor({ initial }: { initial: Service[] }) {
  const editor = useDraftEditor<Service[]>("services", initial, defaultServices);
  const [newType, setNewType] = useState<Record<number, string>>({});

  const setServices = (next: Service[]) => editor.setValue(next);
  const update = (index: number, patch: Partial<Service>) =>
    setServices(editor.value.map((service, i) => (i === index ? { ...service, ...patch } : service)));

  const move = (index: number, direction: -1 | 1) => {
    const next = [...editor.value];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setServices(next);
  };

  const errorFor = (index: number, field: keyof Service): string | undefined =>
    editor.errors[`[${index}].${field}`];

  const addService = () => {
    setServices([
      ...editor.value,
      { id: makeId("service"), name: "", description: "", flyerTypes: [] },
    ]);
  };

  return (
    <div>
      <SaveBar
        dirty={editor.dirty}
        saving={editor.saving}
        errorCount={Object.keys(editor.errors).length}
        message={editor.message}
        onSave={() => void editor.save()}
        onReset={editor.reset}
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.82rem] text-brand-muted">
          {editor.value.length} service{editor.value.length === 1 ? "" : "s"} · flyer types feed the
          dropdown on the contact form.
        </p>
        <Button type="button" variant="quiet" onClick={addService}>
          + Add service
        </Button>
      </div>

      <ul className="space-y-5">
        {editor.value.map((service, index) => (
          <li key={service.id} className="rounded-none border border-brand-line bg-brand-surface p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-brand-muted">
                Service {index + 1}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="rounded-none border border-brand-line px-2 py-1 text-[0.72rem] font-semibold text-brand-primary disabled:opacity-40"
                >
                  ↑ Up
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === editor.value.length - 1}
                  className="rounded-none border border-brand-line px-2 py-1 text-[0.72rem] font-semibold text-brand-primary disabled:opacity-40"
                >
                  ↓ Down
                </button>
                <button
                  type="button"
                  onClick={() => setServices(editor.value.filter((_, i) => i !== index))}
                  className="rounded-none border border-[#b3261e]/30 px-2 py-1 text-[0.72rem] font-semibold text-[#b3261e] hover:bg-[#fbeceb]"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Service name"
                value={service.name}
                error={errorFor(index, "name")}
                onChange={(value) => update(index, { name: value })}
              />
              <TextField
                label="Description"
                value={service.description}
                multiline
                rows={3}
                error={errorFor(index, "description")}
                onChange={(value) => update(index, { description: value })}
                className="sm:col-span-2"
              />

              <Field
                label="Flyer types offered"
                hint="Shown on the Services page and used for the quote form dropdown."
                error={errorFor(index, "flyerTypes")}
                className="sm:col-span-2"
              >
                {() => (
                  <div>
                    {service.flyerTypes.length > 0 ? (
                      <ul className="flex flex-wrap gap-2">
                        {service.flyerTypes.map((type, typeIndex) => (
                          <li
                            key={`${type}-${typeIndex}`}
                            className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-paper px-3 py-1 text-[0.75rem] text-brand-primary"
                          >
                            {type}
                            <button
                              type="button"
                              aria-label={`Remove flyer type ${type}`}
                              onClick={() =>
                                update(index, {
                                  flyerTypes: service.flyerTypes.filter((_, i) => i !== typeIndex),
                                })
                              }
                              className="text-brand-muted hover:text-[#b3261e]"
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[0.75rem] text-brand-muted">No flyer types yet.</p>
                    )}

                    <div className="mt-3 flex gap-2">
                      <input
                        value={newType[index] ?? ""}
                        onChange={(event) =>
                          setNewType((current) => ({ ...current, [index]: event.target.value }))
                        }
                        placeholder="e.g. Live music or concert"
                        aria-label={`New flyer type for ${service.name || "service"}`}
                        className="w-full max-w-xs rounded-none border border-brand-line bg-brand-surface px-3 py-1.5 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const value = (newType[index] ?? "").trim();
                          if (!value) return;
                          update(index, { flyerTypes: [...service.flyerTypes, value] });
                          setNewType((current) => ({ ...current, [index]: "" }));
                        }}
                        className="rounded-none border border-brand-line px-3 py-1.5 text-[0.75rem] font-semibold text-brand-primary hover:bg-brand-paper-deep"
                      >
                        Add type
                      </button>
                    </div>
                  </div>
                )}
              </Field>
            </div>
          </li>
        ))}
      </ul>

      {editor.value.length === 0 ? (
        <p className="rounded-none border border-dashed border-brand-line p-6 text-center text-sm text-brand-muted">
          No services yet. Add one so it appears on the Services page and in the quote form.
        </p>
      ) : null}
    </div>
  );
}

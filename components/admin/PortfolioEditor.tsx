"use client";

/* eslint-disable @next/next/no-img-element -- admin thumbnails may point anywhere */
import { SaveBar } from "./SaveBar";
import { TextField } from "./Field";
import { useDraftEditor } from "./useDraftEditor";
import { defaultPortfolio } from "@/lib/content/defaults";
import { makeId } from "@/lib/content/validate";
import type { PortfolioItem } from "@/lib/content/types";
import { Button } from "@/components/ui/Button";

type PortfolioEditorProps = {
  initial: PortfolioItem[];
  flyerTypeSuggestions: string[];
};

export function PortfolioEditor({ initial, flyerTypeSuggestions }: PortfolioEditorProps) {
  const editor = useDraftEditor<PortfolioItem[]>("portfolio", initial, defaultPortfolio);

  const update = (index: number, patch: Partial<PortfolioItem>) =>
    editor.setValue((current) =>
      current.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );

  const move = (index: number, direction: -1 | 1) => {
    editor.setValue((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const addItem = () =>
    editor.setValue((current) => [
      ...current,
      {
        id: makeId("flyer"),
        title: "",
        flyerType: "",
        description: "",
        image: "/images/portfolio/placeholder.svg",
        imageAlt: "",
      },
    ]);

  const errorFor = (index: number, field: keyof PortfolioItem) =>
    editor.errors[`[${index}].${field}`];

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
          {editor.value.length} item{editor.value.length === 1 ? "" : "s"} · shown in this order on
          the home page and portfolio.
        </p>
        <Button type="button" variant="quiet" onClick={addItem}>
          + Add flyer
        </Button>
      </div>

      <ul className="space-y-5">
        {editor.value.map((item, index) => (
          <li
            key={item.id}
            className="grid gap-5 rounded-[3px] border border-brand-line bg-brand-surface p-5 md:grid-cols-[10rem_1fr]"
          >
            <div>
              <div className="aspect-[3/4] overflow-hidden rounded-[2px] border border-brand-line bg-brand-paper-deep">
                {item.image ? (
                  <img
                    src={item.image}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-[0.7rem] text-brand-muted">
                    No image
                  </div>
                )}
              </div>
              <p className="mt-2 break-all text-[0.68rem] text-brand-muted">{item.image}</p>
            </div>

            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-brand-muted">
                  Item {index + 1}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="rounded-[2px] border border-brand-line px-2 py-1 text-[0.72rem] font-semibold text-brand-primary disabled:opacity-40"
                  >
                    ↑ Up
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === editor.value.length - 1}
                    className="rounded-[2px] border border-brand-line px-2 py-1 text-[0.72rem] font-semibold text-brand-primary disabled:opacity-40"
                  >
                    ↓ Down
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      editor.setValue((current) => current.filter((_, i) => i !== index))
                    }
                    className="rounded-[2px] border border-[#b3261e]/30 px-2 py-1 text-[0.72rem] font-semibold text-[#b3261e] hover:bg-[#fbeceb]"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Title"
                  value={item.title}
                  error={errorFor(index, "title")}
                  onChange={(value) => update(index, { title: value })}
                />
                <TextField
                  label="Flyer type"
                  list="flyer-type-suggestions"
                  value={item.flyerType}
                  error={errorFor(index, "flyerType")}
                  hint="Use one of the flyer types from Services for consistency."
                  onChange={(value) => update(index, { flyerType: value })}
                />
                <TextField
                  label="Description"
                  value={item.description}
                  multiline
                  rows={3}
                  error={errorFor(index, "description")}
                  onChange={(value) => update(index, { description: value })}
                  className="sm:col-span-2"
                />
                <TextField
                  label="Image path or URL"
                  value={item.image}
                  error={errorFor(index, "image")}
                  hint="A file in /public (e.g. /images/portfolio/my-flyer.jpg) or an https:// URL."
                  onChange={(value) => update(index, { image: value })}
                />
                <TextField
                  label="Image alt text"
                  value={item.imageAlt}
                  error={errorFor(index, "imageAlt")}
                  hint="Describe the flyer for screen readers."
                  onChange={(value) => update(index, { imageAlt: value })}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {flyerTypeSuggestions.length > 0 ? (
        <datalist id="flyer-type-suggestions">
          {flyerTypeSuggestions.map((type) => (
            <option key={type} value={type} />
          ))}
        </datalist>
      ) : null}
    </div>
  );
}

import { PagesEditor } from "@/components/admin/PagesEditor";
import { getDraftBundle } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const drafts = await getDraftBundle();

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-heading text-[clamp(1.5rem,3.4vw,2rem)] font-extrabold tracking-[-0.03em] text-brand-primary">
          Page copy
        </h1>
        <p className="mt-2 max-w-2xl text-[0.88rem] leading-relaxed text-brand-muted">
          Headlines, introductions, and contact details for every public page. Lists (like the
          About page values) can be added to or trimmed.
        </p>
      </header>

      <PagesEditor initial={drafts.pages} />
    </div>
  );
}

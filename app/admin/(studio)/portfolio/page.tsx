import { PortfolioEditor } from "@/components/admin/PortfolioEditor";
import { getDraftBundle } from "@/lib/content/store";
import { flyerTypeOptions } from "@/lib/content/types";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  const drafts = await getDraftBundle();

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-heading text-[clamp(1.5rem,3.4vw,2rem)] font-extrabold tracking-[-0.03em] text-brand-primary">
          Portfolio items
        </h1>
        <p className="mt-2 max-w-2xl text-[0.88rem] leading-relaxed text-brand-muted">
          Add, reorder, edit, or remove the flyers shown in the public gallery. Images can be files
          in <code>/public/images/portfolio</code> or an https URL.
        </p>
      </header>

      <PortfolioEditor
        initial={drafts.portfolio}
        flyerTypeSuggestions={flyerTypeOptions(drafts.services)}
      />
    </div>
  );
}

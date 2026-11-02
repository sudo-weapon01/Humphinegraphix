import { ServicesEditor } from "@/components/admin/ServicesEditor";
import { getDraftBundle } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const drafts = await getDraftBundle();

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-heading text-[clamp(1.5rem,3.4vw,2rem)] font-extrabold tracking-[-0.03em] text-brand-primary">
          Services
        </h1>
        <p className="mt-2 max-w-2xl text-[0.88rem] leading-relaxed text-brand-muted">
          These appear on the Services page. Their flyer types are also the choices in the quote
          form&apos;s “Flyer type” dropdown.
        </p>
      </header>

      <ServicesEditor initial={drafts.services} />
    </div>
  );
}

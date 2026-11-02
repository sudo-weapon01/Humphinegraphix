import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-brand-paper px-5 py-16">
      <div className="max-w-md text-center">
        <p className="font-heading text-sm font-extrabold uppercase tracking-[0.2em] text-brand-accent-strong">
          404
        </p>
        <h1 className="mt-4 font-heading text-[clamp(1.9rem,5vw,2.8rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-brand-primary">
          That page isn&apos;t on the press sheet.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-brand-muted">
          The page you were looking for doesn&apos;t exist. Head back to the home page, or send the
          studio a quote request.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/contact" variant="outline">
            Request a quote
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

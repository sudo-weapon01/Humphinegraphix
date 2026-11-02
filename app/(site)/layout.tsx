import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { getSiteContent } from "@/lib/content/public";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const { pages } = await getSiteContent();

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[2px] focus:bg-brand-primary focus:px-4 focus:py-2 focus:text-sm focus:text-brand-paper"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter pages={pages} />
    </div>
  );
}

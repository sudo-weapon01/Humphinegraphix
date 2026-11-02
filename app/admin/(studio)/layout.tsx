import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { PublishBar } from "@/components/admin/PublishBar";
import { PublishHistory } from "@/components/admin/PublishHistory";
import { Wordmark } from "@/components/site/Wordmark";
import { requireStaffSession } from "@/lib/auth";
import { getPublishStatus } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Studio admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Middleware already gates /admin, but every admin render re-verifies the session.
  const session = await requireStaffSession();
  const status = await getPublishStatus();

  return (
    <div className="min-h-dvh bg-brand-paper">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-none focus:bg-brand-primary focus:px-4 focus:py-2 focus:text-sm focus:text-brand-paper"
      >
        Skip to admin content
      </a>

      <header className="border-b border-brand-line bg-brand-surface">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-3">
            <Wordmark />
            <span className="hidden h-5 w-px bg-brand-line sm:block" aria-hidden="true" />
            <span className="hidden text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-brand-muted sm:block">
              Studio admin
            </span>
          </div>
          <p className="text-[0.72rem] text-brand-muted">
            Content storage:{" "}
            <strong className="font-semibold text-brand-primary">
              {status.storage === "supabase" ? "Supabase" : "local file (dev)"}
            </strong>
          </p>
        </div>
        <AdminNav user={session.sub} />
      </header>

      <PublishBar status={status} />
      <PublishHistory />

      {status.storage === "files" && process.env.NODE_ENV === "production" ? (
        <p className="border-b border-brand-gold/40 bg-brand-gold/15 px-5 py-2.5 text-center text-[0.78rem] text-brand-primary">
          This deployment is using the temporary file store — content may reset when the server
          restarts. Set <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> to
          persist content.
        </p>
      ) : null}

      <main id="admin-main" className="container-page py-8">
        {children}
      </main>
    </div>
  );
}

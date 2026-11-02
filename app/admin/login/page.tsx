import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { getStaffCredentials } from "@/lib/auth-config";

export const metadata: Metadata = {
  title: "Studio sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Only same-site admin paths are accepted as a post-login destination. */
function safeNext(value: string | string[] | undefined): string {
  const next = Array.isArray(value) ? value[0] : value;
  if (!next || !next.startsWith("/admin") || next.startsWith("//")) return "/admin";
  return next;
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const credentials = getStaffCredentials();

  return (
    <div className="relative grid min-h-dvh place-items-center bg-brand-primary px-5 py-16">
      <p
        aria-hidden="true"
        className="display display-cond pointer-events-none absolute bottom-0 left-0 select-none text-[clamp(5rem,22vw,20rem)] leading-[0.7] text-brand-paper/[0.05]"
      >
        HG
      </p>
      <div className="relative w-full max-w-sm">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="grid h-8 w-8 place-items-center bg-brand-accent font-heading text-[0.8rem] font-extrabold text-brand-primary">
              HG
            </span>
            <p className="font-heading text-xl font-extrabold tracking-[-0.045em] text-brand-paper">
              Humphine<span className="text-brand-accent">graphix</span>
            </p>
          </div>
          <p className="mt-4 border-t border-brand-paper/20 pt-3 font-mono text-[0.58rem] uppercase tracking-[0.24em] text-brand-paper/50">
            Studio content admin
          </p>
        </div>

        <LoginForm
          next={safeNext(params.next)}
          configured={Boolean(credentials)}
          developmentHint={
            credentials?.source === "development-default"
              ? { username: credentials.username, password: credentials.password }
              : null
          }
        />
      </div>
    </div>
  );
}

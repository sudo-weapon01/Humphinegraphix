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
    <div className="grid min-h-dvh place-items-center bg-brand-primary px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-heading text-2xl font-extrabold tracking-[-0.035em] text-brand-paper">
            Humphine<span className="text-brand-gold">graphix</span>
          </p>
          <p className="mt-1 text-[0.7rem] uppercase tracking-[0.18em] text-brand-paper/50">
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

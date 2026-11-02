"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

type LoginFormProps = {
  next: string;
  configured: boolean;
  developmentHint: { username: string; password: string } | null;
};

export function LoginForm({ next, configured, developmentHint }: LoginFormProps) {
  const router = useRouter();
  const uid = useId();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { ok?: boolean; message?: string }
        | null;

      if (!response.ok || !payload?.ok) {
        setError(payload?.message ?? "Sign-in failed. Please try again.");
        setSubmitting(false);
        requestAnimationFrame(() => errorRef.current?.focus());
        return;
      }

      router.replace(next);
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-[2px] border border-brand-paper/20 bg-brand-primary-soft px-3 py-2.5 text-sm text-brand-paper placeholder:text-brand-paper/35 focus:border-brand-gold focus:outline-none focus:ring-2 focus:ring-brand-gold/30";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-[3px] border border-brand-paper/15 bg-brand-primary-soft/40 p-6 shadow-lift backdrop-blur"
    >
      <h1 className="font-heading text-lg font-bold tracking-[-0.02em] text-brand-paper">
        Staff sign in
      </h1>
      <p className="mt-1 text-[0.78rem] text-brand-paper/60">
        Content editing is restricted to studio staff.
      </p>

      {!configured ? (
        <p
          role="alert"
          className="mt-4 rounded-[2px] border border-brand-gold/40 bg-brand-gold/10 px-3 py-2 text-[0.78rem] text-brand-gold"
        >
          Sign-in is not configured on this deployment. Set ADMIN_USERNAME, ADMIN_PASSWORD, and
          ADMIN_SESSION_SECRET.
        </p>
      ) : null}

      {error ? (
        <p
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="mt-4 rounded-[2px] border border-red-400/40 bg-red-500/10 px-3 py-2 text-[0.8rem] text-red-200"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-5">
        <label htmlFor={`${uid}-username`} className="block text-[0.75rem] font-semibold text-brand-paper/80">
          Username
        </label>
        <input
          id={`${uid}-username`}
          name="username"
          type="text"
          autoComplete="username"
          required
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className={inputClass}
        />
      </div>

      <div className="mt-4">
        <label htmlFor={`${uid}-password`} className="block text-[0.75rem] font-semibold text-brand-paper/80">
          Password
        </label>
        <input
          id={`${uid}-password`}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={inputClass}
        />
      </div>

      <Button type="submit" variant="light" size="lg" className="mt-6 w-full" disabled={submitting || !configured}>
        {submitting ? "Signing in…" : "Sign in"}
      </Button>

      {developmentHint ? (
        <p className="mt-5 border-t border-brand-paper/15 pt-4 text-[0.72rem] leading-relaxed text-brand-paper/55">
          Development-only demo login:{" "}
          <code className="text-brand-gold">{developmentHint.username}</code> /{" "}
          <code className="text-brand-gold">{developmentHint.password}</code>
          <br />
          Set ADMIN_USERNAME and ADMIN_PASSWORD to replace it. It is disabled in production.
        </p>
      ) : null}
    </form>
  );
}

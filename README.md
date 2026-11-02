# Humphinegraphix

Marketing website and content admin for **Humphinegraphix**, an independent flyer
design studio. Built with Next.js (App Router), React, TypeScript, and Tailwind CSS.

- **Public site** — Home, Services, Portfolio, About, Contact. A lead-generation site:
  visitors request a quote, there is no pricing table, cart, checkout, or payment
  anywhere in the project.
- **Admin area** — protected content editing for portfolio items, services, page
  copy, and a read-only inbox of quote requests. Edits save as drafts and only reach
  the live site when staff press **Publish**. No redeploy required.
- **Content store** — Supabase when configured, with a zero-setup local JSON store
  for development and previews.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # then edit the values
npm run dev                  # http://localhost:3000
```

That's it — the site runs immediately using the local file store. Open
`http://localhost:3000` for the public site and `http://localhost:3000/admin` for
the admin area.

In development, if you have not configured credentials, a clearly-labelled demo
login is available on the sign-in screen (`studio` / `humphine-demo`). It is
**disabled in production**.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server (Turbopack off by default). |
| `npm run build` | Production build. |
| `npm start` | Serve the production build. |
| `npm test` | Run the Vitest suite (70 tests). |
| `npm run test:watch` | Watch mode. |
| `npm run typecheck` | `tsc --noEmit`. |

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in what you need.

| Variable | Required | Purpose |
| --- | --- | --- |
| `ADMIN_USERNAME` | Production | Staff username. |
| `ADMIN_PASSWORD` | Production | Staff password. Use a long random value. |
| `ADMIN_SESSION_SECRET` | Production | Signs the staff session cookie. 16+ random characters. |
| `SUPABASE_URL` | Production (recommended) | Project URL, e.g. `https://xyz.supabase.co`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Production (recommended) | Service-role key — **server-side only**. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical URL used for metadata and the sitemap. |

> `PLACEHOLDER_ADMIN_CREDENTIALS`: the values in `.env.example` are placeholders.
> Set real ones before deploying. Sign-in is refused entirely in production when
> `ADMIN_USERNAME` / `ADMIN_PASSWORD` are missing — there is no fallback password.

### Admin credential configuration

1. Generate a password and a session secret:
   ```bash
   openssl rand -base64 24   # password
   openssl rand -base64 32   # session secret
   ```
2. Put them in `.env.local` (local) and in your host's environment settings
   (production).
3. Restart the dev server / redeploy. Sessions last 8 hours; staff can sign out
   from the admin header.

Sessions are HMAC-signed (`lib/session.ts`) and stored in an `httpOnly`,
`SameSite=Lax` cookie. Changing `ADMIN_SESSION_SECRET` invalidates all sessions.

---

## Content storage and publishing

Three content documents — `pages`, `services`, `portfolio` — each with a **draft**
and a **published** copy.

```
Admin editor ──PUT──▶ draft ──Publish──▶ published ──▶ public pages
                                   │
                                   └─ revalidateTag("published-content")
                                      revalidatePath("/", "layout")
```

- Public pages read **published** content through a cached getter
  (`lib/content/public.ts`).
- Publishing copies drafts onto published copies and invalidates the cache tag and
  paths, so the change is live on the next request — no deployment.
- `Discard` resets drafts to the published version.

### Backends

`lib/content/store.ts` picks a backend automatically:

1. **Supabase** when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set.
2. **Local file** at `.data/content.json` otherwise (git-ignored). Ideal for local
   development and preview deployments.

To use Supabase:

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run [`supabase/schema.sql`](supabase/schema.sql) — it
   creates `content_docs` and `quote_requests`, with RLS enabled and **no
   policies**, so only the service-role key used by the server can read or write.
3. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to your environment.
4. Open `/admin` → make an edit → **Publish**. The first publish seeds the table.

The database is optional for local work and required for durable production
content: without it, edits live in the ephemeral filesystem of the deployment.

### Quote requests

`POST /api/quote` validates input on the server with the same rules the form uses,
then stores the lead in `quote_requests` (Supabase) or `.data/enquiries.json`.
They appear read-only under **Admin → Enquiries**. Nothing here charges, orders, or
takes payment; the studio replies by email.

---

## Project structure

```
app/
  layout.tsx                 Root layout, metadata, fonts, global CSS
  (site)/                    Public route group
    layout.tsx               Header + footer shell
    page.tsx                 Home
    services/page.tsx        Services
    portfolio/page.tsx       Portfolio
    about/page.tsx           About
    contact/page.tsx         Contact + quote form
  admin/
    login/page.tsx           Staff sign-in (public)
    (studio)/                Authenticated admin area
      layout.tsx             Session guard + admin chrome + publish bar
      page.tsx               Overview
      portfolio/page.tsx     Portfolio CRUD
      services/page.tsx      Services CRUD + flyer types
      pages/page.tsx         Page copy editor
      enquiries/page.tsx     Read-only leads
  api/
    quote/route.ts           Public quote endpoint
    admin/{login,logout,content,publish,discard}/route.ts
  sitemap.ts robots.ts not-found.tsx icon.svg
components/
  site/                      Header, footer, cards, CTA, headings
  forms/QuoteForm.tsx        Client form (validation, states, errors)
  admin/                     Editors, save bar, publish bar, fields
  ui/Button.tsx              Shared button styles
lib/
  content/                   Types, defaults, validation, store, cached reader, path helpers
  auth.ts auth-config.ts session.ts api.ts
  quote.ts validation.ts enquiries.ts supabase.ts site.ts
middleware.ts                Admin route gate
supabase/schema.sql          Database schema
tests/                       70 Vitest tests
```

---

## Tests

```bash
npm test
```

| File | Covers |
| --- | --- |
| `tests/quote-validation.test.ts` | Server rules: required fields, email, phone, dates, flyer type allowlist, budget range. |
| `tests/quote-form.test.tsx` | Form rendering, inline errors, accessible error associations, submit payload, success confirmation, API field errors, network failure, loading state. |
| `tests/admin-auth.test.ts` | Session signing/verification, tampering, expiry, credential configuration, middleware redirects and 401s. |
| `tests/admin-api.test.ts` | Admin endpoints refuse unauthenticated calls; drafts stay private; publish makes content public and revalidates; quote endpoint stores valid leads and rejects invalid ones. |
| `tests/content-store.test.ts` | Draft/publish/discard/reset semantics, unknown-field rejection, flyer types flowing to the quote form. |
| `tests/pages.test.tsx` | Key page rendering driven by published content, contact form options, no pricing on Services. |

---

## Deployment (standard Next.js host)

The project deploys to any host that runs Next.js — Vercel, Netlify, Fly.io, a Node
server, or a container.

### Vercel (recommended)

1. Push the repository to GitHub and import it in Vercel.
2. Add the environment variables from the table above
   (Project → Settings → Environment Variables) for Production and Preview.
3. Deploy — the default build command (`next build`) and output are detected
   automatically.

No code changes are needed. After deploying:

1. Sign in at `https://your-domain/admin` with your configured credentials.
2. Make an edit and press **Publish** to confirm the live site updates.

### Any Node host

```bash
npm ci
npm run build
npm start        # serves Next.js on $PORT (default 3000)
```

Run it behind HTTPS — the session cookie is `secure` in production.

### Notes

- `middleware.ts` protects `/admin/**` and `/api/admin/**`; every admin page and
  route handler re-checks the session server-side as well.
- Mutation endpoints reject cross-origin requests and validate all input.
- `robots.txt` disallows `/admin` and `/api`, and admin pages send `noindex`.
- Portfolio images can live in `public/images/portfolio/` or be any `https://` URL
  (configured in `next.config.ts`).

---

## Replacing the placeholders

Everything the studio still needs to supply is marked in the code and listed here.
Search the repo for `PLACEHOLDER_` and `TODO` to find them.

| Placeholder | Where |
| --- | --- |
| Brand colours (`PLACEHOLDER_BRAND_*`) | `app/globals.css` → `@theme` block |
| Heading and body fonts (`PLACEHOLDER_HEADING_FONT`, `PLACEHOLDER_BODY_FONT`) | `app/globals.css` tokens; add the licensed files with `next/font/local` in `app/layout.tsx` |
| Email, phone, address, hours, social link | Admin → Page copy → Contact page & details (seed values in `lib/content/defaults.ts`) |
| Portfolio images and copy | Admin → Portfolio; seed data in `lib/content/defaults.ts`, images in `public/images/portfolio/` |
| Budget ranges and currency (`PLACEHOLDER_BUDGET_RANGES`) | `lib/quote.ts` |
| Admin credentials | `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` |
| Site URL (`PLACEHOLDER_SITE_URL`) | `NEXT_PUBLIC_SITE_URL` |
| Studio facts, process copy, audience cards | `lib/site.ts` |

The images shipped in `public/images/` are generated placeholders, not real
portfolio work — replace them with the studio's own flyers.

## Brand system

All visual tokens live in one `@theme` block in `app/globals.css`: colours
(`brand-primary`, `brand-accent`, `brand-gold`, `brand-ink`, `brand-muted`,
`brand-paper`, `brand-line`, `brand-surface`), fonts (`font-heading`, `font-body`),
radii, and shadows. Components only use these tokens, so changing a value there
updates the whole site.

## Scope boundaries

This project is deliberately limited to the requirements:

- No pricing display, cart, checkout, or payment integration.
- No order management — quote requests are leads that staff answer by email.
- Content management only in the admin area (portfolio, services, page copy) plus a
  read-only quote-request inbox.

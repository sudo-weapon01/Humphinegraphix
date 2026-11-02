# Humphinegraphix

Marketing website and content admin for **Humphinegraphix**, an independent flyer
design studio. Built with Next.js (App Router), React, TypeScript, and Tailwind CSS.

- **Public site** — Home, Services, Portfolio, About, Contact. A lead-generation site:
  visitors request a quote, there is no pricing table, cart, checkout, or payment
  anywhere in the project.
- **Admin area** — protected content editing for portfolio items, services, page
  copy, testimonials, FAQ, and the privacy notice, plus a quote-request inbox with
  triage statuses and CSV export. Edits save as drafts and only reach the live site
  when staff press **Publish**. No redeploy required, and any publish can be rolled
  back from the publish history.
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
| `npm test` | Run the Vitest suite (103 tests). |
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
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Optional | Click-to-chat number, digits only. All WhatsApp buttons hide when blank. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Optional | Cloudflare Turnstile site key for the quote form. |
| `TURNSTILE_SECRET_KEY` | Optional | Turnstile secret key, verified server-side. |

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

**Rotating the admin password** (do this after any shared demo or handover):

1. Generate a new one: `openssl rand -base64 18`.
2. Update `ADMIN_PASSWORD` in your host (Vercel → Settings → Environment Variables)
   and in `.env.local` locally.
3. Redeploy / restart so the new value is picked up (environment changes apply to
   new deployments, not existing ones).
4. Sign in with the new password. Old sessions stay valid until they expire (8h) or
   until you also change `ADMIN_SESSION_SECRET`.

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
They appear under **Admin → Enquiries**, where staff can set a status
(**New → Replied → Archived**) and export everything as CSV. Nothing here charges,
orders, or takes payment; the studio replies by email.

Spam protection is layered, and each layer is independent:

1. **Honeypot** field — bots fill it, humans never see it.
2. **Rate limit** — 6 requests per hour per client IP (`RATE_LIMITS` in
   `lib/ratelimit.ts`). Stored in the `rate_limit_hits` table so it holds across
   serverless instances; falls back to per-process counters locally.
3. **Turnstile** (optional) — enabled by setting both Turnstile keys. Without them
   the check is skipped so local development works unchanged.

Staff sign-in is rate limited too: 5 attempts per 15 minutes per IP, then a 429 with
a retry hint. A successful sign-in clears the counter.

### Publish history and rollback

Every publish snapshots the published bundle into `content_history` (or
`.data/history.json`, newest 20 kept). **Publish history & rollback** in the admin
header lists them, and restoring one copies that snapshot back into the published
slot and revalidates the site — the same path a normal publish takes.

### Draft preview

**Admin → Preview drafts** renders the draft bundle exactly as it will appear after
publishing, with a badge listing which documents are unpublished. It sits behind the
staff session rather than behind a `?preview=1` query flag: a query flag would let
anyone read unpublished content, and keeping previews in the admin area means the
public pages stay static and cacheable.

### Image uploads

**Admin → Portfolio → Upload a new image** posts to `/api/admin/upload`, which
accepts JPEG/PNG/WebP up to 5 MB and stores the file in the public `portfolio`
Storage bucket (or `public/uploads/` when Supabase is not configured). The returned
URL is written into the content document like any other image URL, so publishing and
rollback work unchanged.

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
    privacy/page.tsx         Privacy notice (content-driven)
  og/route.tsx               Generated 1200x630 social cards
  admin/
    login/page.tsx           Staff sign-in (public)
    (studio)/                Authenticated admin area
      layout.tsx             Session guard + admin chrome + publish bar
      page.tsx               Overview
      portfolio/page.tsx     Portfolio CRUD
      services/page.tsx      Services CRUD + flyer types
      pages/page.tsx         Page copy editor
      enquiries/page.tsx     Lead inbox (triage + CSV export)
      preview/page.tsx       Draft preview
  api/
    quote/route.ts           Public quote endpoint
    admin/{login,logout,content,publish,discard,rollback,upload,enquiries}/route.ts
  sitemap.ts robots.ts not-found.tsx icon.svg
components/
  site/                      Header, footer, cards, CTA, gallery, FAQ, testimonials,
                             WhatsApp button, sticky mobile bar, JSON-LD
  forms/QuoteForm.tsx        Client form (validation, states, errors)
  admin/                     Editors, save bar, publish bar, fields
  ui/Button.tsx              Shared button styles
lib/
  content/                   Types, defaults, validation, store, cached reader, path helpers
  auth.ts auth-config.ts session.ts api.ts
  quote.ts validation.ts enquiries.ts supabase.ts site.ts seo.ts
  ratelimit.ts turnstile.ts turnstile-config.ts uploads.ts analytics.ts
middleware.ts                Admin route gate
supabase/schema.sql          Database schema
tests/                       103 Vitest tests
```

---

## Tests

```bash
npm test           # 103 tests
npm run typecheck  # tsc --noEmit
npm run build      # production build
```

| File | Covers |
| --- | --- |
| `tests/quote-validation.test.ts` | Server rules: required fields, email, phone, dates, flyer type allowlist, budget range. |
| `tests/quote-form.test.tsx` | Form rendering, inline errors, accessible error associations, submit payload, success confirmation, API field errors, network failure, loading state. |
| `tests/admin-auth.test.ts` | Session signing/verification, tampering, expiry, credential configuration, middleware redirects and 401s. |
| `tests/admin-api.test.ts` | Admin endpoints refuse unauthenticated calls; drafts stay private; publish makes content public and revalidates; quote endpoint stores valid leads and rejects invalid ones. |
| `tests/content-store.test.ts` | Draft/publish/discard/reset semantics, unknown-field rejection, flyer types flowing to the quote form. |
| `tests/pages.test.tsx` | Key page rendering driven by published content, contact form options, no pricing on Services. |
| `tests/hardening.test.ts` | Rate limiting (allow/block/reset), upload validation, enquiry triage + CSV escaping and formula injection, publish history and rollback, optional Turnstile, security headers. |
| `tests/a11y.test.tsx` | axe-core audit of the home, services, portfolio, privacy and contact pages, the quote form, and the form's error state. |

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

### Current deployment status

This repository is connected to the Vercel project **humphinegraphix**
(team Adv3ntur0s), deploying `main` to production.

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | `nextjs` (also pinned in `vercel.json`) |
| Public URL | `https://humphinegraphix.vercel.app` |
| Environment variables | `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL` (Production, Preview, Development) |
| Content store | Supabase project `bnlaxnagdhgkwushorxa` — `content_docs` (seeded), `quote_requests` (+ `status`), `content_history`, `rate_limit_hits`, `portfolio` Storage bucket |
| Analytics | Vercel Web Analytics — enable it in the project dashboard |

> **If every URL returns Vercel's own 404 ("This page doesn't exist"),** check
> that the project's framework preset is set to **Next.js**
> (Project → Settings → Build & Development Settings → Framework Preset).
> With no preset, Vercel uploads the repository as a static site and no route
> matches — the public pages, `/api/*`, and static files all 404 while the build
> log still shows a successful `next build`. `vercel.json` now pins the preset so
> a recreated project picks it up automatically. Redeploy after changing it.

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

## Search, social, and analytics

- **Metadata** — `lib/seo.ts` gives every page a canonical URL, Open Graph, and
  Twitter card. Social cards come from `app/og/route.tsx`, which renders a
  correctly sized **1200×630** image per page with that page's headline.
- **Structured data** — `components/site/JsonLd.tsx` emits schema.org
  `ProfessionalService` (name, email, phone, address, area served, services).
  It intentionally omits `priceRange` and offers: the site publishes no prices.
- **Sitemap / robots** — `app/sitemap.ts` and `app/robots.ts`; `/admin` and `/api`
  are disallowed and admin pages send `noindex`.
- **Analytics** — Vercel Web Analytics is loaded from Vercel's own first-party
  script (`components/site/VercelAnalytics.tsx`) rather than the npm package, so no
  extra dependency or peer-version risk. `lib/analytics.ts` records the quote funnel
  (`quote_form_started` → `quote_form_submitted` → `quote_form_succeeded` /
  `quote_form_failed`), WhatsApp clicks, and portfolio opens. Every call is a no-op
  outside Vercel, so local development and tests stay clean.
  **Turn it on** in Vercel: Project → Analytics → Enable.

## Security headers

`next.config.ts` sets, on every response:

| Header | Value |
| --- | --- |
| `Content-Security-Policy` | `default-src 'self'`; inline scripts/styles allowed (Next.js needs them); Turnstile and Supabase are the only third parties; `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'self'` |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | camera, microphone, geolocation, payment all off |

If you add a new third party (fonts hosted elsewhere, an embed, a video), add its
origin to the matching directive in `next.config.ts` or it will be blocked.

## Accessibility

- Semantic landmarks, one `h1` per page, and a valid heading order (checked by axe).
- Every field has a `<label>`; errors are linked with `aria-describedby` and marked
  `aria-invalid`; the error summary is focusable and announced.
- The portfolio lightbox is a real dialog: focus moves into it, Tab is trapped,
  Escape closes it, and focus returns to the card that opened it. Arrow keys move
  between flyers.
- The mobile menu closes on Escape and on navigation.
- `prefers-reduced-motion` disables transitions, smooth scrolling, and the spinner.
- `tests/a11y.test.tsx` runs axe-core over the main pages and the quote form as part
  of the normal test run.

## Replacing the placeholders

Everything the studio still needs to supply is marked in the code and listed here.
Search the repo for `PLACEHOLDER_` and `TODO` to find them.

| Placeholder | Where |
| --- | --- |
| Brand colours (`PLACEHOLDER_BRAND_*`) | `app/globals.css` → `@theme` block |
| Heading and body fonts (`PLACEHOLDER_HEADING_FONT`, `PLACEHOLDER_BODY_FONT`) | `--font-heading` / `--font-body` in `app/globals.css`; the bundled Archivo + Inter imports are in `app/layout.tsx` |
| Email, phone, address, hours, social link | Admin → Page copy → Contact page & details (seed values in `lib/content/defaults.ts`) |
| Portfolio images and copy | Admin → Portfolio; seed data in `lib/content/defaults.ts`, images in `public/images/portfolio/` |
| Budget ranges and currency (`PLACEHOLDER_BUDGET_RANGES`) | `lib/quote.ts` |
| Testimonials (`PLACEHOLDER: client name`) | Admin → Page copy → Testimonials (seed values in `lib/content/defaults.ts`) |
| FAQ answers | Admin → Page copy → FAQ |
| Privacy notice wording | Admin → Page copy → Privacy notice (review it before launch) |
| WhatsApp number (`PLACEHOLDER_WHATSAPP_NUMBER`) | `NEXT_PUBLIC_WHATSAPP_NUMBER` — buttons hide while it is blank |
| Turnstile keys | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` |
| Admin credentials | `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` |
| Site URL (`PLACEHOLDER_SITE_URL`) | `NEXT_PUBLIC_SITE_URL` |
| Studio facts, process copy, audience cards | `lib/site.ts` |

The images shipped in `public/images/` are generated placeholders, not real
portfolio work — replace them with the studio's own flyers.

## Brand system

The visual direction is **print studio**: expanded grotesk headlines, monospaced
technical labels, hairline rules, square corners, warm paper stock, and one loud
signal red used for marks and accents.

All visual tokens live in one `@theme` block in `app/globals.css`: colours
(`brand-primary`, `brand-accent`, `brand-gold`, `brand-ink`, `brand-muted`,
`brand-paper`, `brand-line`, `brand-surface`), fonts (`font-heading`, `font-body`,
`font-mono`), radii, and shadows. Components only use these tokens, so changing a
value there updates the whole site.

| Token | Placeholder value | Notes |
| --- | --- | --- |
| `PLACEHOLDER_BRAND_PRIMARY` | `#131211` ink | Text, dark blocks, footer |
| `PLACEHOLDER_BRAND_ACCENT` | `#ff3b00` signal red | Fills, rules, large display type (3.1:1 — never small text) |
| `PLACEHOLDER_BRAND_ACCENT_STRONG` | `#b62b00` | Small accent text (5.5:1 on paper) |
| `PLACEHOLDER_BRAND_SECONDARY` | `#e4c87f` chalk gold | Labels on the ink footer (11.5:1) |
| `PLACEHOLDER_BRAND_PAPER` | `#f3efe6` | Page background |
| `PLACEHOLDER_BRAND_LINE` | `#d3ccbc` | Hairlines |

Type is self-hosted, so there is no third-party font request at runtime:

- `PLACEHOLDER_HEADING_FONT` — **Archivo Variable** (`@fontsource-variable/archivo`,
  used with its width axis for expanded headlines and condensed mastheads).
- `PLACEHOLDER_BODY_FONT` — **Inter Variable** (`@fontsource-variable/inter`).
- Monospaced labels use the system mono stack (`--font-mono`).

To use the studio's licensed faces, install them, import the CSS in
`app/layout.tsx`, and change the two font tokens. Layout primitives that give the
site its rhythm are also in `globals.css`: `.display`, `.display-cond`, `.label`,
`.index`, `.rule`, `.rails`, `.field-input`, `.link-draw`, `.marquee-track`.

## Scope boundaries

This project is deliberately limited to the requirements:

- No pricing display, cart, checkout, or payment integration.
- No order management — quote requests are leads that staff answer by email.
- Content management only in the admin area (portfolio, services, page copy) plus a
  read-only quote-request inbox.

## Deployment smoke test

After deploying, these URLs should all answer:

| URL | Expected |
| --- | --- |
| `/` | 200, home page |
| `/portfolio` | 200, filter chips + 7 flyers |
| `/privacy` | 200, five sections |
| `/admin` | 307 → `/admin/login` |
| `/robots.txt` | `Disallow: /admin` |
| `/og?format=json&title=Test` | `{"ok":true,"width":1200,"height":630,...}` — proves the social-card renderer works |

`/og` also accepts `format=json` so a deployment can verify image rendering without
an image viewer; public pages never send that parameter.

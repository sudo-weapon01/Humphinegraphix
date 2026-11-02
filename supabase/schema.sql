-- ---------------------------------------------------------------------------
-- Humphinegraphix content + enquiries schema
--
-- Run once in the Supabase SQL editor (or `supabase db push`) for the project
-- referenced by SUPABASE_URL.
--
-- Both tables have RLS enabled with no policies, and the app only ever reaches
-- them with the service-role key from server-side code. That means the anon /
-- publishable key cannot read or write site content or enquiries.
-- ---------------------------------------------------------------------------

create table if not exists public.content_docs (
  key text primary key check (key in ('pages', 'services', 'portfolio')),
  draft jsonb not null,
  published jsonb not null,
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

comment on table public.content_docs is
  'Editable site content. Public pages read "published"; the admin area edits "draft" and publishes explicitly.';

create table if not exists public.quote_requests (
  id text primary key,
  name text not null,
  email text not null,
  phone text,
  flyer_type text not null,
  event_date date,
  budget_range text not null,
  deadline date,
  message text not null,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

comment on table public.quote_requests is
  'Leads from the public quote form. No pricing, ordering, or payment data is stored.';

create index if not exists quote_requests_submitted_at_idx
  on public.quote_requests (submitted_at desc);

alter table public.content_docs enable row level security;
alter table public.quote_requests enable row level security;

-- Deliberately no policies: service role only.

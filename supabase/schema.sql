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

-- ---------------------------------------------------------------------------
-- Added with the launch-hardening pass
-- ---------------------------------------------------------------------------

-- Enquiry triage: staff mark requests as replied / archived.
alter table public.quote_requests
  add column if not exists status text not null default 'new';

do $$
begin
  alter table public.quote_requests
    add constraint quote_requests_status_check
    check (status in ('new', 'replied', 'archived'));
exception
  when duplicate_object then null;
end $$;

-- Publish history, so a bad publish can be rolled back in one click.
create table if not exists public.content_history (
  id bigserial primary key,
  published_at timestamptz not null default now(),
  published_by text,
  snapshot jsonb not null,
  note text
);

create index if not exists content_history_published_at_idx
  on public.content_history (published_at desc);

alter table public.content_history enable row level security;

-- Rate limiting (fixed window counters, used by sign-in and the quote form).
create table if not exists public.rate_limit_hits (
  key text primary key,
  count integer not null default 0,
  expires_at timestamptz not null
);

alter table public.rate_limit_hits enable row level security;

create or replace function public.hit_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns table (allowed boolean, current_count integer, retry_after integer)
language plpgsql
as $$
declare
  v_count integer;
  v_expires timestamptz;
begin
  insert into public.rate_limit_hits (key, count, expires_at)
  values (p_key, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (key) do update
    set count = case
          when public.rate_limit_hits.expires_at <= now() then 1
          else public.rate_limit_hits.count + 1
        end,
        expires_at = case
          when public.rate_limit_hits.expires_at <= now() then now() + make_interval(secs => p_window_seconds)
          else public.rate_limit_hits.expires_at
        end
  returning count, expires_at into v_count, v_expires;

  return query
    select v_count <= p_limit,
           v_count,
           greatest(1, ceil(extract(epoch from (v_expires - now())))::integer);
end;
$$;

-- Public bucket for portfolio images uploaded from the admin area.
-- Writes still go through the service-role key on the server only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio',
  'portfolio',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

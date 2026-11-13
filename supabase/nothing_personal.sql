-- Run this file in the Supabase SQL Editor before accepting pre-orders.
-- The table name is the project's name, with the hyphen replaced by an underscore.
create table if not exists public.nothing_personal (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  timestamp_ist timestamp without time zone not null,
  name text not null check (char_length(name) between 2 and 80),
  email text not null unique check (char_length(email) <= 120 and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$'),
  country text not null check (country ~ '^[A-Z]{2}$'),
  phone text not null unique check (phone ~ '^\+[0-9]{8,15}$'),
  size text not null check (size in ('S', 'M', 'L', 'XL', 'XXL')),
  qty integer not null check (qty between 1 and 5),
  currency text not null check (currency in ('INR', 'USD')),
  intent text not null default '' check (intent in ('', 'instant', 'likely', 'maybe')),
  source text not null default '' check (char_length(source) <= 40),
  utm_source text not null default '' check (char_length(utm_source) <= 60),
  utm_campaign text not null default '' check (char_length(utm_campaign) <= 60)
);

alter table public.nothing_personal enable row level security;

-- Public visitors can submit a row but cannot list, update, or delete signups.
revoke all on table public.nothing_personal from public, anon, authenticated;
grant usage on schema public to anon;
grant insert (timestamp_ist, name, email, country, phone, size, qty,
  currency, intent, source, utm_source, utm_campaign)
  on table public.nothing_personal to anon;

drop policy if exists "Public preorder submission" on public.nothing_personal;
create policy "Public preorder submission"
  on public.nothing_personal
  for insert
  to anon
  with check (true);

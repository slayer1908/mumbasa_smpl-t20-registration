-- =========================================================
-- SMPL T20 Kenya Tour Registration — Supabase Schema
-- =========================================================
-- Run this entire file in the Supabase SQL Editor
-- (Project -> SQL Editor -> New Query -> paste -> Run)
-- =========================================================

-- Required for gen_random_uuid()
create extension if not exists "pgcrypto";

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  whatsapp text not null,
  email text not null,
  city_country text not null,
  player_role text not null,
  batting_style text not null,
  bowling_style text not null,
  payment_method text not null,
  utr_transaction_id text not null,
  payment_sender_name text not null,
  payment_proof_path text,
  payment_status text not null default 'pending',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint payment_status_check
    check (payment_status in ('pending', 'verified', 'rejected'))
);

-- Keep updated_at fresh on every row update
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_registrations_updated_at on public.registrations;
create trigger trg_registrations_updated_at
before update on public.registrations
for each row
execute function public.set_updated_at();

-- Helpful index for admin filtering/sorting
create index if not exists idx_registrations_created_at
  on public.registrations (created_at desc);

create index if not exists idx_registrations_payment_status
  on public.registrations (payment_status);

-- =========================================================
-- Row Level Security
-- =========================================================
-- The app NEVER talks to Supabase from the browser for this
-- table — all reads/writes go through Next.js API routes using
-- the service role key (which bypasses RLS). We still enable
-- RLS and add no public policies, so the anon/public key (if
-- ever exposed) cannot read or write this table directly.

alter table public.registrations enable row level security;

-- No policies are created intentionally: this blocks all access
-- via the anon/public API key. Only the service role key
-- (used server-side only) can access this table.

-- =========================================================
-- Storage bucket: registration-proofs
-- =========================================================
-- Create the bucket itself from the Supabase Dashboard:
--   Storage -> New bucket -> name: registration-proofs -> Private
-- (Do NOT mark it public — proofs are only ever accessed via
-- short-lived signed URLs generated server-side for the admin.)
--
-- No storage policies are required for the anon key because all
-- uploads and signed URL generation happen server-side using the
-- service role key, which bypasses storage RLS as well.
--
-- If you prefer to create the bucket via SQL instead of the
-- dashboard, you can run:
--
-- insert into storage.buckets (id, name, public)
-- values ('registration-proofs', 'registration-proofs', false)
-- on conflict (id) do nothing;

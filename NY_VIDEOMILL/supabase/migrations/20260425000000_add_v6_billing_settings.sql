-- ─────────────────────────────────────────────────────────────────────────────
-- v6.0 Brukerinnstillinger + Billing
-- ─────────────────────────────────────────────────────────────────────────────

-- Utvid user_settings med v6.0 felt
alter table public.user_settings
add column if not exists voice_id text,
add column if not exists tts_type text not null default 'elevenlabs',
add column if not exists music_service text not null default 'epidemic',
add column if not exists include_music boolean not null default true,
add column if not exists include_captions boolean not null default false,
add column if not exists default_aspect_ratio text not null default '9:16',
add column if not exists elevenlabs_api_key text,
add column if not exists epidemic_api_key text;

-- ─────────────────────────────────────────────────────────────────────────────
-- billing - Abonnement / betaling
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.billing (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  plan_type         text not null check (plan_type in ('subscription', 'per_video', 'credits')),
  plan_name         text, -- Starter, Pro, Enterprise, Standard, Premium, Express
  status           text not null default 'active' check (status in ('active', 'paused', 'cancelled', 'expired')),
  price            integer not null, -- i NOK
  credits_used     integer not null default 0,
  credits_remaining integer,
  videos_this_month integer not null default 0,
  start_date       date not null default current_date,
  end_date         date,
  auto_renew       boolean not null default true,
  created_at       timestamptz not null default now()
);

alter table public.billing enable row level security;

create policy "billing: owner read" on public.billing for select using (auth.uid() = user_id);
create policy "billing: owner insert" on public.billing for insert with check (auth.uid() = user_id);
create policy "billing: owner update" on public.billing for update using (auth.uid() = user_id);

-- Service role tilgang
create policy "billing: service role all" on public.billing for all using (auth.jwt() ->> 'role' = 'service_role');

-- ─────────────────────────────────────────────────────────────────────────────
-- credits — for credits-basert betaling
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.credits (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  amount          integer not null, -- antall credits kjøpt
  used            integer not null default 0,
  price           integer not null, -- NOK betalt
  purchase_date   timestamptz not null default now(),
  expires_at      date, -- null = aldri utløper
  payment_id     text -- Stripe payment ID
);

alter table public.credits enable row level security;

create policy "credits: owner read" on public.credits for select using (auth.uid() = user_id);
create policy "credits: owner insert" on public.credits for insert with check (auth.uid() = user_id);
create policy "credits: service role all" on public.credits for all using (auth.jwt() ->> 'role' = 'service_role');

-- ─────────────────────────────────────────────────────────────────────────────
-- admin_users — roller for ansatte
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.admin_users (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete set null,
  email           text not null,
  role            text not null check (role in ('COO', 'CFO', 'CISO', 'Marketing', 'IT', 'Support', 'Admin')),
  is_active       boolean not null default true,
  created_at     timestamptz not null default now(),
  unique (email)
);

alter table public.admin_users enable row level security;

create policy "admin_users: read" on public.admin_users for select using (true);
create policy "admin_users: insert" on public.admin_users for insert with check (auth.jwt() ->> 'role' = 'service_role');
create policy "admin_users: update" on public.admin_users for update using (auth.jwt() ->> 'role' = 'service_role');

comment on table public.admin_users is 'Ansattroller: COO, CFO, CISO, Marketing, IT, Support, Admin';
comment on table public.billing is 'Brukeres abonnement/per video/credits';
comment on table public.credits is 'Kjøpte credits til videoer';
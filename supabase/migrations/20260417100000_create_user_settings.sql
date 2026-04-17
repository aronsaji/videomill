-- ─────────────────────────────────────────────────────────────────────────────
-- user_settings — per-bruker konfigurasjon (n8n, språk, preferanser)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.user_settings (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  n8n_webhook_url text,
  n8n_enabled     boolean not null default false,
  language        text not null default 'nb',
  auto_distribute boolean not null default true,
  ai_reply_enabled boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id)
);

-- RLS: kun eieren kan lese/skrive sine egne innstillinger
alter table public.user_settings enable row level security;

create policy "user_settings: owner read"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "user_settings: owner insert"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create policy "user_settings: owner update"
  on public.user_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_settings: owner delete"
  on public.user_settings for delete
  using (auth.uid() = user_id);

-- Service role (Edge Function) kan lese alle rader for webhook-oppslag
create policy "user_settings: service role read"
  on public.user_settings for select
  to service_role
  using (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- trending_topics — AI-genererte trender fra n8n / Ollama
-- Kolonnenavn matcher n8n-pipelines "Parse Trends"-node (etter ny mapping)
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.trending_topics (
  id              uuid        primary key default gen_random_uuid(),
  title           text        not null,
  platform        text,
  category        text,
  viral_score     int         not null default 0,
  heat_level      text,
  growth_stat     text,
  tags            text[],
  target_audience text,
  active          boolean     not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── Legg til manglende kolonner for eksisterende tabeller ──
alter table public.trending_topics add column if not exists platform        text;
alter table public.trending_topics add column if not exists category        text;
alter table public.trending_topics add column if not exists viral_score     int  default 0;
alter table public.trending_topics add column if not exists heat_level      text;
alter table public.trending_topics add column if not exists growth_stat     text;
alter table public.trending_topics add column if not exists target_audience text;
alter table public.trending_topics add column if not exists updated_at      timestamptz default now();

-- ── Legg til rank/heat/reason-kolonner for bakoverkompatibilitet med gammel n8n ──
-- (disse mappes ved hjelp av GENERATED ALWAYS AS eller View hvis nødvendig)
-- Foreløpig: legg bare til kolonner slik at gammel n8n ikke krasjer med ukjente kolonner
alter table public.trending_topics add column if not exists rank            int;
alter table public.trending_topics add column if not exists heat            text;
alter table public.trending_topics add column if not exists reason          text;

-- ── Indeks for rask uthenting av aktive trender ──
create index if not exists idx_trending_topics_active_score
  on public.trending_topics (active, viral_score desc);

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.trending_topics enable row level security;

-- Alle innloggede brukere kan lese aktive trender
create policy if not exists "trending_topics: authenticated read"
  on public.trending_topics for select
  to authenticated
  using (active = true);

-- Service role (n8n) har full tilgang
create policy if not exists "trending_topics: service role all"
  on public.trending_topics for all
  to service_role
  using (true)
  with check (true);

-- ── Auto-oppdater updated_at ──────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_trending_topics_updated_at on public.trending_topics;
create trigger trg_trending_topics_updated_at
  before update on public.trending_topics
  for each row execute function public.set_updated_at();

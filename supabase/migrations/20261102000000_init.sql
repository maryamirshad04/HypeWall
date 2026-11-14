-- HypeWall schema for Supabase (Postgres + Storage).
-- Run once in the Supabase SQL editor, or with `supabase db push`.
--
-- The browser never talks to these tables. Only the Express API does, with the
-- service role key, so row level security is switched on with no policies:
-- the public anon key can read or write nothing.

-- ─── Walls ────────────────────────────────────────────────────────────────────
create table if not exists public.boards (
  id               uuid primary key,
  aesthetic        text not null default 'professional',
  recipient_name   text not null default 'Someone Special',
  bg_image         text,                       -- Storage URL (or null)
  bg_audio         text,                       -- Storage URL (or null)
  join_code        text not null unique,
  view_token       uuid not null unique,
  creator_key_hash text,                       -- sha256 of the creator key; null for walls made before keys
  occasion         text,
  wrapper          text,
  reveal_style     text,
  bg_choice        text,
  music_track      text,
  unlock_at        timestamptz,
  allow_anonymous  boolean not null default true,
  contributor_link text not null,
  view_link        text not null,
  created_at       timestamptz not null default now()
);

-- ─── Notes ────────────────────────────────────────────────────────────────────
create table if not exists public.comments (
  id         uuid primary key,
  board_id   uuid not null references public.boards (id) on delete cascade,
  author     text not null default 'Anonymous',
  message    text not null default '',
  color      text not null default '#FFD700',
  gif        text,                             -- Storage URL (or null)
  audio      text,                             -- Storage URL (or null)
  font       text not null default 'hand',
  shape      text not null default 'sticky',
  stickers   text[] not null default '{}',
  hidden     boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists comments_board_created_idx on public.comments (board_id, created_at);

-- ─── Reports from recipients ──────────────────────────────────────────────────
create table if not exists public.reports (
  id         uuid primary key,
  board_id   uuid not null references public.boards (id) on delete cascade,
  comment_id uuid not null,
  reason     text not null default '',
  created_at timestamptz not null default now()
);

-- ─── Rate limit counters ──────────────────────────────────────────────────────
create table if not exists public.rate_limits (
  key        text primary key,
  count      integer not null default 0,
  expires_at timestamptz not null
);

-- Atomically bumps a fixed-window counter and returns the new count.
-- Now and then it sweeps expired counters so the table stays small.
create or replace function public.hit_rate_limit(p_key text, p_expires_at timestamptz)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  insert into rate_limits as r (key, count, expires_at)
  values (p_key, 1, p_expires_at)
  on conflict (key) do update set count = r.count + 1
  returning r.count into new_count;

  if random() < 0.02 then
    delete from rate_limits where expires_at < now();
  end if;

  return new_count;
end;
$$;

revoke all on function public.hit_rate_limit(text, timestamptz) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, timestamptz) to service_role;

-- ─── Lock the tables to the API ───────────────────────────────────────────────
alter table public.boards      enable row level security;
alter table public.comments    enable row level security;
alter table public.reports     enable row level security;
alter table public.rate_limits enable row level security;

-- ─── Media bucket ─────────────────────────────────────────────────────────────
-- Public read (file names are random UUIDs), uploads only through signed URLs
-- that the API hands out. 10 MB per file, images and audio only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/*', 'audio/*'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

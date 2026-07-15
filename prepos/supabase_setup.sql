-- PrepOS Cloud Sync — Run this once in Supabase SQL Editor

create table if not exists prepos_resources (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  primary key (id, user_id)
);

create table if not exists prepos_revisions (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  primary key (id, user_id)
);

create table if not exists prepos_settings (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  primary key (id, user_id)
);

alter table prepos_resources enable row level security;
alter table prepos_revisions enable row level security;
alter table prepos_settings enable row level security;

create policy "Users manage their own resources"
  on prepos_resources for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own revisions"
  on prepos_revisions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own settings"
  on prepos_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Study Session Tracker (Focus Timer)
create table if not exists prepos_sessions (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  duration_seconds integer not null,
  created_at timestamptz not null default now()
);

alter table prepos_sessions enable row level security;

create policy "Users manage their own sessions"
  on prepos_sessions for all
  using (auth.jwt() ->> 'email' = user_email)
  with check (auth.jwt() ->> 'email' = user_email);


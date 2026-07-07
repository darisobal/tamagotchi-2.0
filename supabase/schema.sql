-- One row per user; stores the full app snapshot as JSON.
create table if not exists public.user_snapshots (
  user_id uuid primary key references auth.users (id) on delete cascade,
  snapshot jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_snapshots enable row level security;

create policy "read own snapshot"
  on public.user_snapshots for select
  using (auth.uid() = user_id);

create policy "insert own snapshot"
  on public.user_snapshots for insert
  with check (auth.uid() = user_id);

create policy "update own snapshot"
  on public.user_snapshots for update
  using (auth.uid() = user_id);

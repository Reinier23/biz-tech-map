-- Create audit_log table for tracking user events
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  timestamp timestamptz not null default now(),
  actor text not null,
  event_type text not null,
  details jsonb not null default '{}'::jsonb
);

-- Enable RLS
alter table public.audit_log enable row level security;

-- Helpful index for per-user queries sorted by newest first
create index if not exists idx_audit_log_actor_ts on public.audit_log (actor, timestamp desc);

-- Policies: only authenticated users can insert/select their own logs
create policy if not exists "Authenticated users can insert their own logs"
  on public.audit_log
  for insert
  to authenticated
  with check (
    actor = auth.uid()::text
    or actor = coalesce((current_setting('request.jwt.claims', true)::jsonb ->> 'email'), '')
  );

create policy if not exists "Authenticated users can view their own logs"
  on public.audit_log
  for select
  to authenticated
  using (
    actor = auth.uid()::text
    or actor = coalesce((current_setting('request.jwt.claims', true)::jsonb ->> 'email'), '')
  );

-- No update/delete policies: disallow by default under RLS

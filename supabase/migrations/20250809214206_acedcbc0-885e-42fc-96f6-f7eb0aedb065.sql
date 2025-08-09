-- Create UI settings table for lane labels/colors
create table if not exists public.ui_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.ui_settings enable row level security;

-- Read for everyone
create policy "ui_settings are publicly readable"
  on public.ui_settings for select using (true);

-- Write for authenticated only
create policy "Authenticated can upsert ui_settings"
  on public.ui_settings for insert with check (auth.role() = 'authenticated');

create policy "Authenticated can update ui_settings"
  on public.ui_settings for update using (auth.role() = 'authenticated');

create policy "Authenticated can delete ui_settings"
  on public.ui_settings for delete using (auth.role() = 'authenticated');

-- Allow authenticated writes on cost tables
-- tool_cost_defaults
create policy "Authenticated can insert tool cost defaults"
  on public.tool_cost_defaults for insert with check (auth.role() = 'authenticated');

create policy "Authenticated can update tool cost defaults"
  on public.tool_cost_defaults for update using (auth.role() = 'authenticated');

create policy "Authenticated can delete tool cost defaults"
  on public.tool_cost_defaults for delete using (auth.role() = 'authenticated');

-- category_cost_fallbacks
create policy "Authenticated can insert category cost fallbacks"
  on public.category_cost_fallbacks for insert with check (auth.role() = 'authenticated');

create policy "Authenticated can update category cost fallbacks"
  on public.category_cost_fallbacks for update using (auth.role() = 'authenticated');

create policy "Authenticated can delete category cost fallbacks"
  on public.category_cost_fallbacks for delete using (auth.role() = 'authenticated');
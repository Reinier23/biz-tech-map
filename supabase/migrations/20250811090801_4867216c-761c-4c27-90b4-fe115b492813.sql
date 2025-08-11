-- 1) Ensure pg_trgm extension for fuzzy search
create extension if not exists pg_trgm;

-- 1a) Create/alter tools_catalog schema: add missing columns without dropping existing data
alter table if exists public.tools_catalog
  add column if not exists popularity integer default 0,
  add column if not exists aliases text[] default '{}'::text[],
  add column if not exists keywords text[] default '{}'::text[],
  add column if not exists logo_url text;

-- Ensure id is text currently; we won't change type to uuid to avoid data loss. Keep existing id as is.
-- Ensure domain is unique where present
create unique index if not exists tools_catalog_domain_unique on public.tools_catalog ((lower(domain))) where domain is not null;

-- 1b) Triggers to keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists trg_tools_catalog_updated_at on public.tools_catalog;
create trigger trg_tools_catalog_updated_at
before update on public.tools_catalog
for each row execute function public.set_updated_at();

-- 1c) Fuzzy search indexes using pg_trgm
create index if not exists idx_tools_catalog_name_trgm on public.tools_catalog using gin (name gin_trgm_ops);
create index if not exists idx_tools_catalog_domain_trgm on public.tools_catalog using gin (domain gin_trgm_ops);
create index if not exists idx_tools_catalog_aliases_gin on public.tools_catalog using gin (aliases);
create index if not exists idx_tools_catalog_keywords_gin on public.tools_catalog using gin (keywords);

-- 1d) View that expands searchable text (name/aliases/keywords)
create or replace view public.tools_catalog_search_v as
select
  t.id,
  t.name,
  t.domain,
  t.category,
  t.description,
  t.logo_url,
  t.popularity,
  unnest(coalesce(t.aliases, array[]::text[])) as alias,
  unnest(coalesce(t.keywords, array[]::text[])) as keyword
from public.tools_catalog t;

-- 2) Replace RPC search_tools with fuzzy search and popularity fallback
create or replace function public.search_tools(q text, lim integer default 10)
returns table(name text, domain text, category text, description text, logo_url text)
language sql
stable
set search_path = public
as $$
  with allowed as (
    select array[
      'Marketing','Sales','Service','Comms','Project Management','Development','Dev/IT',
      'Analytics','Finance','ERP','Security','Ecommerce','Data','Ops/NoCode','Knowledge','HR'
    ] as cats
  ),
  base as (
    select 
      t.name,
      t.domain,
      t.category,
      t.description,
      t.logo_url,
      t.popularity,
      greatest(
        coalesce(similarity(lower(t.name), lower(coalesce(q, ''))), 0),
        case when q is null or length(q) < 2 then 0 else 0 end
      ) as sim_name,
      case when q is null or length(q) < 2 then 0 else coalesce(similarity(lower(coalesce(t.domain,'')), lower(q)), 0) end as sim_domain,
      case when q is null or length(q) < 2 then 0 else (
        select max(similarity(lower(a), lower(q))) from unnest(coalesce(t.aliases, array[]::text[])) as a
      ) end as sim_alias,
      case when q is null or length(q) < 2 then 0 else (
        select max(similarity(lower(k), lower(q))) from unnest(coalesce(t.keywords, array[]::text[])) as k
      ) end as sim_kw,
      -- simple ilike boosts
      case when q is not null and length(q) >= 2 and lower(t.name) like lower(q)||'%' then 0.2 else 0 end as boost_prefix,
      case when q is not null and length(q) >= 2 and lower(t.name) like '%'||lower(q)||'%' then 0.1 else 0 end as boost_contains
    from public.tools_catalog t, allowed a
    where t.category = any(a.cats)
  ), ranked as (
    select 
      name, domain, category, description, logo_url,
      case when q is null or length(q) < 2 then 0 else greatest(sim_name, coalesce(sim_domain,0), coalesce(sim_alias,0), coalesce(sim_kw,0)) end
        + boost_prefix + boost_contains as score,
      popularity
    from base
  )
  select name, domain, category, description, logo_url
  from ranked
  where (
    q is null or length(q) < 2
  )
  order by popularity desc nulls last, name asc
  limit case when lim is null or lim < 1 then 10 else lim end
  union all
  select name, domain, category, description, logo_url
  from ranked
  where q is not null and length(q) >= 2
  order by score desc nulls last, popularity desc nulls last, name asc
  limit case when lim is null or lim < 1 then 10 else lim end
$$;

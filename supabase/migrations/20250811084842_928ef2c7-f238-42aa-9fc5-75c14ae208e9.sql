-- Update search_tools function to filter by SaaS allowlist and maintain relevance
CREATE OR REPLACE FUNCTION public.search_tools(q text, lim integer DEFAULT 10)
RETURNS TABLE(name text, domain text, category text, description text)
LANGUAGE sql
STABLE
AS $$
  WITH allowed AS (
    SELECT ARRAY[
      'Marketing','Sales','Service','Comms','Project Management','Development','Dev/IT',
      'Analytics','Finance','ERP','Security','Ecommerce','Data','Ops/NoCode','Knowledge'
    ] AS cats
  )
  SELECT
    t.name,
    t.domain,
    t.category,
    t.description
  FROM public.tools_catalog t, allowed a
  WHERE (
    q = ''
    OR lower(t.name) = lower(q)
    OR lower(coalesce(t.domain, '')) = lower(q)
    OR lower(t.name) LIKE lower(q) || '%'
    OR lower(coalesce(t.domain, '')) LIKE lower(q) || '%'
    OR lower(t.name) LIKE '%' || lower(q) || '%'
    OR lower(coalesce(t.domain, '')) LIKE '%' || lower(q) || '%'
    OR lower(coalesce(t.description, '')) LIKE '%' || lower(q) || '%'
  )
  AND t.category = ANY(a.cats)
  ORDER BY
    CASE
      WHEN lower(t.name) = lower(q) OR lower(coalesce(t.domain, '')) = lower(q) THEN 100
      WHEN lower(t.name) LIKE lower(q) || '%' OR lower(coalesce(t.domain, '')) LIKE lower(q) || '%' THEN 80
      WHEN lower(t.name) LIKE '%' || lower(q) || '%' OR lower(coalesce(t.domain, '')) LIKE '%' || lower(q) || '%' THEN 60
      WHEN lower(coalesce(t.description, '')) LIKE '%' || lower(q) || '%' THEN 30
      ELSE 0
    END DESC,
    t.name ASC
  LIMIT lim;
$$;
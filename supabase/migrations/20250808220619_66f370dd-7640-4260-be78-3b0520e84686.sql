-- Update get_integrations function to set a fixed search_path
CREATE OR REPLACE FUNCTION public.get_integrations(a text)
RETURNS TABLE (source text, target text, relation_type text)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT 
    a::text AS source,
    CASE WHEN i.tool_a = a THEN i.tool_b ELSE i.tool_a END AS target,
    i.relation_type
  FROM public.integrations_catalog i
  WHERE i.tool_a = a OR i.tool_b = a
$$;
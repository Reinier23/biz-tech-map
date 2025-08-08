-- Create table for tool integrations
CREATE TABLE IF NOT EXISTS public.integrations_catalog (
  tool_a text NOT NULL,
  tool_b text NOT NULL,
  relation_type text NOT NULL CHECK (relation_type IN ('sends','syncs','auth')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT integrations_catalog_pkey PRIMARY KEY (tool_a, tool_b, relation_type)
);

-- Enable Row Level Security
ALTER TABLE public.integrations_catalog ENABLE ROW LEVEL SECURITY;

-- Public read policy (catalog should be readable by everyone)
CREATE POLICY IF NOT EXISTS "Integrations catalog is publicly readable"
ON public.integrations_catalog
FOR SELECT
USING (true);

-- Optional indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_integrations_tool_a ON public.integrations_catalog(tool_a);
CREATE INDEX IF NOT EXISTS idx_integrations_tool_b ON public.integrations_catalog(tool_b);

-- Seed minimal validation data
INSERT INTO public.integrations_catalog (tool_a, tool_b, relation_type)
VALUES
  ('Salesforce', 'Marketo', 'syncs'),
  ('Zendesk', 'Slack', 'sends')
ON CONFLICT DO NOTHING;

-- RPC to get integrations for a tool, returning edges with the given tool as the source
CREATE OR REPLACE FUNCTION public.get_integrations(a text)
RETURNS TABLE (source text, target text, relation_type text)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    a::text AS source,
    CASE WHEN i.tool_a = a THEN i.tool_b ELSE i.tool_a END AS target,
    i.relation_type
  FROM public.integrations_catalog i
  WHERE i.tool_a = a OR i.tool_b = a
$$;
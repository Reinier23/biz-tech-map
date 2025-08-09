-- 1) Create tool_cost_defaults table
CREATE TABLE IF NOT EXISTS public.tool_cost_defaults (
  name text PRIMARY KEY,
  category text NOT NULL,
  cost_mo numeric NOT NULL,
  cost_basis text NOT NULL,
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2) Create category_cost_fallbacks table
CREATE TABLE IF NOT EXISTS public.category_cost_fallbacks (
  category text PRIMARY KEY,
  default_cost_mo numeric NOT NULL,
  cost_basis text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tool_cost_defaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_cost_fallbacks ENABLE ROW LEVEL SECURITY;

-- Read-only policies (allow SELECT for anon & authenticated)
DROP POLICY IF EXISTS "Public can read tool cost defaults" ON public.tool_cost_defaults;
CREATE POLICY "Public can read tool cost defaults"
ON public.tool_cost_defaults
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "Public can read category cost fallbacks" ON public.category_cost_fallbacks;
CREATE POLICY "Public can read category cost fallbacks"
ON public.category_cost_fallbacks
FOR SELECT
TO anon, authenticated
USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS tool_cost_defaults_name_idx ON public.tool_cost_defaults (lower(name));
CREATE INDEX IF NOT EXISTS tool_cost_defaults_category_idx ON public.tool_cost_defaults (lower(category));
CREATE INDEX IF NOT EXISTS category_cost_fallbacks_category_idx ON public.category_cost_fallbacks (lower(category));

-- Triggers to maintain updated_at
DROP TRIGGER IF EXISTS update_tool_cost_defaults_updated_at ON public.tool_cost_defaults;
CREATE TRIGGER update_tool_cost_defaults_updated_at
BEFORE UPDATE ON public.tool_cost_defaults
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_category_cost_fallbacks_updated_at ON public.category_cost_fallbacks;
CREATE TRIGGER update_category_cost_fallbacks_updated_at
BEFORE UPDATE ON public.category_cost_fallbacks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed data: tool_cost_defaults (UPSERT by name)
INSERT INTO public.tool_cost_defaults (name, category, cost_mo, cost_basis, notes) VALUES
('HubSpot','Marketing',800,'org','Starter+ typical mid-SMB bundle'),
('Marketo','Marketing',1500,'org','Base license'),
('Mailchimp','Marketing',200,'org','Standard 10–25k contacts'),
('Klaviyo','Marketing',300,'org','Email+SMS starter tier'),
('Salesforce','Sales',150,'seat','Sales Enterprise avg per seat'),
('Pipedrive','Sales',25,'seat','Advanced plan'),
('Zendesk','Service',59,'seat','Suite Growth'),
('Intercom','Service',250,'org','Starter'),
('Freshdesk','Service',49,'seat','Pro'),
('Slack','Comms',8,'seat','Pro paid annually'),
('Microsoft Teams','Comms',6,'seat','Included in M365 Business Standard ~'),
('Zoom','Comms',15,'seat','Pro'),
('Jira','Dev/IT',8,'seat','Standard'),
('Asana','Project Management',11,'seat','Starter'),
('Notion','Knowledge',10,'seat','Plus'),
('GitHub','Development',4,'seat','Team'),
('GitLab','Development',19,'seat','Premium'),
('Tableau','Analytics',70,'seat','Creator avg blended'),
('Power BI','Analytics',10,'seat','Pro'),
('Google Analytics','Analytics',0,'org','GA4 free'),
('Mixpanel','Analytics',25,'seat','Growth ~'),
('Amplitude','Analytics',25,'seat','Growth ~'),
('NetSuite','ERP',1200,'org','Base + 5 users (avg)'),
('SAP','ERP',2000,'org','Very rough SMB entry'),
('Odoo','ERP',120,'org','Apps + few users'),
('Okta','Security',6,'seat','Workforce Identity'),
('Auth0','Security',25,'org','MAU-based; proxy seat for MVP'),
('Shopify','Ecommerce',39,'org','Basic'),
('Stripe','Finance',0,'usage','~2.9% + 30¢ per txn'),
('Segment','Data',120,'org','Team starter'),
('Snowflake','Data',200,'org','Light usage avg'),
('BigQuery','Data',100,'org','Light usage avg')
ON CONFLICT (name) DO UPDATE SET
  category = EXCLUDED.category,
  cost_mo = EXCLUDED.cost_mo,
  cost_basis = EXCLUDED.cost_basis,
  notes = EXCLUDED.notes,
  updated_at = now();

-- Seed data: category_cost_fallbacks (UPSERT by category)
INSERT INTO public.category_cost_fallbacks (category, default_cost_mo, cost_basis) VALUES
('Marketing',300,'org'),
('Sales',40,'seat'),
('Service',40,'seat'),
('Comms',7,'seat'),
('Dev/IT',10,'seat'),
('Project Management',10,'seat'),
('Knowledge',8,'seat'),
('Analytics',20,'seat'),
('ERP',500,'org'),
('Security',8,'seat'),
('Finance',50,'org'),
('Ecommerce',40,'org'),
('Data',120,'org')
ON CONFLICT (category) DO UPDATE SET
  default_cost_mo = EXCLUDED.default_cost_mo,
  cost_basis = EXCLUDED.cost_basis,
  updated_at = now();

-- RPC: resolve_tool_cost(name text, category text)
DROP FUNCTION IF EXISTS public.resolve_tool_cost(text, text);
CREATE OR REPLACE FUNCTION public.resolve_tool_cost(name text, category text)
RETURNS TABLE(cost_mo numeric, cost_basis text, source text)
LANGUAGE plpgsql
STABLE
SET search_path TO 'public'
AS $$
BEGIN
  -- Try exact tool match (case-insensitive)
  RETURN QUERY
  SELECT t.cost_mo, t.cost_basis, 'tool'::text
  FROM public.tool_cost_defaults t
  WHERE lower(t.name) = lower(resolve_tool_cost.name)
  LIMIT 1;

  IF FOUND THEN
    RETURN;
  END IF;

  -- Fallback to category default (case-insensitive)
  RETURN QUERY
  SELECT c.default_cost_mo, c.cost_basis, 'category'::text
  FROM public.category_cost_fallbacks c
  WHERE lower(c.category) = lower(resolve_tool_cost.category)
  LIMIT 1;

  IF FOUND THEN
    RETURN;
  END IF;

  -- If neither found, return NULLs
  RETURN QUERY SELECT NULL::numeric, NULL::text, NULL::text;
END;
$$;
-- 1) Create category_playbooks table
CREATE TABLE IF NOT EXISTS public.category_playbooks (
  category text PRIMARY KEY,
  must_have boolean NOT NULL DEFAULT false,
  suggestions text[] NOT NULL DEFAULT '{}'
);

ALTER TABLE public.category_playbooks ENABLE ROW LEVEL SECURITY;

-- Public read policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='category_playbooks' AND policyname='Category playbooks are publicly readable'
  ) THEN
    CREATE POLICY "Category playbooks are publicly readable"
    ON public.category_playbooks
    FOR SELECT
    TO public
    USING (true);
  END IF;
END
$$;

-- Restricted write policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='category_playbooks' AND policyname='Only admins or service role can insert playbooks'
  ) THEN
    CREATE POLICY "Only admins or service role can insert playbooks"
    ON public.category_playbooks
    FOR INSERT
    TO public
    WITH CHECK ((auth.jwt() ->> 'role') = 'service_role' OR public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='category_playbooks' AND policyname='Only admins or service role can update playbooks'
  ) THEN
    CREATE POLICY "Only admins or service role can update playbooks"
    ON public.category_playbooks
    FOR UPDATE
    TO public
    USING ((auth.jwt() ->> 'role') = 'service_role' OR public.has_role(auth.uid(), 'admin'))
    WITH CHECK ((auth.jwt() ->> 'role') = 'service_role' OR public.has_role(auth.uid(), 'admin'));
  END IF;
END
$$;

-- 2) Seed essential categories
INSERT INTO public.category_playbooks (category, must_have, suggestions) VALUES
  ('Sales', true, ARRAY['Salesforce','HubSpot','Pipedrive']),
  ('Service', true, ARRAY['Zendesk','Intercom','Freshdesk']),
  ('Analytics', true, ARRAY['Tableau','Power BI','Looker']),
  ('ERP', true, ARRAY['SAP','Oracle NetSuite','Dynamics 365']),
  ('Marketing', true, ARRAY['Mailchimp','Marketo','HubSpot Marketing']),
  ('HR', false, ARRAY['Workday','BambooHR','Gusto']),
  ('Communication', false, ARRAY['Slack','Microsoft Teams','Zoom']),
  ('Project Management', false, ARRAY['Asana','Trello','Monday.com']),
  ('Finance & Accounting', true, ARRAY['QuickBooks','Xero','FreshBooks']),
  ('Development', false, ARRAY['GitHub','GitLab','Jira'])
ON CONFLICT (category) DO NOTHING;

-- 3) RPC: get_gap_questions(tools_in text[])
CREATE OR REPLACE FUNCTION public.get_gap_questions(tools_in text[])
RETURNS TABLE(category text, suggestions text[])
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  WITH present_categories AS (
    SELECT DISTINCT COALESCE(t.category, 'Other') AS category
    FROM public.tools_catalog t
    WHERE lower(t.name) = ANY(
      SELECT lower(x) FROM unnest(COALESCE(tools_in, ARRAY[]::text[])) AS x
    )
  )
  SELECT cp.category, cp.suggestions
  FROM public.category_playbooks cp
  LEFT JOIN present_categories pc ON pc.category = cp.category
  WHERE pc.category IS NULL
  ORDER BY cp.must_have DESC, cp.category ASC;
$$;
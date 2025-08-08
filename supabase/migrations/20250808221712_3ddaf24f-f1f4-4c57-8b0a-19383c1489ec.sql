-- 1) Create roles enum and user_roles table with RLS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'app_role'
  ) THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow only service_role to manage user_roles via JWT claim
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles' AND policyname = 'Service role can manage roles'
  ) THEN
    CREATE POLICY "Service role can manage roles"
    ON public.user_roles
    AS PERMISSIVE
    FOR ALL
    TO public
    USING ((auth.jwt() ->> 'role') = 'service_role')
    WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');
  END IF;
END
$$;

-- 2) Create SECURITY DEFINER helper to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND ur.role = _role
  );
$$;

-- 3) Tighten tools_catalog RLS
-- Drop permissive write policies if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tools_catalog' AND policyname = 'Authenticated users can insert tools'
  ) THEN
    DROP POLICY "Authenticated users can insert tools" ON public.tools_catalog;
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tools_catalog' AND policyname = 'Authenticated users can update tools'
  ) THEN
    DROP POLICY "Authenticated users can update tools" ON public.tools_catalog;
  END IF;
END
$$;

-- Add restricted write policies (admins or service_role)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tools_catalog' AND policyname = 'Only admins or service role can insert tools'
  ) THEN
    CREATE POLICY "Only admins or service role can insert tools"
    ON public.tools_catalog
    FOR INSERT
    TO public
    WITH CHECK (
      (auth.jwt() ->> 'role') = 'service_role' OR public.has_role(auth.uid(), 'admin')
    );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tools_catalog' AND policyname = 'Only admins or service role can update tools'
  ) THEN
    CREATE POLICY "Only admins or service role can update tools"
    ON public.tools_catalog
    FOR UPDATE
    TO public
    USING (
      (auth.jwt() ->> 'role') = 'service_role' OR public.has_role(auth.uid(), 'admin')
    )
    WITH CHECK (
      (auth.jwt() ->> 'role') = 'service_role' OR public.has_role(auth.uid(), 'admin')
    );
  END IF;
END
$$;

-- 4) Fix tool_suggestions SELECT policy to admin/service_role only
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tool_suggestions' AND policyname = 'Admins can read tool suggestions'
  ) THEN
    DROP POLICY "Admins can read tool suggestions" ON public.tool_suggestions;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tool_suggestions' AND policyname = 'Admins or service role can read tool suggestions'
  ) THEN
    CREATE POLICY "Admins or service role can read tool suggestions"
    ON public.tool_suggestions
    FOR SELECT
    TO public
    USING (
      (auth.jwt() ->> 'role') = 'service_role' OR public.has_role(auth.uid(), 'admin')
    );
  END IF;
END
$$;

-- Keep INSERT open (existing policy already allows INSERT by anyone)

-- 5) Add validation trigger for tool_suggestions.name
CREATE OR REPLACE FUNCTION public.validate_tool_suggestion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.name IS NULL OR length(btrim(NEW.name)) = 0 THEN
    RAISE EXCEPTION 'Tool name is required';
  END IF;

  NEW.name := btrim(NEW.name);

  IF length(NEW.name) > 120 THEN
    RAISE EXCEPTION 'Tool name too long (max 120 characters)';
  END IF;

  -- Allow alphanumerics, spaces, and a small set of safe punctuation
  IF NEW.name !~ '^[A-Za-z0-9][A-Za-z0-9 .+_/()&''-]{0,119}$' THEN
    RAISE EXCEPTION 'Invalid characters in tool name';
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger (INSERT only, since updates are not allowed by RLS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'validate_tool_suggestion_trg'
  ) THEN
    CREATE TRIGGER validate_tool_suggestion_trg
    BEFORE INSERT ON public.tool_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_tool_suggestion();
  END IF;
END
$$;
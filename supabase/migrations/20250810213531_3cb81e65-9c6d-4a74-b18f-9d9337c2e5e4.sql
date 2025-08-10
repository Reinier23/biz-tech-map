-- Create tools table if it doesn't exist, and ensure required columns are present
CREATE TABLE IF NOT EXISTS public.tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  domain TEXT,
  category TEXT NOT NULL,
  confirmed_category TEXT,
  description TEXT,
  logo_url TEXT,
  confidence NUMERIC,
  manual_recommendation TEXT,
  vendor TEXT,
  arch_layer TEXT,
  importance_score INT NOT NULL DEFAULT 3,
  connections JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add columns if the table already existed (safe re-run)
ALTER TABLE public.tools
  ADD COLUMN IF NOT EXISTS vendor TEXT,
  ADD COLUMN IF NOT EXISTS arch_layer TEXT,
  ADD COLUMN IF NOT EXISTS importance_score INT NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS connections JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS confirmed_category TEXT,
  ADD COLUMN IF NOT EXISTS domain TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS confidence NUMERIC,
  ADD COLUMN IF NOT EXISTS manual_recommendation TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_tools_user_id ON public.tools(user_id);
CREATE INDEX IF NOT EXISTS idx_tools_arch_layer ON public.tools(arch_layer);

-- Enable RLS
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- Policies (idempotent creation pattern)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tools' AND policyname = 'Users can view their own tools'
  ) THEN
    CREATE POLICY "Users can view their own tools"
      ON public.tools FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tools' AND policyname = 'Users can insert their own tools'
  ) THEN
    CREATE POLICY "Users can insert their own tools"
      ON public.tools FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tools' AND policyname = 'Users can update their own tools'
  ) THEN
    CREATE POLICY "Users can update their own tools"
      ON public.tools FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'tools' AND policyname = 'Users can delete their own tools'
  ) THEN
    CREATE POLICY "Users can delete their own tools"
      ON public.tools FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Validation trigger to keep importance_score in range and non-null JSONB
CREATE OR REPLACE FUNCTION public.validate_tools()
RETURNS TRIGGER AS $$
BEGIN
  -- normalize importance_score to 1..5, default to 3
  IF NEW.importance_score IS NULL OR NEW.importance_score < 1 OR NEW.importance_score > 5 THEN
    NEW.importance_score := 3;
  END IF;

  -- ensure connections is a JSON array
  IF NEW.connections IS NULL THEN
    NEW.connections := '[]'::jsonb;
  END IF;
  IF jsonb_typeof(NEW.connections) IS DISTINCT FROM 'array' THEN
    NEW.connections := '[]'::jsonb;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Trigger for validation
DROP TRIGGER IF EXISTS validate_tools_before_write ON public.tools;
CREATE TRIGGER validate_tools_before_write
BEFORE INSERT OR UPDATE ON public.tools
FOR EACH ROW EXECUTE FUNCTION public.validate_tools();

-- Updated-at trigger
DROP TRIGGER IF EXISTS update_tools_updated_at ON public.tools;
CREATE TRIGGER update_tools_updated_at
BEFORE UPDATE ON public.tools
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
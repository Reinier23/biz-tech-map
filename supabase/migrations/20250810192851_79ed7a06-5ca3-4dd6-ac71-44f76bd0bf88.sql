-- Tighten shares INSERT policy to authenticated users only
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='shares' AND policyname='Authenticated can insert shares'
  ) THEN
    DROP POLICY "Authenticated can insert shares" ON public.shares;
  END IF;
END $$;

CREATE POLICY "Only authenticated can insert shares"
ON public.shares
FOR INSERT
TO authenticated
WITH CHECK (true);

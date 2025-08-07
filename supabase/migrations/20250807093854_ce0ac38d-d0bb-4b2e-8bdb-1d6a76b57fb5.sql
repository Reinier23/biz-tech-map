-- Enable extensions for UUID and case-insensitive text
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Drop the redundant email index (unique constraint already provides indexing)
DROP INDEX IF EXISTS idx_waitlist_email;

-- Convert email column to CITEXT for case-insensitive matching
ALTER TABLE public.waitlist ALTER COLUMN email TYPE CITEXT;

-- Update SELECT policy to allow service role and admin access
DROP POLICY IF EXISTS "Prevent reading waitlist data" ON public.waitlist;

CREATE POLICY "Allow service role and admin to read waitlist" 
ON public.waitlist 
FOR SELECT 
USING (
  auth.jwt() ->> 'role' = 'service_role' OR 
  auth.jwt() ->> 'role' = 'admin'
);
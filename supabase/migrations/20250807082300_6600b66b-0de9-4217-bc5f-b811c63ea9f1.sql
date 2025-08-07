-- Create waitlist table for email signups
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT DEFAULT 'landing_page',
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert emails (public signup)
CREATE POLICY "Anyone can sign up for waitlist" 
ON public.waitlist 
FOR INSERT 
WITH CHECK (true);

-- Create policy to prevent reading waitlist data (admin only)
CREATE POLICY "Prevent reading waitlist data" 
ON public.waitlist 
FOR SELECT 
USING (false);

-- Create index for faster email lookups
CREATE INDEX idx_waitlist_email ON public.waitlist(email);
CREATE INDEX idx_waitlist_created_at ON public.waitlist(created_at DESC);
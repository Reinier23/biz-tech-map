-- Create tool_suggestions table
CREATE TABLE public.tool_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tool_suggestions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (anyone can suggest tools)
CREATE POLICY "Anyone can suggest tools" 
ON public.tool_suggestions 
FOR INSERT 
WITH CHECK (true);

-- Create policy for admin read access only
CREATE POLICY "Admins can read tool suggestions" 
ON public.tool_suggestions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);
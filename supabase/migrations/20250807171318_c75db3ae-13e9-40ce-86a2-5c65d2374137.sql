-- Create tools_catalog table
CREATE TABLE public.tools_catalog (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  domain TEXT,
  logoUrl TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tools_catalog ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Tools catalog is publicly readable" 
ON public.tools_catalog 
FOR SELECT 
USING (true);

-- Create policies for authenticated users to insert/update (for admin functionality)
CREATE POLICY "Authenticated users can insert tools" 
ON public.tools_catalog 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update tools" 
ON public.tools_catalog 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tools_catalog_updated_at
  BEFORE UPDATE ON public.tools_catalog
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
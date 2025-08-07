-- Add processing tracking columns to tool_suggestions table
ALTER TABLE public.tool_suggestions 
ADD COLUMN processed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN processed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN processing_error TEXT,
ADD COLUMN resolved_domain TEXT;

-- Create index for efficient querying of unprocessed suggestions
CREATE INDEX idx_tool_suggestions_processed ON public.tool_suggestions(processed) WHERE processed = false;

-- Enable pg_cron and pg_net extensions for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
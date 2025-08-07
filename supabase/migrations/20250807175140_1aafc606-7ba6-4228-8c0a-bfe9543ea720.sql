-- Create cron job to process suggestions daily at midnight
SELECT cron.schedule(
  'process_suggestions_daily',
  '0 0 * * *',
  $$
    SELECT net.http_post(
      url := 'https://cowigwginfqahgwzrrql.supabase.co/functions/v1/processSuggestions',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvd2lnd2dpbmZxYWhnd3pycnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMTU4MTQsImV4cCI6MjA2OTc5MTgxNH0.Q25idETPRowBb-CPeUq3ds_sXsmes67Y_QzELO79OWI'
      ),
      body := '{"limit": 20}'::jsonb
    ) AS request_id;
  $$
);
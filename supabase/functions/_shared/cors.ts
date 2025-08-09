export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function ok(body: any, init: ResponseInit = {}) {
  return new Response(
    JSON.stringify(body),
    { headers: { 'Content-Type': 'application/json', ...corsHeaders }, ...init }
  );
}

export function err(message: string, status = 500) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  );
}

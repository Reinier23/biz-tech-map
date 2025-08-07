import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { toolId } = await req.json();
    
    if (!toolId) {
      return new Response(
        JSON.stringify({ error: 'toolId is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const brandfetchClientId = Deno.env.get('BRANDFETCH_CLIENT_ID');
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Enriching tool data for toolId: ${toolId}`);

    // Fetch tool from database
    const { data: tool, error: fetchError } = await supabase
      .from('tools_catalog')
      .select('*')
      .eq('id', toolId)
      .single();

    if (fetchError || !tool) {
      console.error('Tool not found:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Tool not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Found tool: ${tool.name} with domain: ${tool.domain}`);

    let logoUrl = null;
    let updateNeeded = false;

    if (brandfetchClientId && tool.domain) {
      try {
        // Directly construct logo URL using Brandfetch Logo Link (free)
        const testLogoUrl = `https://cdn.brandfetch.io/${tool.domain}?c=${brandfetchClientId}`;
        
        console.log(`Testing logo URL: ${testLogoUrl}`);
        
        // Test if the logo URL is valid by making a HEAD request
        const logoResponse = await fetch(testLogoUrl, { 
          method: 'HEAD',
          // Add timeout to avoid hanging
          signal: AbortSignal.timeout(5000)
        });

        if (logoResponse.ok) {
          logoUrl = testLogoUrl;
          updateNeeded = true;
          console.log(`Valid logo found for domain: ${tool.domain}`);
        } else {
          console.log(`Logo not found for domain: ${tool.domain} (status: ${logoResponse.status})`);
          // Try with different logo size parameters as fallback
          const fallbackLogoUrl = `https://cdn.brandfetch.io/${tool.domain}?c=${brandfetchClientId}&size=512`;
          
          const fallbackResponse = await fetch(fallbackLogoUrl, { 
            method: 'HEAD',
            signal: AbortSignal.timeout(5000)
          });
          
          if (fallbackResponse.ok) {
            logoUrl = fallbackLogoUrl;
            updateNeeded = true;
            console.log(`Fallback logo found for domain: ${tool.domain}`);
          }
        }
      } catch (error) {
        console.error('Error testing logo URL:', error);
        // Continue without logo (graceful fallback)
      }
    } else {
      console.log('Brandfetch Client ID not configured or domain missing, skipping logo enrichment');
    }

    // Update tool with enriched data
    const updateData: any = {};
    
    if (logoUrl) {
      updateData.logourl = logoUrl;
    }

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('tools_catalog')
        .update(updateData)
        .eq('id', toolId);

      if (updateError) {
        console.error('Error updating tool:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update tool' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log(`Successfully updated tool ${toolId} with:`, updateData);
    } else {
      console.log('No new data to update');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        toolId,
        enriched: Object.keys(updateData).length > 0,
        updates: updateData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in enrich-tool function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
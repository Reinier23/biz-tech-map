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
    let description = tool.description; // Keep existing if present

    if (brandfetchClientId && tool.domain) {
      try {
        // Search for brand using Brandfetch API
        console.log(`Searching for brand: ${tool.name}`);
        
        const searchResponse = await fetch(`https://api.brandfetch.io/v2/search/${encodeURIComponent(tool.name)}`, {
          headers: {
            'Authorization': `Bearer ${brandfetchClientId}`,
          },
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          console.log('Brand search successful:', searchData);
          
          if (searchData && searchData.length > 0) {
            const brand = searchData[0];
            
            // Extract domain if available
            const resolvedDomain = brand.domain || tool.domain;
            
            // Construct logo URL using Brandfetch CDN
            logoUrl = `https://cdn.brandfetch.io/${resolvedDomain}?c=${brandfetchClientId}`;
            
            // Use brand description if available and current description is empty
            if (!description && brand.description) {
              description = brand.description;
            }
            
            console.log(`Generated logo URL: ${logoUrl}`);
          } else {
            console.log('No brand data found from search');
          }
        } else {
          console.error('Brandfetch search failed:', await searchResponse.text());
        }
      } catch (error) {
        console.error('Error calling Brandfetch API:', error);
        // Continue without Brandfetch data (fallback)
      }
    } else {
      console.log('Brandfetch Client ID not configured or domain missing, skipping enrichment');
    }

    // Update tool with enriched data
    const updateData: any = {};
    
    if (logoUrl) {
      updateData.logourl = logoUrl;
    }
    
    if (description && description !== tool.description) {
      updateData.description = description;
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
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
    // Authorization: require admin or service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const brandfetchClientId = Deno.env.get('BRANDFETCH_CLIENT_ID');

    const authHeader = req.headers.get('Authorization') || '';
    const isServiceRoleCall = authHeader === `Bearer ${supabaseKey}`;
    let isAdmin = false;

    if (!isServiceRoleCall) {
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });
      const { data: userData, error: userErr } = await userClient.auth.getUser();
      const userId = userData?.user?.id;
      if (userErr || !userId) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const adminCheck = createClient(supabaseUrl, supabaseKey);
      const { data: roles } = await adminCheck
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .limit(1);
      isAdmin = Array.isArray(roles) && roles.length > 0;
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: 'Forbidden' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const { toolName, suggestedCategory } = await req.json();
    
    if (!toolName) {
      return new Response(
        JSON.stringify({ error: 'toolName is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Enriching tool data for: ${toolName}`);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if tool exists in catalog
    const { data: existingTool } = await supabase
      .from('tools_catalog')
      .select('*')
      .ilike('name', toolName)
      .limit(1)
      .single();

    if (existingTool) {
      console.log(`Found existing tool in catalog: ${existingTool.name}`);
      const aiCategory = existingTool.category || 'Other';
      const aiConfidence = 95;
      const LOW = 70;
      const HIGH = 80;

      let finalCategory = aiCategory;
      let usedSuggested = false;

      if (suggestedCategory) {
        if (aiCategory === 'Other' || aiConfidence < LOW) {
          finalCategory = suggestedCategory;
          usedSuggested = true;
        } else if (aiConfidence >= HIGH && aiCategory.toLowerCase() !== suggestedCategory.toLowerCase()) {
          finalCategory = aiCategory;
        } else {
          finalCategory = suggestedCategory;
          usedSuggested = true;
        }
      }

      const responsePayload = {
        category: finalCategory,
        confirmedCategory: usedSuggested ? finalCategory : undefined,
        description: existingTool.description || `${toolName} - Business tool`,
        logoUrl: existingTool.logourl || '',
        confidence: aiConfidence
      };

      return new Response(
        JSON.stringify(responsePayload),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // AI categorization logic
    const categories = {
      'Marketing': ['marketing', 'analytics', 'seo', 'social', 'content', 'email', 'campaign', 'ads', 'advertising'],
      'Sales': ['sales', 'crm', 'lead', 'pipeline', 'customer', 'prospect', 'revenue'],
      'Service': ['support', 'help', 'ticket', 'chat', 'communication', 'slack', 'teams'],
      'Development': ['dev', 'code', 'git', 'github', 'api', 'database', 'programming'],
      'Design': ['design', 'figma', 'adobe', 'creative', 'ui', 'ux', 'graphics'],
      'Finance': ['finance', 'accounting', 'billing', 'payment', 'invoice', 'money'],
      'HR': ['hr', 'human', 'employee', 'hiring', 'recruitment', 'people'],
      'Operations': ['operations', 'project', 'task', 'workflow', 'automation', 'process']
    };

    const toolNameLower = toolName.toLowerCase();
    let category = 'Other';
    let confidence = 60;

    // Simple keyword matching for categorization
    for (const [cat, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => toolNameLower.includes(keyword))) {
        category = cat;
        confidence = 85;
        break;
      }
    }

    // Try to get logo if Brandfetch is configured
    let logoUrl = '';
    if (brandfetchClientId) {
      try {
        // Extract domain from tool name (basic heuristic)
        const domain = toolNameLower.replace(/\s+/g, '') + '.com';
        const testLogoUrl = `https://cdn.brandfetch.io/${domain}?c=${brandfetchClientId}`;
        
        const logoResponse = await fetch(testLogoUrl, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(3000)
        });

        if (logoResponse.ok) {
          logoUrl = testLogoUrl;
          confidence = Math.min(confidence + 10, 95);
        }
      } catch (error) {
        console.log('Logo fetch failed, continuing without logo');
      }
    }

    const LOW = 70;
    const HIGH = 80;

    let finalCategory = category;
    let usedSuggested = false;

    if (suggestedCategory) {
      if (category === 'Other' || confidence < LOW) {
        finalCategory = suggestedCategory;
        usedSuggested = true;
      } else if (confidence >= HIGH && category.toLowerCase() !== suggestedCategory.toLowerCase()) {
        finalCategory = category;
      } else {
        finalCategory = suggestedCategory;
        usedSuggested = true;
      }
    }

    const enrichedData = {
      category: finalCategory,
      confirmedCategory: usedSuggested ? finalCategory : undefined,
      description: `${toolName} - ${finalCategory} tool for business operations`,
      logoUrl,
      confidence
    };

    // Save to catalog for future use
    try {
      await supabase
        .from('tools_catalog')
        .insert({
          name: toolName,
          category: finalCategory,
          description: enrichedData.description,
          logourl: logoUrl,
          domain: toolNameLower.replace(/\s+/g, '') + '.com'
        });
    } catch (error) {
      console.log('Failed to save to catalog (may already exist):', (error as any).message);
    }

    console.log(`Successfully enriched ${toolName}:`, enrichedData);

    return new Response(
      JSON.stringify(enrichedData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in enrichToolData function:', error);
    
    // Return fallback data instead of error
    const fallbackData = {
      category: suggestedCategory || 'Other',
      confirmedCategory: suggestedCategory ? suggestedCategory : undefined,
      description: 'Business tool',
      logoUrl: '',
      confidence: 50,
      fallback: true
    };

    return new Response(
      JSON.stringify({ fallback: fallbackData }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
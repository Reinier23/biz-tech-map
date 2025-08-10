import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, ok, err } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authorization: require admin or service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
// Use free Brandfetch Logo Link API; no secret required

    const authHeader = req.headers.get('Authorization') || '';
    const isServiceRoleCall = authHeader === `Bearer ${supabaseKey}`;
    let isAdmin = false;

    if (!isServiceRoleCall) {
      if (!authHeader) {
        return err('Unauthorized', 401);
      }
      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });
      const { data: userData, error: userErr } = await userClient.auth.getUser();
      const userId = userData?.user?.id;
      if (userErr || !userId) {
        return err('Unauthorized', 401);
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
        return err('Forbidden', 403);
      }
    }

    const { toolName, suggestedCategory } = await req.json();
    
    if (!toolName) {
      return err('toolName is required', 400);
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
        logoUrl: existingTool.logourl || (existingTool.domain ? `https://logo.brandfetch.io/${existingTool.domain}` : ''),
        confidence: aiConfidence
      };

      return ok(responsePayload);
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

    // Build free logo URL using Brandfetch Logo Link API
    let logoUrl = '';
    try {
      const domain = toolNameLower.replace(/\s+/g, '') + '.com';
      logoUrl = `https://logo.brandfetch.io/${domain}`;
      // No network check needed; client will fallback on error
    } catch (_) {
      logoUrl = '';
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

    return ok(enrichedData);

  } catch (error) {
    console.error('Error in enrichToolData function:', error);
    return err((error as any)?.message || 'Unexpected error', 500);
  }
});
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, ok, err } from '../_shared/cors.ts';

interface ProcessingSummary {
  processed: number;
  added: number;
  skipped: number;
  errors: number;
  details: string[];
}

interface ToolSuggestion {
  id: string;
  name: string;
  submitted_at: string;
  processed: boolean;
  processed_at?: string;
  processing_error?: string;
  resolved_domain?: string;
}

// Default categories for auto-assignment
const DEFAULT_CATEGORIES: Record<string, string> = {
  'slack': 'Communication',
  'teams': 'Communication',
  'zoom': 'Communication',
  'figma': 'Design',
  'canva': 'Design',
  'notion': 'Productivity',
  'trello': 'Project Management',
  'asana': 'Project Management',
  'jira': 'Project Management',
  'salesforce': 'Sales',
  'hubspot': 'Sales',
  'mailchimp': 'Marketing',
  'shopify': 'E-commerce',
  'stripe': 'Finance',
  'quickbooks': 'Finance',
  'github': 'Development',
  'gitlab': 'Development',
  'docker': 'Development',
  'aws': 'Infrastructure',
  'google': 'Productivity',
  'microsoft': 'Productivity',
  'dropbox': 'Storage',
  'box': 'Storage'
};

function resolveDomain(toolName: string): string[] {
  const cleanName = toolName.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
  
  // Common domain patterns to try
  const patterns = [
    `${cleanName}.com`,
    `${cleanName}.io`,
    `${cleanName}.co`,
    `${cleanName}.app`,
    `${cleanName}.net`
  ];

  // Special cases for well-known tools
  const specialCases: Record<string, string> = {
    'googledrive': 'drive.google.com',
    'googlesheets': 'sheets.google.com',
    'googledocs': 'docs.google.com',
    'office365': 'office.com',
    'microsoftteams': 'teams.microsoft.com',
    'onedrive': 'onedrive.com',
    'adobexd': 'xd.adobe.com',
    'adobephotoshop': 'photoshop.com'
  };

  if (specialCases[cleanName]) {
    return [specialCases[cleanName]];
  }

  return patterns;
}

function assignCategory(toolName: string): string {
  const cleanName = toolName.toLowerCase();
  
  for (const [keyword, category] of Object.entries(DEFAULT_CATEGORIES)) {
    if (cleanName.includes(keyword)) {
      return category;
    }
  }
  
  return 'Other';
}

async function testDomain(domain: string): Promise<boolean> {
  try {
    const response = await fetch(`https://${domain}`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function testLogoUrl(domain: string, brandfetchClientId?: string): Promise<string | null> {
  if (!brandfetchClientId) return null;
  
  try {
    const logoUrl = `https://cdn.brandfetch.io/${domain}?c=${brandfetchClientId}`;
    const response = await fetch(logoUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      return logoUrl;
    }
    
    // Try with size parameter as fallback
    const fallbackUrl = `https://cdn.brandfetch.io/${domain}?c=${brandfetchClientId}&size=512`;
    const fallbackResponse = await fetch(fallbackUrl, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    
    return fallbackResponse.ok ? fallbackUrl : null;
  } catch {
    return null;
  }
}

async function processSuggestion(
  suggestion: ToolSuggestion,
  supabase: any,
  brandfetchClientId?: string
): Promise<{ success: boolean; message: string; action: string }> {
  
  const { id, name } = suggestion;
  console.log(`Processing suggestion: ${name} (ID: ${id})`);
  
  try {
    // Check for duplicates by name (case-insensitive)
    const { data: existingByName } = await supabase
      .from('tools_catalog')
      .select('id, name')
      .ilike('name', name)
      .limit(1);
    
    if (existingByName && existingByName.length > 0) {
      await supabase
        .from('tool_suggestions')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
          processing_error: `Duplicate: Tool '${existingByName[0].name}' already exists`
        })
        .eq('id', id);
      
      return {
        success: false,
        message: `Skipped: Duplicate tool name '${name}'`,
        action: 'skipped'
      };
    }
    
    // Try to resolve domain
    const domainCandidates = resolveDomain(name);
    let resolvedDomain: string | null = null;
    
    for (const domain of domainCandidates) {
      const isValid = await testDomain(domain);
      if (isValid) {
        resolvedDomain = domain;
        break;
      }
    }
    
    if (!resolvedDomain) {
      await supabase
        .from('tool_suggestions')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
          processing_error: `Could not resolve domain for '${name}'. Tried: ${domainCandidates.join(', ')}`
        })
        .eq('id', id);
      
      return {
        success: false,
        message: `Error: Could not resolve domain for '${name}'`,
        action: 'error'
      };
    }
    
    // Check for duplicates by domain
    const { data: existingByDomain } = await supabase
      .from('tools_catalog')
      .select('id, name, domain')
      .eq('domain', resolvedDomain)
      .limit(1);
    
    if (existingByDomain && existingByDomain.length > 0) {
      await supabase
        .from('tool_suggestions')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
          resolved_domain: resolvedDomain,
          processing_error: `Duplicate: Domain '${resolvedDomain}' already exists for tool '${existingByDomain[0].name}'`
        })
        .eq('id', id);
      
      return {
        success: false,
        message: `Skipped: Domain '${resolvedDomain}' already exists`,
        action: 'skipped'
      };
    }
    
    // Test logo URL
    const logoUrl = await testLogoUrl(resolvedDomain, brandfetchClientId);
    
    // Assign category
    const category = assignCategory(name);
    
    // Generate tool ID
    const toolId = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    // Insert into tools_catalog
    const { error: insertError } = await supabase
      .from('tools_catalog')
      .insert({
        id: toolId,
        name: name,
        category: category,
        domain: resolvedDomain,
        logourl: logoUrl,
        description: `${name} - Auto-added from user suggestion`
      });
    
    if (insertError) {
      await supabase
        .from('tool_suggestions')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
          resolved_domain: resolvedDomain,
          processing_error: `Failed to insert into catalog: ${insertError.message}`
        })
        .eq('id', id);
      
      return {
        success: false,
        message: `Error: Failed to add '${name}' to catalog: ${insertError.message}`,
        action: 'error'
      };
    }
    
    // Mark suggestion as processed successfully
    await supabase
      .from('tool_suggestions')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
        resolved_domain: resolvedDomain
      })
      .eq('id', id);
    
    return {
      success: true,
      message: `Added '${name}' to catalog (${category}, ${resolvedDomain}${logoUrl ? ', with logo' : ''})`,
      action: 'added'
    };
    
  } catch (error) {
    console.error(`Error processing suggestion ${id}:`, error);
    
    // Mark as processed with error
    await supabase
      .from('tool_suggestions')
      .update({
        processed: true,
        processed_at: new Date().toISOString(),
        processing_error: error.message
      })
      .eq('id', id);
    
    return {
      success: false,
      message: `Error processing '${name}': ${error.message}`,
      action: 'error'
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    let limit = 10;
    
    // Parse limit from request body if provided
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.limit && typeof body.limit === 'number' && body.limit > 0) {
          limit = Math.min(body.limit, 50); // Cap at 50 for safety
        }
      } catch {
        // Ignore JSON parsing errors, use default limit
      }
    }

    // Initialize Supabase clients and auth
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const brandfetchClientId = Deno.env.get('BRANDFETCH_CLIENT_ID');
    
    const authHeader = req.headers.get('Authorization') || '';
    const isServiceRoleCall = authHeader === `Bearer ${supabaseKey}`;
    if (!isServiceRoleCall) {
      if (!authHeader) {
        return err('Unauthorized', 401);
      }
      const userClient = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } });
      const { data: userData, error: userErr } = await userClient.auth.getUser();
      const userId = userData?.user?.id;
        if (userErr || !userId) {
          return err('Unauthorized', 401);
        }
      const adminCheck = createClient(supabaseUrl, supabaseKey);
      const { data: roles } = await adminCheck.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').limit(1);
      const isAdmin = Array.isArray(roles) && roles.length > 0;
        if (!isAdmin) {
          return err('Forbidden', 403);
        }
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Starting to process suggestions with limit: ${limit}`);
    
    // Fetch unprocessed suggestions
    const { data: suggestions, error: fetchError } = await supabase
      .from('tool_suggestions')
      .select('*')
      .eq('processed', false)
      .order('submitted_at', { ascending: true })
      .limit(limit);

    if (fetchError) {
      console.error('Error fetching suggestions:', fetchError);
      return err('Failed to fetch suggestions', 500);
    }

    if (!suggestions || suggestions.length === 0) {
      console.log('No unprocessed suggestions found');
      return ok({ 
        message: 'No unprocessed suggestions found',
        summary: { processed: 0, added: 0, skipped: 0, errors: 0, details: [] }
      });
    }

    console.log(`Found ${suggestions.length} unprocessed suggestions`);

    // Process each suggestion
    const summary: ProcessingSummary = {
      processed: 0,
      added: 0,
      skipped: 0,
      errors: 0,
      details: []
    };

    for (const suggestion of suggestions) {
      const result = await processSuggestion(suggestion, supabase, brandfetchClientId);
      
      summary.processed++;
      summary.details.push(result.message);
      
      if (result.action === 'added') {
        summary.added++;
      } else if (result.action === 'skipped') {
        summary.skipped++;
      } else if (result.action === 'error') {
        summary.errors++;
      }
      
      console.log(`Processed ${suggestion.name}: ${result.message}`);
    }

    console.log('Processing completed:', summary);

    return ok({ 
      message: `Processed ${summary.processed} suggestions`,
      summary 
    });

  } catch (error) {
    console.error('Error in process-suggestions function:', error);
    return err((error as any)?.message || 'Unexpected error', 500);
  }
});
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Tool {
  name: string;
  category: string;
  description: string;
}

interface ConsolidationResult {
  tool: Tool;
  category: string;
  recommendation: "Replace" | "Evaluate" | "No Match" | "Keep";
  reason: string;
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const requestLog = new Map<string, number[]>();

function checkRate(uid: string) {
  const now = Date.now();
  const arr = (requestLog.get(uid) ?? []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (arr.length >= RATE_LIMIT_MAX) return false;
  arr.push(now);
  requestLog.set(uid, arr);
  return true;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Auth: ensure the caller is authenticated
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase credentials not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } }
    });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!checkRate(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { tools }: { tools: Tool[] } = await req.json();

    if (!tools || !Array.isArray(tools) || tools.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid input: tools array required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (tools.length > 25) {
      return new Response(
        JSON.stringify({ error: 'Too many tools (max 25)' }),
        { 
          status: 413, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate individual tool fields and clamp description length
    for (const t of tools) {
      if (!t || typeof t.name !== 'string' || typeof t.category !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Each tool must include name and category' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (t.name.length > 120) {
        return new Response(
          JSON.stringify({ error: `Tool name too long: ${t.name}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (t.description && t.description.length > 2000) {
        t.description = t.description.slice(0, 2000);
      }
    }

    // Check approximate payload size (bytes)
    const payloadSize = new TextEncoder().encode(JSON.stringify(tools)).length;
    if (payloadSize > 256_000) {
      return new Response(
        JSON.stringify({ error: 'Payload too large (limit 256KB)' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const results: ConsolidationResult[] = []

    // Process each tool with GPT-4
    for (const tool of tools) {
      try {
        // Check if the tool is HubSpot itself (case-insensitive)
        if (tool.name.toLowerCase().includes('hubspot')) {
          results.push({
            tool,
            category: tool.category,
            recommendation: "Keep",
            reason: "This is the core platform being compared; no replacement is needed."
          })
          continue
        }
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        let response: Response;
        try {
          response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4.1-2025-04-14',
              messages: [
                {
                  role: 'system',
                  content: `You are an expert in business software consolidation specializing in HubSpot's capabilities. Analyze whether HubSpot can replace the given tool based on comprehensive feature comparison.

HubSpot's Complete Capabilities:

SALES HUB:
- Advanced CRM with contact/company/deal management
- Sales pipeline automation & deal tracking
- Email tracking, templates, sequences
- Meeting scheduling & calendar integration
- Sales analytics & forecasting
- Lead scoring & qualification
- Quote generation & e-signatures
- Sales team management & reporting
- Mobile CRM app
- Integration with 1000+ tools

MARKETING HUB:
- Email marketing with automation workflows
- Landing pages & forms builder
- Social media management & publishing
- Content management system (CMS)
- SEO tools & optimization
- Lead nurturing & scoring
- Marketing analytics & attribution
- A/B testing capabilities
- Personalization & smart content
- Marketing automation workflows
- Advertising management (Google, Facebook)
- Event management

SERVICE HUB:
- Help desk with ticketing system
- Knowledge base creation & management
- Live chat & chatbots
- Customer feedback surveys
- Service analytics & reporting
- Team inbox & collaboration
- SLA management
- Customer portal
- Automation workflows for support
- Integration with other hubs

OPERATIONS HUB:
- Data sync & integration
- Workflow automation across hubs
- Custom objects & properties
- Data quality management
- Business intelligence & reporting

ENTERPRISE FEATURES:
- Advanced permissions & teams
- Custom reporting & dashboards
- API access & custom integrations
- Single sign-on (SSO)
- Advanced security features

RECOMMENDATION CRITERIA:
- "Replace": HubSpot provides 80%+ of the tool's core functionality natively
- "Evaluate": HubSpot covers 50-79% functionality, may need assessment or add-ons
- "No Match": HubSpot covers <50% of core functionality or serves different use case

Consider tool complexity, industry-specific features, and integration requirements in your analysis.`
                },
                {
                  role: 'user',
                  content: `Analyze this tool:
Name: ${tool.name}
Category: ${tool.category}
Description: ${tool.description || 'No description provided'}`
                }
              ],
              functions: [
                {
                  name: 'analyze_consolidation',
                  description: 'Analyze if HubSpot can replace or partially replace a business tool',
                  parameters: {
                    type: 'object',
                    properties: {
                      recommendation: {
                        type: 'string',
                        enum: ['Replace', 'Evaluate', 'No Match'],
                        description: 'Whether HubSpot can replace this tool'
                      },
                      reason: {
                        type: 'string',
                        description: 'Brief explanation for the recommendation'
                      }
                    },
                    required: ['recommendation', 'reason']
                  }
                }
              ],
              function_call: { name: 'analyze_consolidation' },
              temperature: 0.3,
            }),
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }

        if (!response.ok) {
          console.error('OpenAI API error:', await response.text())
          results.push({
            tool,
            category: tool.category,
            recommendation: "No Match",
            reason: "Analysis failed - could not process this tool"
          })
          continue
        }

        const data = await response.json()
        const functionCall = data.choices[0]?.message?.function_call

        if (functionCall && functionCall.name === 'analyze_consolidation') {
          const analysis = JSON.parse(functionCall.arguments)
          results.push({
            tool,
            category: tool.category,
            recommendation: analysis.recommendation,
            reason: analysis.reason
          })
        } else {
          results.push({
            tool,
            category: tool.category,
            recommendation: "No Match",
            reason: "Unable to analyze this tool"
          })
        }
      } catch (error) {
        console.error('Error processing tool:', tool.name, error)
        results.push({
          tool,
          category: tool.category,
          recommendation: "No Match",
          reason: "Error occurred during analysis"
        })
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
  recommendation: "Replace" | "Evaluate" | "No Match";
  reason: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { tools }: { tools: Tool[] } = await req.json()

    if (!tools || !Array.isArray(tools)) {
      return new Response(
        JSON.stringify({ error: 'Invalid input: tools array required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
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
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
        })

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
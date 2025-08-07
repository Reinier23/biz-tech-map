import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { toolName } = await req.json()

    if (!toolName) {
      throw new Error('Tool name is required')
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const prompt = `You are a tech tool expert. Given a tool name, provide structured information about it.
    
Tool name: "${toolName}"

Classify this business tool into the most appropriate category from the following options:

Categories:
- Marketing: Advertising, content marketing, SEO, social media management, email marketing
- Sales: CRM, lead generation, sales automation, prospecting, pipeline management
- Service: Customer support, help desk, ticketing, customer communication
- ERP: Enterprise resource planning, business process management, integrated business systems
- HR: Human resources, payroll, employee management, recruiting, performance management
- ProjectManagement: Task management, project planning, team collaboration, workflow management
- Analytics: Data visualization, business intelligence, reporting, data analysis
- Finance: Accounting, invoicing, financial planning, expense management, bookkeeping
- CustomerSuccess: Customer retention, onboarding, success management, customer health monitoring
- Communication: Team chat, video conferencing, internal communication, messaging
- Development: Code repositories, deployment, developer tools, infrastructure, DevOps
- Other: Tools that don't clearly fit into the above categories

CONFIDENCE GUIDELINES:
- Use confidence 80-100 only when you are very certain about the categorization
- Use confidence 60-79 for tools you recognize but aren't completely sure about
- Use confidence 0-59 for unknown tools or when uncertain
- Be conservative - it's better to have low confidence than incorrectly categorize

Return a JSON object with:
- category: the most appropriate category from the list above
- description: a concise 1-2 sentence description of what the tool does
- logoUrl: a publicly accessible URL to the tool's logo (prefer SVG or high-quality PNG)
- confidence: a number from 0-100 indicating how confident you are about the categorization
- reasoning: brief explanation (1 sentence) for why this category was chosen
- alternativeCategories: array of up to 2 other possible categories if the tool could fit multiple categories

If the tool is not well-known or you're unsure, set confidence to a lower value and provide best-guess information.

Example response:
{
  "category": "Marketing",
  "description": "A marketing automation platform that helps businesses nurture leads and automate email campaigns.",
  "logoUrl": "https://example.com/logo.png",
  "confidence": 95,
  "reasoning": "Primarily focused on email marketing automation and lead nurturing workflows.",
  "alternativeCategories": ["Sales", "CustomerSuccess"]
}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response from OpenAI
    let enrichedData
    try {
      enrichedData = JSON.parse(content)
      
      // Apply confidence-based auto-assignment logic
      if (enrichedData.confidence < 80) {
        // Low confidence: force to "Other" category for manual override
        enrichedData.category = "Other"
      }
      
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError)
      // Fallback if JSON parsing fails
      enrichedData = {
        category: "Other",
        description: `${toolName} - Unable to fetch detailed information`,
        logoUrl: "",
        confidence: 0,
        reasoning: "Failed to parse AI response",
        alternativeCategories: []
      }
    }

    return new Response(
      JSON.stringify(enrichedData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error enriching tool data:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        fallback: {
          category: "Other",
          description: "Please add description manually",
          logoUrl: "",
          confidence: 0,
          reasoning: "AI enrichment failed",
          alternativeCategories: []
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 400 
      }
    )
  }
})
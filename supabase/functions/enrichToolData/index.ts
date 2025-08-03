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

Return a JSON object with:
- category: one of "Sales", "Marketing", "Service", "Development", "Analytics", "Communication", "Finance", "HR", "Other"
- description: a concise 1-2 sentence description of what the tool does
- logoUrl: a publicly accessible URL to the tool's logo (prefer SVG or high-quality PNG)
- confidence: a number from 0-100 indicating how confident you are about this information

If the tool is not well-known or you're unsure, set confidence to a lower value and provide best-guess information.

Example response:
{
  "category": "Marketing",
  "description": "A marketing automation platform that helps businesses nurture leads and automate email campaigns.",
  "logoUrl": "https://example.com/logo.png",
  "confidence": 95
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
    } catch (parseError) {
      // Fallback if JSON parsing fails
      enrichedData = {
        category: "Other",
        description: `${toolName} - Unable to fetch detailed information`,
        logoUrl: "",
        confidence: 20
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
          confidence: 0
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
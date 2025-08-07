
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Lightbulb, Sparkles, ArrowLeft, MapPin } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTools } from '@/contexts/ToolsContext';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { AISuggestionsPanel } from '@/components/AISuggestionsPanel';
import { EmailCaptureSection } from '@/components/EmailCaptureSection';
import { ToolSearchBar } from '@/components/ToolSearchBar';
import { ToolBucket } from '@/components/ToolBucket';
import { supabase } from '@/integrations/supabase/client';
import { defaultCategories } from '@/lib/categories';

interface Tool {
  id: string;
  name: string;
  category: string;
  confirmedCategory?: string;
  description: string;
  logoUrl?: string;
  confidence?: number;
}

interface EnrichedData {
  category: string;
  description: string;
  logoUrl: string;
  confidence: number;
}

const AddTools = () => {
  const { tools: contextTools, setTools: setContextTools } = useTools();
  const [tools, setTools] = useState<Tool[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const navigate = useNavigate();

  // Debug logging to verify correct components are rendering
  console.log('✅ AddTools: New UI components active', {
    toolsCount: tools.length,
    contextToolsCount: contextTools.length,
    showSuggestions,
    showEmailCapture,
    timestamp: new Date().toISOString()
  });

  // Load tools from context on mount
  useEffect(() => {
    if (contextTools.length > 0) {
      setTools(contextTools);
    }
  }, []);

  // Save to context when tools change
  useEffect(() => {
    const validTools = tools.filter(tool => tool.name.trim());
    if (validTools.length > 0) {
      setContextTools(validTools);
    }
  }, [tools, setContextTools]);

  const enrichToolData = useCallback(async (toolName: string): Promise<EnrichedData | null> => {
    if (!toolName.trim() || toolName.length < 2) return null;

    try {
      const { data, error } = await supabase.functions.invoke('enrichToolData', {
        body: { toolName: toolName.trim() }
      });

      if (error) throw error;

      if (data && !data.error) {
        return data;
      } else if (data?.fallback) {
        return data.fallback;
      }
    } catch (error) {
      console.error('❌ Tool enrichment failed:', error);
      // Still add the tool without enrichment
    }
    return null;
  }, []);

  const handleAddTool = useCallback(async (toolName: string, suggestedCategory?: string) => {
    // Check if tool already exists
    const existingTool = tools.find(tool => 
      tool.name.toLowerCase() === toolName.toLowerCase()
    );
    
    if (existingTool) return;

    // Create new tool with initial data
    const newTool: Tool = {
      id: `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: toolName,
      category: suggestedCategory || 'Other',
      description: '',
      logoUrl: '',
      confidence: 0
    };

    // Add tool immediately to show in UI
    setTools(prev => [...prev, newTool]);

    // Enrich tool data in background
    console.log(`🔄 Enriching tool: ${toolName}`);
    const enrichedData = await enrichToolData(toolName);
    if (enrichedData) {
      console.log(`✅ Tool enriched successfully:`, enrichedData);
      setTools(prev => prev.map(tool => 
        tool.id === newTool.id 
          ? {
              ...tool,
              category: enrichedData.category,
              confirmedCategory: enrichedData.category,
              description: enrichedData.description,
              logoUrl: enrichedData.logoUrl,
              confidence: enrichedData.confidence
            }
          : tool
      ));
    }
  }, [tools, enrichToolData]);

  const handleRemoveTool = useCallback((id: string) => {
    setTools(prev => prev.filter(tool => tool.id !== id));
  }, []);

  const getAllValidTools = () => {
    return tools.filter(tool => tool.name.trim());
  };

  const validTools = getAllValidTools();
  const hasValidTools = validTools.length > 0;
  const enrichedToolsCount = validTools.filter(tool => tool.confidence && tool.confidence > 70).length;
  const currentStep = hasValidTools ? (enrichedToolsCount >= 3 ? 2 : 1) : 1;

  // Show suggestions when we have 3+ enriched tools
  useEffect(() => {
    if (enrichedToolsCount >= 3 && !showSuggestions) {
      setTimeout(() => setShowSuggestions(true), 500);
    }
  }, [enrichedToolsCount, showSuggestions]);

  // Show email capture after suggestions are shown
  useEffect(() => {
    if (showSuggestions && !showEmailCapture) {
      setTimeout(() => setShowEmailCapture(true), 2000);
    }
  }, [showSuggestions, showEmailCapture]);

  const handleEmailCaptured = (email: string) => {
    setEmailCaptured(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-2">Add Your Tools</h1>
          <p className="text-muted-foreground text-lg">
            Just enter the tool names - AI will handle the rest automatically!
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator 
          currentStep={currentStep}
          totalSteps={2}
          stepLabels={['Add Tools', 'Get Insights']}
        />

        {/* Tool Search Section */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Add Your Tech Tools
            </CardTitle>
            <CardDescription>
              Search and add your business tools. Our AI will automatically categorize and enrich them with details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Bar */}
            <ToolSearchBar 
              onAddTool={handleAddTool}
              existingTools={tools.map(tool => ({ name: tool.name, category: tool.category }))}
            />

            {/* Tool Bucket */}
            <ToolBucket 
              tools={tools}
              onRemoveTool={handleRemoveTool}
              activeFilters={activeFilters}
              onFilterChange={setActiveFilters}
            />

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {validTools.length} tools added
                </p>
              </div>
              {hasValidTools && (
                <Button
                  onClick={() => navigate('/tech-map')}
                  className="gap-2 transition-all animate-fade-in"
                >
                  <MapPin className="h-4 w-4" />
                  View Tech Map
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestions Panel */}
        {showSuggestions && (
          <div className="mt-8 animate-fade-in">
            <AISuggestionsPanel 
              tools={validTools}
              isVisible={showSuggestions}
            />
          </div>
        )}

        {/* Email Capture Section */}
        {showEmailCapture && (
          <div className="mt-8 animate-fade-in">
            <EmailCaptureSection 
              isVisible={showEmailCapture}
              onEmailCaptured={handleEmailCaptured}
            />
          </div>
        )}

        {/* Quick Tips */}
        <Card className="mt-8 bg-gradient-to-r from-primary/5 to-primary-glow/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-3">💡 Quick Tips</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• <strong>Marketing:</strong> Campaign tools, analytics, content creation (e.g., HubSpot, Google Analytics)</li>
                  <li>• <strong>Sales:</strong> CRM, lead generation, sales automation (e.g., Salesforce, Pipedrive)</li>
                  <li>• <strong>Service:</strong> Customer support, communication tools (e.g., Zendesk, Slack)</li>
                  <li>• Our AI automatically categorizes and finds logos - just enter the tool name!</li>
                  <li>• Click on any example tool above to quickly add it to your list!</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddTools;

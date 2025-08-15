
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTools, type Tool } from '@/contexts/ToolsContext';
import { DEBUG } from '@/lib/config';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { AISuggestionsPanel } from '@/components/AISuggestionsPanel';
import { EmailCaptureSection } from '@/components/EmailCaptureSection';
import { ToolSearchBar } from '@/components/ToolSearchBar';
import { ToolChip } from '@/components/ToolChip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Zap,
  CheckCircle,
  Lightbulb,
  BarChart3,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import PageTransition from '@/components/PageTransition';

interface EnrichedData {
  description?: string;
  logoUrl?: string;
  confidence?: number;
}

const AddTools: React.FC = () => {
  const { tools, setTools } = useTools();
  const [contextTools, setContextTools] = useState(tools);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const navigate = useNavigate();

  // Debug logging to verify correct components are rendering
  useEffect(() => {
    if (DEBUG) {
      console.log('✅ AddTools: New UI components active', {
        toolsCount: tools.length,
        contextToolsCount: contextTools.length,
        showSuggestions,
        showEmailCapture,
        timestamp: new Date().toISOString()
      });
    }
  }, [tools.length, contextTools.length, showSuggestions, showEmailCapture]);

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

  const enrichToolData = useCallback(async (toolName: string, suggestedCategory?: string): Promise<EnrichedData | null> => {
    if (!toolName.trim() || toolName.length < 2) return null;

    try {
      const { data, error } = await supabase.functions.invoke('enrichToolData', {
        body: { toolName: toolName.trim(), suggestedCategory }
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
      confirmedCategory: suggestedCategory || 'Other',
      description: '',
      logoUrl: '',
      confidence: 0
    };

    // Add tool immediately to show in UI
    setTools(prev => [...prev, newTool]);

    // Enrich tool data in background
    if (DEBUG) console.log(`🔄 Enriching tool: ${toolName}`);
    const enrichedData = await enrichToolData(toolName, suggestedCategory);

    // Logging for verification
    if (DEBUG) console.log('[addTool]', { name: toolName, suggestedCategory, logoReturned: !!(enrichedData?.logoUrl) });

    if (enrichedData) {
      if (DEBUG) console.log(`✅ Tool enriched successfully:`, enrichedData);
      setTools(prev => prev.map(tool => 
        tool.id === newTool.id 
          ? {
              ...tool,
              // Preserve original category and confirmedCategory from selection
              description: enrichedData.description || tool.description,
              logoUrl: enrichedData.logoUrl || tool.logoUrl,
              confidence: typeof enrichedData.confidence === 'number' ? enrichedData.confidence : tool.confidence,
            }
          : tool
      ));
    }
  }, [tools, enrichToolData, setTools]);

  const handleRemoveTool = useCallback((id: string) => {
    setTools(prev => prev.filter(tool => tool.id !== id));
  }, [setTools]);

  const handleContinue = () => {
    if (tools.length >= 3) {
      navigate('/tech-map');
    } else {
      setShowEmailCapture(true);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const
      }
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm mb-4">
                <Sparkles className="h-4 w-4" />
                Step 1: Add Your Tools
              </div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                Build Your Tech Stack
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Add the tools your team uses to get a complete view of your SaaS landscape
              </p>
            </motion.div>

            {/* Progress Indicator */}
            <motion.div variants={itemVariants} className="mb-8">
              <ProgressIndicator 
                currentStep={1} 
                totalSteps={3} 
                stepLabels={['Add Tools', 'Visualize Stack', 'Get Insights']}
              />
            </motion.div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Tool Search */}
              <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                {/* Tool Search */}
                <Card className="card-premium">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5 text-primary" />
                      Search & Add Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ToolSearchBar onAddTool={handleAddTool} existingTools={tools} />
                  </CardContent>
                </Card>

                {/* Added Tools */}
                <Card className="card-premium">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        Your Tools ({tools.length})
                      </span>
                      {tools.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {tools.length} added
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tools.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg font-medium mb-2">No tools added yet</p>
                        <p className="text-sm">Search above to start building your tech stack</p>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {tools.map((tool) => (
                          <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ToolChip
                              tool={tool}
                              onRemove={handleRemoveTool}
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Continue Button */}
                <motion.div 
                  variants={itemVariants}
                  className="flex justify-center"
                >
                  <Button
                    size="lg"
                    variant="premium"
                    onClick={handleContinue}
                    disabled={tools.length === 0}
                    className="group"
                  >
                    Continue to Visualization
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </motion.div>

              {/* Right Column - Sidebar */}
              <motion.div variants={itemVariants} className="space-y-6">
                {/* Quick Stats */}
                <Card className="card-premium">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tools Added</span>
                      <span className="font-semibold text-2xl">{tools.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Categories</span>
                      <span className="font-semibold">
                        {new Set(tools.map(t => t.category)).size}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Next Step</span>
                      <span className="text-sm font-medium text-primary">
                        {tools.length >= 3 ? 'Ready!' : `${3 - tools.length} more needed`}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Tips */}
                <Card className="card-premium">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Pro Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <p>Add at least 3 tools to get meaningful insights</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <p>Include tools from different categories for better analysis</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Settings className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <p>You can always edit or remove tools later</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Popular Tools */}
                <Card className="card-premium">
                  <CardHeader>
                    <CardTitle className="text-lg">Popular Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {['Slack', 'Notion', 'HubSpot', 'Salesforce', 'Zoom'].map((tool) => (
                        <Button
                          key={tool}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-sm"
                          onClick={() => handleAddTool(tool)}
                          disabled={tools.some(t => t.name.toLowerCase() === tool.toLowerCase())}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {tool}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* AI Suggestions Panel */}
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12"
              >
                <AISuggestionsPanel tools={tools} isVisible={showSuggestions} />
              </motion.div>
            )}

            {/* Email Capture */}
            {showEmailCapture && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12"
              >
                <EmailCaptureSection
                  onEmailCaptured={() => {
                    setEmailCaptured(true);
                    setShowEmailCapture(false);
                    navigate('/tech-map');
                  }}
                  onSkip={() => {
                    setShowEmailCapture(false);
                    navigate('/tech-map');
                  }}
                />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default AddTools;

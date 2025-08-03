import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight, Lightbulb, Sparkles, ArrowLeft, MapPin } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTools } from '@/contexts/ToolsContext';
import { SmartToolInput } from '@/components/SmartToolInput';

interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  logoUrl?: string;
  confidence?: number;
}

const AddTools = () => {
  const { tools: contextTools, setTools: setContextTools } = useTools();
  const [tools, setTools] = useState<Tool[]>([
    { id: "1", name: "", category: "", description: "", logoUrl: "", confidence: 0 }
  ]);
  const navigate = useNavigate();

  // Load tools from context on mount
  useEffect(() => {
    if (contextTools.length > 0) {
      setTools(contextTools);
    }
  }, [contextTools]);

  // Save to context when tools change
  useEffect(() => {
    const validTools = tools.filter(tool => tool.name.trim() && tool.category);
    if (validTools.length > 0) {
      setContextTools(validTools);
    }
  }, [tools, setContextTools]);

  const addTool = () => {
    const newTool: Tool = {
      id: Date.now().toString(),
      name: '',
      category: '',
      description: '',
      logoUrl: '',
      confidence: 0
    };
    setTools([...tools, newTool]);
  };

  const removeTool = (id: string) => {
    if (tools.length > 1) {
      setTools(tools.filter(tool => tool.id !== id));
    }
  };

  const updateTool = (id: string, field: keyof Tool, value: string | number) => {
    setTools(tools.map(tool => 
      tool.id === id ? { ...tool, [field]: value } : tool
    ));
  };

  const hasValidTools = tools.some(tool => tool.name.trim() && tool.category);

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

        {/* Tools Input Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Add Your Tech Tools
            </CardTitle>
            <CardDescription>
              Just enter the name of each tool you use - our AI will automatically identify the category, description, and even find the logo. It's that simple!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {tools.map((tool) => (
                <SmartToolInput
                  key={tool.id}
                  tool={tool}
                  onUpdate={updateTool}
                  onRemove={removeTool}
                />
              ))}
            </div>
            
            <Button
              onClick={addTool}
              variant="outline"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Tool
            </Button>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {tools.filter(tool => tool.name.trim()).length} tools added
                </p>
              </div>
              <Button
                onClick={() => navigate('/tech-map')}
                disabled={!hasValidTools}
                className="gap-2"
              >
                <MapPin className="h-4 w-4" />
                View Tech Map
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="mt-8 bg-gradient-to-r from-primary/5 to-primary-glow/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-3">💡 Quick Tips</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Just type the tool name (e.g., "Salesforce", "Slack", "HubSpot")</li>
                  <li>• Our AI will automatically find logos, categories, and descriptions</li>
                  <li>• You can manually edit any auto-filled information if needed</li>
                  <li>• Include all tools - even simple ones like email or spreadsheets</li>
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
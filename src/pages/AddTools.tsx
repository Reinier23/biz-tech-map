
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ArrowRight, Lightbulb, Sparkles, ArrowLeft, MapPin, Settings, MessageSquare, Database } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useTools } from '@/contexts/ToolsContext';
import { SmartToolInput } from '@/components/SmartToolInput';

interface Tool {
  id: string;
  name: string;
  category: string;
  confirmedCategory?: string; // User's confirmed category choice
  description: string;
  logoUrl?: string;
  confidence?: number;
}

const categories = [
  { 
    id: 'Marketing', 
    name: 'Marketing', 
    icon: Settings, 
    description: 'Tools for campaigns, analytics, and content creation',
    examples: ['HubSpot', 'Google Analytics', 'Mailchimp']
  },
  { 
    id: 'Sales', 
    name: 'Sales', 
    icon: MessageSquare, 
    description: 'CRM, lead generation, and sales automation tools',
    examples: ['Salesforce', 'Pipedrive', 'LinkedIn Sales Navigator'] 
  },
  { 
    id: 'Service', 
    name: 'Service', 
    icon: Database, 
    description: 'Customer support and service delivery tools',
    examples: ['Zendesk', 'Slack', 'Jira']
  }
];

const AddTools = () => {
  const { tools: contextTools, setTools: setContextTools } = useTools();
  const [toolsByCategory, setToolsByCategory] = useState<Record<string, Tool[]>>({
    Marketing: [{ id: "marketing-1", name: "", category: "Marketing", description: "", logoUrl: "", confidence: 0 }],
    Sales: [{ id: "sales-1", name: "", category: "Sales", description: "", logoUrl: "", confidence: 0 }],
    Service: [{ id: "service-1", name: "", category: "Service", description: "", logoUrl: "", confidence: 0 }]
  });
  const [activeTab, setActiveTab] = useState('Marketing');
  const navigate = useNavigate();

  // Load tools from context on mount only
  useEffect(() => {
    if (contextTools.length > 0) {
      const categorized = categories.reduce((acc, cat) => {
        acc[cat.id] = contextTools.filter(tool => (tool.confirmedCategory || tool.category) === cat.id);
        // Ensure at least one empty tool per category
        if (acc[cat.id].length === 0) {
          acc[cat.id] = [{ 
            id: `${cat.id.toLowerCase()}-${Date.now()}`, 
            name: "", 
            category: cat.id, 
            description: "", 
            logoUrl: "", 
            confidence: 0 
          }];
        }
        return acc;
      }, {} as Record<string, Tool[]>);
      setToolsByCategory(categorized);
    }
  }, []); // Only run on mount

  // Save to context when tools change, but avoid infinite loops
  useEffect(() => {
    const allTools = Object.values(toolsByCategory).flat();
    const validTools = allTools.filter(tool => tool.name.trim() && (tool.confirmedCategory || tool.category));
    
    // Only update context if tools actually changed
    const currentValidTools = contextTools.filter(tool => tool.name.trim() && (tool.confirmedCategory || tool.category));
    const toolsChanged = validTools.length !== currentValidTools.length || 
      validTools.some(tool => !currentValidTools.find(ct => ct.id === tool.id && ct.name === tool.name));
    
    if (toolsChanged && validTools.length > 0) {
      setContextTools(validTools);
    }
  }, [toolsByCategory]);

  const addTool = (category: string) => {
    const newTool: Tool = {
      id: `${category.toLowerCase()}-${Date.now()}`,
      name: '',
      category,
      description: '',
      logoUrl: '',
      confidence: 0
    };
    setToolsByCategory(prev => ({
      ...prev,
      [category]: [...prev[category], newTool]
    }));
  };

  const addExampleTool = (toolName: string, category: string) => {
    // Check if the tool already exists in this category
    const existingTool = toolsByCategory[category]?.find(tool => 
      tool.name.toLowerCase() === toolName.toLowerCase()
    );
    
    if (existingTool) return; // Don't add duplicates

    // Find the first empty tool or add a new one
    const emptyToolIndex = toolsByCategory[category]?.findIndex(tool => !tool.name.trim());
    
    if (emptyToolIndex !== -1) {
      // Fill the empty tool
      setToolsByCategory(prev => ({
        ...prev,
        [category]: prev[category].map((tool, index) => 
          index === emptyToolIndex 
            ? { ...tool, name: toolName }
            : tool
        )
      }));
    } else {
      // Add a new tool
      const newTool: Tool = {
        id: `${category.toLowerCase()}-${Date.now()}`,
        name: toolName,
        category,
        description: '',
        logoUrl: '',
        confidence: 0
      };
      setToolsByCategory(prev => ({
        ...prev,
        [category]: [...prev[category], newTool]
      }));
    }
  };

  const removeTool = (id: string, category: string) => {
    setToolsByCategory(prev => ({
      ...prev,
      [category]: prev[category].length > 1 
        ? prev[category].filter(tool => tool.id !== id)
        : prev[category]
    }));
  };

  const updateTool = (id: string, field: keyof Tool, value: string | number) => {
    setToolsByCategory(prev => {
      const newState = { ...prev };
      Object.keys(newState).forEach(category => {
        newState[category] = newState[category].map(tool => 
          tool.id === id ? { ...tool, [field]: value } : tool
        );
      });
      return newState;
    });
  };

  const getAllValidTools = () => {
    return Object.values(toolsByCategory).flat().filter(tool => tool.name.trim() && (tool.confirmedCategory || tool.category));
  };

  const getToolCountForCategory = (category: string) => {
    return toolsByCategory[category]?.filter(tool => tool.name.trim()).length || 0;
  };

  const hasValidTools = getAllValidTools().length > 0;

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
              Add Your Tech Tools by Category
            </CardTitle>
            <CardDescription>
              Organize your tools by business function. Just enter the tool names and our AI will handle the rest!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const toolCount = getToolCountForCategory(category.id);
                  return (
                    <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {category.name}
                      {toolCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                          {toolCount}
                        </span>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {categories.map((category) => (
                <TabsContent key={category.id} value={category.id} className="space-y-6 mt-6">
                  <div className="text-center pb-4 border-b">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <category.icon className="h-6 w-6 text-primary" />
                      <h3 className="text-lg font-semibold">{category.name} Tools</h3>
                    </div>
                    <p className="text-muted-foreground">{category.description}</p>
                    <div className="flex flex-wrap gap-2 justify-center mt-2">
                      {category.examples.map((example, idx) => (
                        <button
                          key={idx}
                          onClick={() => addExampleTool(example, category.id)}
                          className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {toolsByCategory[category.id]?.map((tool) => (
                      <SmartToolInput
                        key={tool.id}
                        tool={tool}
                        onUpdate={updateTool}
                        onRemove={(id: string) => removeTool(id, category.id)}
                      />
                    ))}
                  </div>
                  
                  <Button
                    onClick={() => addTool(category.id)}
                    variant="outline"
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another {category.name} Tool
                  </Button>
                </TabsContent>
              ))}
            </Tabs>

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t mt-6">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  {getAllValidTools().length} tools added across all categories
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

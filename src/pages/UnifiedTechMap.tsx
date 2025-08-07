import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Download, Settings, Database, MessageSquare, LayoutGrid, Network, Lightbulb, TrendingUp, AlertCircle, CheckCircle, RefreshCw, Info, Grid3X3, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTools } from "@/contexts/ToolsContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { SEO } from '@/components/SEO';

interface ConsolidationAnalysis {
  tool: {
    id: string;
    name: string;
    category: string;
    confirmedCategory?: string;
    description: string;
  };
  category: string;
  recommendation: "Replace" | "Evaluate" | "No Match" | "Keep";
  reason: string;
}

const UnifiedTechMap = () => {
  const { tools, updateTool } = useTools();
  const [activeTab, setActiveTab] = useState("cards");
  const [analysisResults, setAnalysisResults] = useState<ConsolidationAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sample data for demo
  const sampleTools = [
    { id: '1', name: 'Salesforce', category: 'Sales', confirmedCategory: 'Sales', description: 'Customer relationship management', manualRecommendation: undefined },
    { id: '2', name: 'HubSpot', category: 'Marketing', confirmedCategory: 'Marketing', description: 'Inbound marketing and sales platform', manualRecommendation: undefined },
    { id: '3', name: 'Zendesk', category: 'Service', confirmedCategory: 'Service', description: 'Customer service platform', manualRecommendation: undefined },
    { id: '4', name: 'Pipedrive', category: 'Sales', confirmedCategory: 'Sales', description: 'Sales pipeline management', manualRecommendation: undefined },
    { id: '5', name: 'Mailchimp', category: 'Marketing', confirmedCategory: 'Marketing', description: 'Email marketing automation', manualRecommendation: undefined },
    { id: '6', name: 'Intercom', category: 'Service', confirmedCategory: 'Service', description: 'Customer messaging platform', manualRecommendation: undefined },
    { id: '7', name: 'Outreach', category: 'Sales', confirmedCategory: 'Sales', description: 'Sales engagement platform', manualRecommendation: undefined },
    { id: '8', name: 'Pardot', category: 'Marketing', confirmedCategory: 'Marketing', description: 'B2B marketing automation', manualRecommendation: undefined },
    { id: '9', name: 'Freshdesk', category: 'Service', confirmedCategory: 'Service', description: 'Customer support software', manualRecommendation: undefined },
    { id: '10', name: 'LinkedIn Sales Navigator', category: 'Sales', confirmedCategory: 'Sales', description: 'Social selling platform', manualRecommendation: undefined },
    { id: '11', name: 'Google Analytics', category: 'Marketing', confirmedCategory: 'Marketing', description: 'Web analytics service', manualRecommendation: undefined },
    { id: '12', name: 'Slack', category: 'Service', confirmedCategory: 'Service', description: 'Team communication platform', manualRecommendation: undefined }
  ] as Array<{
    id: string;
    name: string;
    category: string;
    confirmedCategory: string;
    description: string;
    manualRecommendation?: "Replace" | "Evaluate" | "Keep";
  }>;

  // Use sample data if no tools are loaded
  const displayTools = tools.length > 0 ? tools : sampleTools;

  // Categorize tools
  const categorizedTools = {
    Sales: displayTools.filter(tool => (tool.confirmedCategory || tool.category) === "Sales"),
    Marketing: displayTools.filter(tool => (tool.confirmedCategory || tool.category) === "Marketing"),
    Service: displayTools.filter(tool => (tool.confirmedCategory || tool.category) === "Service"),
  };

  // AI Analysis
  const analyzeToolsWithAI = async () => {
    if (displayTools.length === 0) return;
    
    setIsLoading(true);
    try {
      const toolsWithConfirmedCategories = displayTools.map(tool => ({
        ...tool,
        category: tool.confirmedCategory || tool.category
      }));
      
      const { data, error } = await supabase.functions.invoke('suggestConsolidation', {
        body: { tools: toolsWithConfirmedCategories }
      });

      if (error) {
        console.error('Edge function error:', error);
        toast.error('Failed to analyze tools. Please try again.');
        return;
      }

      if (data?.results) {
        setAnalysisResults(data.results);
        toast.success('Analysis complete!');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze tools. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (displayTools.length > 0 && activeTab === "consolidation") {
      analyzeToolsWithAI();
    }
  }, [displayTools, activeTab]);

  // Get category icon and color
  const getCategoryConfig = (category: string) => {
    switch (category) {
      case "Sales":
        return { icon: Settings, color: "bg-primary", textColor: "text-primary" };
      case "Marketing":
        return { icon: MessageSquare, color: "bg-primary-glow", textColor: "text-primary-glow" };
      case "Service":
        return { icon: Database, color: "bg-accent", textColor: "text-accent" };
      default:
        return { icon: Settings, color: "bg-muted", textColor: "text-muted-foreground" };
    }
  };

  // Create nodes and edges for diagram view
  const createDiagramData = () => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let yOffset = 0;

    Object.entries(categorizedTools).forEach(([category, categoryTools], categoryIndex) => {
      const config = getCategoryConfig(category);
      
      // Category node
      nodes.push({
        id: `category-${category}`,
        type: 'default',
        position: { x: 200, y: yOffset },
        data: { label: category },
        style: {
          background: `hsl(var(--primary))`,
          color: 'white',
          border: '2px solid hsl(var(--primary))',
          borderRadius: '12px',
          fontWeight: 'bold',
          width: 120,
          height: 60,
        },
      });

      // Tool nodes for this category
      categoryTools.forEach((tool, toolIndex) => {
        const toolNodeId = `tool-${tool.id}`;
        nodes.push({
          id: toolNodeId,
          type: 'default',
          position: { 
            x: 400 + (toolIndex % 3) * 180, 
            y: yOffset + Math.floor(toolIndex / 3) * 80 
          },
          data: { label: tool.name },
          style: {
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
            width: 160,
            height: 50,
          },
        });

        // Edge from category to tool
        edges.push({
          id: `edge-${category}-${tool.id}`,
          source: `category-${category}`,
          target: toolNodeId,
          type: 'smoothstep',
          style: { stroke: 'hsl(var(--primary))' },
        });
      });

      yOffset += Math.max(150, Math.ceil(categoryTools.length / 3) * 80 + 100);
    });

    return { nodes, edges };
  };

  const { nodes: initialNodes, edges: initialEdges } = createDiagramData();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleExportPDF = () => {
    console.log('Exporting PDF...');
    window.print();
  };

  // Recommendation management
  const handleRecommendationChange = (toolId: string, recommendation: "Replace" | "Evaluate" | "Keep") => {
    updateTool(toolId, { manualRecommendation: recommendation });
    
    // Update analysis results if they exist
    setAnalysisResults(prev => 
      prev.map(analysis => 
        analysis.tool.id === toolId 
          ? { ...analysis, recommendation, reason: `Manually set to ${recommendation}` }
          : analysis
      )
    );
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "Replace":
        return <Badge variant="destructive" className="bg-green-100 text-green-800 border-green-200">Replace</Badge>;
      case "Evaluate":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Evaluate</Badge>;
      case "Keep":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Keep</Badge>;
      case "No Match":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">No Match</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "Replace":
        return <TrendingUp className="w-4 h-4 text-red-600" />;
      case "Evaluate":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "Keep":
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case "No Match":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return null;
    }
  };

  const replaceCount = analysisResults.filter(a => a.recommendation === "Replace").length;
  const evaluateCount = analysisResults.filter(a => a.recommendation === "Evaluate").length;

  return (
    <>
      <SEO
        title="Tech Map | Tech Stack Mapper"
        description="Visualize and analyze your tools with cards, diagrams, and AI consolidation insights."
        path="/tech-map"
      />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary" id="main-content">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link to="/add-tools" className="hover:text-foreground transition-colors">Step 1: Add Tools</Link>
            <span>→</span>
            <span className="text-foreground font-medium">Step 2: Visualize & Analyze</span>
            <span>→</span>
            <span>Step 3: Take Action</span>
      </div>
      </main>
    </>
        <header className="mb-8" aria-labelledby="page-title">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 id="page-title" className="text-4xl font-bold text-foreground mb-2">Your Tech Stack</h1>
              <p className="text-muted-foreground text-lg">
                {displayTools.length} tools across {Object.values(categorizedTools).filter(cat => cat.length > 0).length} categories
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={handleExportPDF} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </header>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Card View
            </TabsTrigger>
            <TabsTrigger value="diagram" className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Diagram View
            </TabsTrigger>
            <TabsTrigger value="consolidation" className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              AI Analysis
            </TabsTrigger>
          </TabsList>

          {/* Card View */}
          <TabsContent value="cards" className="space-y-8">
            {Object.entries(categorizedTools).map(([category, categoryTools]) => {
              if (categoryTools.length === 0) return null;
              
              const config = getCategoryConfig(category);
              const IconComponent = config.icon;

              return (
                <div key={category} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.color}`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">{category}</h2>
                    <Badge variant="secondary" className="ml-2">
                      {categoryTools.length} tool{categoryTools.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryTools.map((tool) => {
                      const currentAnalysis = analysisResults.find(a => a.tool.id === tool.id);
                      const recommendation = tool.manualRecommendation || currentAnalysis?.recommendation;
                      
                      return (
                        <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-md ${config.color}`}>
                                <IconComponent className="w-4 h-4 text-white" />
                              </div>
                              <CardTitle className="text-lg">{tool.name}</CardTitle>
                            </div>
                            {recommendation && (
                              <div className="flex items-center gap-2 mt-2">
                                {getActionIcon(recommendation)}
                                {getActionBadge(recommendation)}
                              </div>
                            )}
                          </CardHeader>
                          {tool.description && (
                            <CardContent className="pt-0">
                              <p className="text-sm text-muted-foreground mb-3">
                                {tool.description}
                              </p>
                              <div className="space-y-2">
                                <label className="text-xs font-medium text-muted-foreground">Manual Override:</label>
                                <Select
                                  value={tool.manualRecommendation || ""}
                                  onValueChange={(value) => handleRecommendationChange(tool.id, value as "Replace" | "Evaluate" | "Keep")}
                                >
                                  <SelectTrigger className="w-full h-8">
                                    <SelectValue placeholder="Set recommendation" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Replace">Replace</SelectItem>
                                    <SelectItem value="Evaluate">Evaluate</SelectItem>
                                    <SelectItem value="Keep">Keep</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          {/* Diagram View */}
          <TabsContent value="diagram">
            <Card className="h-[700px]">
              <CardContent className="p-0 h-full">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  fitView
                  attributionPosition="bottom-left"
                  style={{ backgroundColor: "hsl(var(--background))" }}
                >
                  <MiniMap 
                    zoomable 
                    pannable 
                    style={{ backgroundColor: "hsl(var(--card))" }}
                  />
                  <Controls />
                  <Background />
                </ReactFlow>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consolidation Analysis */}
          <TabsContent value="consolidation" className="space-y-6">
            {/* Legend */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Info className="w-5 h-5" />
                  Recommendation Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-red-600" />
                    <span><strong>Replace:</strong> &gt;80% feature overlap with HubSpot</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                    <span><strong>Evaluate:</strong> 50-79% overlap, requires review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span><strong>Keep:</strong> &lt;50% overlap or critical functionality</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loading State */}
            {isLoading && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center space-x-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <p className="text-muted-foreground">Analyzing your software stack for consolidation opportunities...</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary Cards */}
            {analysisResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tools to Replace</p>
                        <p className="text-3xl font-bold text-red-600">{replaceCount}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tools to Evaluate</p>
                        <p className="text-3xl font-bold text-yellow-600">{evaluateCount}</p>
                      </div>
                      <AlertCircle className="w-8 h-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Potential Savings</p>
                        <p className="text-3xl font-bold text-primary">
                          ${(replaceCount * 120 + evaluateCount * 50).toLocaleString()}
                        </p>
                      </div>
                      <Lightbulb className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Est. monthly savings</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Analysis Table */}
            {analysisResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    AI-Powered Tool Analysis
                  </CardTitle>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Each tool analyzed against HubSpot's capabilities. Override recommendations as needed.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={analyzeToolsWithAI}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh Analysis
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tool</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Recommendation</TableHead>
                        <TableHead>Manual Override</TableHead>
                        <TableHead>Reasoning</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analysisResults.map((analysis, index) => {
                        const tool = displayTools.find(t => t.id === analysis.tool.id);
                        const currentRecommendation = tool?.manualRecommendation || analysis.recommendation;
                        
                        return (
                          <TableRow key={`${analysis.tool.name}-${index}`}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{analysis.tool.name}</div>
                                {analysis.tool.description && (
                                  <div className="text-sm text-muted-foreground truncate max-w-xs">
                                    {analysis.tool.description}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{analysis.tool.confirmedCategory || analysis.tool.category}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getActionIcon(currentRecommendation)}
                                {getActionBadge(currentRecommendation)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={tool?.manualRecommendation || ""}
                                onValueChange={(value) => handleRecommendationChange(analysis.tool.id, value as "Replace" | "Evaluate" | "Keep")}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Override" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Replace">Replace</SelectItem>
                                  <SelectItem value="Evaluate">Evaluate</SelectItem>
                                  <SelectItem value="Keep">Keep</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="max-w-md">
                              <p className="text-sm">
                                {tool?.manualRecommendation ? `Manually set to ${tool.manualRecommendation}` : analysis.reason}
                              </p>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/add-tools">
            <Button variant="outline" size="lg">
              Edit Tools
            </Button>
          </Link>
          <Button variant="hero" size="lg">
            Get HubSpot Quote
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnifiedTechMap;
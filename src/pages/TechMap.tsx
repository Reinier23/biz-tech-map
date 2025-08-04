import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Settings, Database, MessageSquare, LayoutGrid, Network, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import { useTools } from "@/contexts/ToolsContext";
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

const TechMap = () => {
  const { tools } = useTools();
  const [isGridView, setIsGridView] = useState(true);

  // Sample data for demo
  const sampleTools = [
    { id: '1', name: 'Salesforce', category: 'Sales', description: 'Customer relationship management' },
    { id: '2', name: 'HubSpot', category: 'Marketing', description: 'Inbound marketing and sales platform' },
    { id: '3', name: 'Zendesk', category: 'Service', description: 'Customer service platform' },
    { id: '4', name: 'Pipedrive', category: 'Sales', description: 'Sales pipeline management' },
    { id: '5', name: 'Mailchimp', category: 'Marketing', description: 'Email marketing automation' },
    { id: '6', name: 'Intercom', category: 'Service', description: 'Customer messaging platform' },
    { id: '7', name: 'Outreach', category: 'Sales', description: 'Sales engagement platform' },
    { id: '8', name: 'Pardot', category: 'Marketing', description: 'B2B marketing automation' },
    { id: '9', name: 'Freshdesk', category: 'Service', description: 'Customer support software' },
    { id: '10', name: 'LinkedIn Sales Navigator', category: 'Sales', description: 'Social selling platform' },
    { id: '11', name: 'Google Analytics', category: 'Marketing', description: 'Web analytics service' },
    { id: '12', name: 'Slack', category: 'Service', description: 'Team communication platform' }
  ];

  // Use sample data if no tools are loaded
  const displayTools = tools.length > 0 ? tools : sampleTools;

  // Categorize tools (use sample data if no tools)
  const categorizedTools = {
    Sales: displayTools.filter(tool => tool.category === "Sales"),
    Marketing: displayTools.filter(tool => tool.category === "Marketing"),
    Service: displayTools.filter(tool => tool.category === "Service"),
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/add-tools" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Add Tools
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Your Tech Map</h1>
              <p className="text-muted-foreground text-lg">
                {displayTools.length} tools across {Object.values(categorizedTools).filter(cat => cat.length > 0).length} categories
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center space-x-3">
                <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                <Switch
                  checked={isGridView}
                  onCheckedChange={setIsGridView}
                />
                <Network className="w-4 h-4 text-muted-foreground" />
              </div>
              <Button onClick={handleExportPDF} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {isGridView ? (
          /* Card View */
          <div className="space-y-8">
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
                    {categoryTools.map((tool) => (
                      <Card key={tool.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-md ${config.color}`}>
                              <IconComponent className="w-4 h-4 text-white" />
                            </div>
                            <CardTitle className="text-lg">{tool.name}</CardTitle>
                          </div>
                        </CardHeader>
                        {tool.description && (
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground">
                              {tool.description}
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Diagram View */
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
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/add-tools">
            <Button variant="outline" size="lg">
              Edit Tools
            </Button>
          </Link>
          <Link to="/consolidation">
            <Button variant="secondary" size="lg">
              <Lightbulb className="w-4 h-4 mr-2" />
              Consolidation Ideas
            </Button>
          </Link>
          <Link to="/generate-map">
            <Button variant="hero" size="lg">
              Generate Advanced Map
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TechMap;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Map, Lightbulb, BarChart3, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useTools } from "@/contexts/ToolsContext";

const GenerateMap = () => {
  const { tools } = useTools();
  const [selectedView, setSelectedView] = useState<"category" | "flow" | "integration">("category");

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "sales":
        return <BarChart3 className="w-4 h-4" />;
      case "marketing":
        return <Zap className="w-4 h-4" />;
      case "service":
        return <Users className="w-4 h-4" />;
      default:
        return <Map className="w-4 h-4" />;
    }
  };

  const toolsByCategory = tools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, typeof tools>);

  if (tools.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Map className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">No Tools to Map</h2>
            <p className="text-muted-foreground mb-6">
              Add some tools first to generate your tech stack visualization.
            </p>
            <Link to="/add-tools">
              <Button variant="hero" size="lg">Add Tools</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Generate Tech Map</h1>
              <p className="text-muted-foreground text-lg">
                Visualize your {tools.length} tools and discover optimization opportunities
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/consolidation">
                <Button variant="outline" size="lg">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Get AI Insights
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* View Selector */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedView === "category" ? "default" : "outline"}
                onClick={() => setSelectedView("category")}
              >
                Category View
              </Button>
              <Button
                variant={selectedView === "flow" ? "default" : "outline"}
                onClick={() => setSelectedView("flow")}
              >
                Process Flow
              </Button>
              <Button
                variant={selectedView === "integration" ? "default" : "outline"}
                onClick={() => setSelectedView("integration")}
              >
                Integration Map
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Category View */}
        {selectedView === "category" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
              <Card key={category} className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    {category}
                    <Badge variant="secondary">{categoryTools.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryTools.map((tool) => (
                      <div
                        key={tool.id}
                        className="p-3 bg-secondary/50 rounded-lg border transition-colors hover:bg-secondary"
                      >
                        <div className="font-medium text-sm mb-1">{tool.name}</div>
                        {tool.description && (
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {tool.description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Process Flow View */}
        {selectedView === "flow" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Customer Journey Process Flow</CardTitle>
              <p className="text-sm text-muted-foreground">
                How your tools work together across the customer lifecycle
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <h4 className="font-semibold mb-3 text-center">Lead Generation</h4>
                  <div className="space-y-2">
                    {toolsByCategory.Marketing?.map((tool) => (
                      <div key={tool.id} className="p-2 bg-blue-50 border-l-4 border-blue-400 text-sm">
                        {tool.name}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-3 text-center">Sales Process</h4>
                  <div className="space-y-2">
                    {toolsByCategory.Sales?.map((tool) => (
                      <div key={tool.id} className="p-2 bg-green-50 border-l-4 border-green-400 text-sm">
                        {tool.name}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-3 text-center">Customer Success</h4>
                  <div className="space-y-2">
                    {toolsByCategory.Service?.map((tool) => (
                      <div key={tool.id} className="p-2 bg-purple-50 border-l-4 border-purple-400 text-sm">
                        {tool.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Integration Map View */}
        {selectedView === "integration" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Integration Complexity Map</CardTitle>
              <p className="text-sm text-muted-foreground">
                Understanding how your tools connect and potential consolidation opportunities
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{tool.name}</div>
                      <Badge variant="outline">{tool.category}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-3">
                      {tool.description?.slice(0, 80)}...
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Active Integration</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-primary/5 to-primary-glow/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Lightbulb className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">AI Consolidation Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Get intelligent recommendations on which tools can be consolidated with HubSpot
                  </p>
                </div>
              </div>
              <Link to="/consolidation">
                <Button variant="hero" size="lg" className="w-full">
                  Analyze Consolidation Opportunities
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Map className="w-8 h-8 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold text-lg">Detailed Tech Map</h3>
                  <p className="text-sm text-muted-foreground">
                    View your complete technology stack with detailed information and relationships
                  </p>
                </div>
              </div>
              <Link to="/tech-map">
                <Button variant="outline" size="lg" className="w-full">
                  View Full Tech Map
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{tools.length}</div>
                <div className="text-sm text-muted-foreground">Total Tools</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{Object.keys(toolsByCategory).length}</div>
                <div className="text-sm text-muted-foreground">Categories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">{tools.length * 2}</div>
                <div className="text-sm text-muted-foreground">Est. Integrations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">${(tools.length * 120).toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Est. Monthly Cost</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenerateMap;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, MapPin, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTools } from "@/contexts/ToolsContext";

interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
}

const AddTools = () => {
  const { tools: contextTools, setTools: setContextTools } = useTools();
  const [tools, setTools] = useState<Tool[]>([
    { id: "1", name: "", category: "", description: "" }
  ]);

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
      name: "",
      category: "",
      description: ""
    };
    setTools([...tools, newTool]);
  };

  const removeTool = (id: string) => {
    if (tools.length > 1) {
      setTools(tools.filter(tool => tool.id !== id));
    }
  };

  const updateTool = (id: string, field: keyof Tool, value: string) => {
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
            Enter all the sales, marketing, and service tools your company uses
          </p>
        </div>

        {/* Tools Input Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Plus className="w-6 h-6 mr-2 text-primary" />
              Technology Stack Inventory
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 pb-4 border-b border-border">
              <div className="col-span-4">
                <h3 className="font-semibold text-foreground">Tool Name</h3>
              </div>
              <div className="col-span-3">
                <h3 className="font-semibold text-foreground">Category</h3>
              </div>
              <div className="col-span-4">
                <h3 className="font-semibold text-foreground">Description (Optional)</h3>
              </div>
              <div className="col-span-1">
                <h3 className="font-semibold text-foreground">Actions</h3>
              </div>
            </div>

            {/* Tool Rows */}
            <div className="space-y-4">
              {tools.map((tool, index) => (
                <div key={tool.id} className="grid grid-cols-12 gap-4 items-start p-4 rounded-lg bg-card/50 hover:bg-card/80 transition-colors">
                  {/* Tool Name */}
                  <div className="col-span-4">
                    <Input
                      placeholder="e.g., Salesforce, HubSpot, Slack"
                      value={tool.name}
                      onChange={(e) => updateTool(tool.id, "name", e.target.value)}
                      className="bg-background border-border focus:border-primary"
                    />
                  </div>

                  {/* Category Dropdown */}
                  <div className="col-span-3">
                    <Select value={tool.category} onValueChange={(value) => updateTool(tool.id, "category", value)}>
                      <SelectTrigger className="bg-background border-border focus:border-primary">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border shadow-lg z-50">
                        <SelectItem value="Sales" className="hover:bg-accent focus:bg-accent">
                          Sales
                        </SelectItem>
                        <SelectItem value="Marketing" className="hover:bg-accent focus:bg-accent">
                          Marketing
                        </SelectItem>
                        <SelectItem value="Service" className="hover:bg-accent focus:bg-accent">
                          Service
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div className="col-span-4">
                    <Textarea
                      placeholder="Brief description of how this tool is used..."
                      value={tool.description}
                      onChange={(e) => updateTool(tool.id, "description", e.target.value)}
                      className="bg-background border-border focus:border-primary min-h-[40px] resize-none"
                      rows={1}
                    />
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-1 flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTool(tool.id)}
                      disabled={tools.length === 1}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Another Tool Button */}
            <Button
              onClick={addTool}
              variant="outline"
              className="w-full border-dashed border-2 border-primary/50 hover:border-primary hover:bg-primary/5 text-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Tool
            </Button>

            {/* Summary */}
            <div className="pt-6 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {tools.filter(tool => tool.name.trim()).length} tools added
                </div>
                <Link to="/tech-map">
                  <Button 
                    variant="hero" 
                    size="lg"
                    disabled={!hasValidTools}
                    className="px-8"
                  >
                    <MapPin className="w-5 h-5 mr-2" />
                    View Tech Map
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="mt-8 bg-gradient-to-r from-primary/5 to-primary-glow/5 border-primary/20">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-foreground mb-3">💡 Quick Tips</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Include all tools, even simple ones like email or spreadsheets</li>
              <li>• Don't worry about getting everything perfect - you can always add more later</li>
              <li>• Descriptions help identify overlapping functionality between tools</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddTools;
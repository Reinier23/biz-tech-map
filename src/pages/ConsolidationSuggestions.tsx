import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Lightbulb, TrendingUp, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useTools } from "@/contexts/ToolsContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";

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

const ConsolidationSuggestions = () => {
  const { tools } = useTools();
  const [analysisResults, setAnalysisResults] = useState<ConsolidationAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const analyzeToolsWithAI = async () => {
    if (tools.length === 0) return;
    
    setIsLoading(true);
    try {
      // Use confirmed category if available, otherwise fall back to AI category
      const toolsWithConfirmedCategories = tools.map(tool => ({
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
    if (tools.length > 0) {
      analyzeToolsWithAI();
    }
  }, [tools]);

  const replaceCount = analysisResults.filter(a => a.recommendation === "Replace").length;
  const evaluateCount = analysisResults.filter(a => a.recommendation === "Evaluate").length;

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

  if (tools.length === 0) {
    return (
      <>
        <SEO
          title="Consolidation Suggestions | Tech Stack Mapper"
          description="Get AI-driven recommendations to replace or evaluate tools and estimate savings."
          path="/consolidation"
        />
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center" id="main-content">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">No Tools to Analyze</h2>
            <p className="text-muted-foreground mb-6">
              Add some tools first to get consolidation suggestions.
            </p>
            <Link to="/add-tools">
              <Button variant="hero">Add Tools</Button>
            </Link>
          </CardContent>
        </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Consolidation Suggestions | Tech Stack Mapper"
        description="Get AI-driven recommendations to replace or evaluate tools and estimate savings."
        path="/consolidation"
      />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary" id="main-content">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8" aria-labelledby="page-title">
          <Link to="/generate-map" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Generate Map
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 id="page-title" className="text-4xl font-bold text-foreground mb-2">AI-Powered Consolidation Analysis</h1>
              <p className="text-muted-foreground text-lg">
                {isLoading ? "Generating consolidation insights..." : `Analysis of ${tools.length} tools against HubSpot capabilities`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={analyzeToolsWithAI}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'Analyzing...' : 'Refresh Analysis'}
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </header>

        {/* Loading State */}
        {isLoading && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2" role="status" aria-live="polite">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <p className="text-muted-foreground">Analyzing your software stack for consolidation opportunities... This may take a moment.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        {analysisResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <p className="text-sm text-muted-foreground">
                Each tool has been intelligently analyzed against HubSpot's comprehensive capabilities
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tool</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>AI Recommendation</TableHead>
                    <TableHead>AI Reasoning</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysisResults.map((analysis, index) => (
                    <TableRow 
                      key={`${analysis.tool.name}-${index}`}
                      className={
                        analysis.recommendation === "Replace" 
                          ? "bg-green-50 hover:bg-green-100" 
                          : analysis.recommendation === "Evaluate"
                          ? "bg-yellow-50 hover:bg-yellow-100"
                          : ""
                      }
                    >
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
                          {getActionIcon(analysis.recommendation)}
                          {getActionBadge(analysis.recommendation)}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <p className="text-sm">{analysis.reason}</p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Consolidation Benefits */}
        <Card className="mt-8 bg-gradient-to-r from-primary/5 to-primary-glow/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">Why Consolidate with HubSpot?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Cost Efficiency</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Reduce multiple subscription costs into a single, scalable platform with volume discounts.
                </p>
                
                <h4 className="font-semibold mb-2">Data Integration</h4>
                <p className="text-sm text-muted-foreground">
                  Eliminate data silos with unified customer records across sales, marketing, and service.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Training & Adoption</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Single platform reduces training complexity and improves team adoption rates.
                </p>
                
                <h4 className="font-semibold mb-2">Workflow Automation</h4>
                <p className="text-sm text-muted-foreground">
                  Native integrations enable seamless automation across your entire customer journey.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/generate-map">
            <Button variant="outline" size="lg">
              Back to Generate Map
            </Button>
          </Link>
          <Link to="/add-tools">
            <Button variant="secondary" size="lg">
              Edit Tools
            </Button>
          </Link>
          <Button variant="hero" size="lg">
            Get HubSpot Quote
          </Button>
        </div>
      </div>
    </main>
    </>
  );
};

export default ConsolidationSuggestions;
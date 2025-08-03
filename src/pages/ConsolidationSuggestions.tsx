import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Lightbulb, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useTools } from "@/contexts/ToolsContext";

interface ConsolidationAnalysis {
  tool: {
    id: string;
    name: string;
    category: string;
    description: string;
  };
  recommendedAction: "Replace" | "Evaluate" | "No Replacement";
  reason: string;
  potentialSavings?: string;
}

const ConsolidationSuggestions = () => {
  const { tools } = useTools();

  // HubSpot capabilities mapping
  const hubspotCapabilities = {
    crm: [
      "salesforce", "pipedrive", "zoho", "freshsales", "copper", "monday", "airtable",
      "contact management", "lead management", "deal tracking", "pipeline"
    ],
    marketing: [
      "mailchimp", "constant contact", "marketo", "pardot", "activecampaign", 
      "campaign monitor", "klaviyo", "convertkit", "drip", "aweber",
      "email marketing", "automation", "landing pages", "forms", "social media"
    ],
    service: [
      "zendesk", "freshdesk", "intercom", "drift", "livechat", "helpscout",
      "crisp", "chatbot", "knowledge base", "ticketing", "customer support"
    ]
  };

  // Analyze each tool against HubSpot capabilities
  const analyzeTools = (): ConsolidationAnalysis[] => {
    return tools.map(tool => {
      const toolName = tool.name.toLowerCase();
      const toolCategory = tool.category.toLowerCase();
      
      // Check if tool has HubSpot equivalent
      const hasDirectReplacement = (
        hubspotCapabilities.crm.some(cap => toolName.includes(cap)) ||
        hubspotCapabilities.marketing.some(cap => toolName.includes(cap)) ||
        hubspotCapabilities.service.some(cap => toolName.includes(cap))
      );

      // Category-based analysis
      let recommendedAction: "Replace" | "Evaluate" | "No Replacement";
      let reason: string;
      let potentialSavings: string | undefined;

      if (hasDirectReplacement) {
        recommendedAction = "Replace";
        reason = `HubSpot offers native ${toolCategory.toLowerCase()} functionality that directly replaces ${tool.name}`;
        potentialSavings = "High";
      } else if (toolCategory === "Sales" || toolCategory === "Marketing" || toolCategory === "Service") {
        recommendedAction = "Evaluate";
        reason = `${tool.name} may have overlapping features with HubSpot's ${toolCategory.toLowerCase()} suite. Review specific use cases.`;
        potentialSavings = "Medium";
      } else {
        recommendedAction = "No Replacement";
        reason = `${tool.name} appears to be specialized software without direct HubSpot equivalent`;
      }

      // Special cases for common tools
      if (toolName.includes("slack") || toolName.includes("teams") || toolName.includes("zoom")) {
        recommendedAction = "No Replacement";
        reason = "Communication tools are complementary to HubSpot and should be retained";
        potentialSavings = undefined;
      }

      if (toolName.includes("analytics") || toolName.includes("google") || toolName.includes("facebook")) {
        recommendedAction = "Evaluate";
        reason = "Marketing analytics tools may integrate well with HubSpot rather than being replaced";
        potentialSavings = "Low";
      }

      return {
        tool,
        recommendedAction,
        reason,
        potentialSavings
      };
    });
  };

  const analysisResults = analyzeTools();
  const replaceCount = analysisResults.filter(a => a.recommendedAction === "Replace").length;
  const evaluateCount = analysisResults.filter(a => a.recommendedAction === "Evaluate").length;

  const getActionBadge = (action: string) => {
    switch (action) {
      case "Replace":
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Replace</Badge>;
      case "Evaluate":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Evaluate</Badge>;
      case "No Replacement":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Keep</Badge>;
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
      case "No Replacement":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return null;
    }
  };

  if (tools.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex items-center justify-center">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/tech-map" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tech Map
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Consolidation Suggestions</h1>
              <p className="text-muted-foreground text-lg">
                Analysis of {tools.length} tools against HubSpot capabilities
              </p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
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

        {/* Analysis Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Tool-by-Tool Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tool</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Recommended Action</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Savings Potential</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysisResults.map((analysis) => (
                  <TableRow key={analysis.tool.id}>
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
                      <Badge variant="outline">{analysis.tool.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(analysis.recommendedAction)}
                        {getActionBadge(analysis.recommendedAction)}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm">{analysis.reason}</p>
                    </TableCell>
                    <TableCell>
                      {analysis.potentialSavings && (
                        <Badge 
                          variant="outline" 
                          className={
                            analysis.potentialSavings === "High" 
                              ? "bg-green-50 text-green-700 border-green-200"
                              : analysis.potentialSavings === "Medium"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }
                        >
                          {analysis.potentialSavings}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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
          <Link to="/tech-map">
            <Button variant="outline" size="lg">
              View Current Map
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
    </div>
  );
};

export default ConsolidationSuggestions;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTools } from '@/contexts/ToolsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, Trash2, CheckCircle } from 'lucide-react';
import { analyzeStack, type AnalyzedItem } from '@/lib/ruleEngine';
import { resolveCostsBatch } from '@/hooks/useToolCosts';
import { DEBUG } from '@/lib/config';

// Extended sample data with 12 tools across different categories
const sampleTools = [
  // Sales
  { id: 'salesforce-1', name: 'Salesforce', category: 'Sales', description: 'Cloud-based CRM platform for sales automation and customer relationship management.' },
  { id: 'pipedrive-1', name: 'Pipedrive', category: 'Sales', description: 'Visual sales pipeline management tool with deal tracking and activity reminders.' },
  { id: 'hubspot-crm-1', name: 'HubSpot CRM', category: 'Sales', description: 'Free CRM with contact management, deal tracking, and sales reporting.' },
  
  // Marketing
  { id: 'mailchimp-1', name: 'Mailchimp', category: 'Marketing', description: 'Email marketing platform with automation and audience segmentation.' },
  { id: 'marketo-1', name: 'Marketo', category: 'Marketing', description: 'Enterprise marketing automation platform with lead nurturing and analytics.' },
  { id: 'hubspot-marketing-1', name: 'HubSpot Marketing', category: 'Marketing', description: 'Inbound marketing platform with email, social media, and content tools.' },
  
  // Service
  { id: 'zendesk-1', name: 'Zendesk', category: 'Service', description: 'Customer service platform with ticketing system and knowledge base.' },
  { id: 'intercom-1', name: 'Intercom', category: 'Service', description: 'Customer messaging platform with live chat and help desk automation.' },
  { id: 'freshdesk-1', name: 'Freshdesk', category: 'Service', description: 'Customer support software with multi-channel ticketing and automation.' },
  
  // Analytics
  { id: 'google-analytics-1', name: 'Google Analytics', category: 'Analytics', description: 'Web analytics service for tracking website traffic and user behavior.' },
  { id: 'mixpanel-1', name: 'Mixpanel', category: 'Analytics', description: 'Product analytics platform for tracking user interactions and events.' },
  { id: 'amplitude-1', name: 'Amplitude', category: 'Analytics', description: 'Digital analytics platform for product teams to understand user behavior.' },
];

export default function QA() {
  const navigate = useNavigate();
  const { tools, setTools } = useTools();
  const [analysisResult, setAnalysisResult] = useState<AnalyzedItem[] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const seedSampleStack = () => {
    if (DEBUG) console.debug('QA: Seeding sample stack with', sampleTools.length, 'tools');
    setTools(sampleTools);
    setAnalysisResult(null);
  };

  const clearStack = () => {
    if (DEBUG) console.debug('QA: Clearing stack');
    setTools([]);
    setAnalysisResult(null);
  };

  const runAnalysis = async () => {
    if (tools.length === 0) {
      alert('Please seed sample data first');
      return;
    }

    setIsAnalyzing(true);
    try {
      if (DEBUG) console.debug('QA: Running analysis on', tools.length, 'tools');
      const costsByName = await resolveCostsBatch(tools);
      const result = analyzeStack(tools, costsByName);
      setAnalysisResult(result);
      if (DEBUG) console.debug('QA: Analysis complete:', result);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed - check console for details');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getActionCounts = () => {
    if (!analysisResult) return { replace: 0, evaluate: 0, keep: 0 };
    
    return analysisResult.reduce((acc: { replace: number; evaluate: number; keep: number }, item: AnalyzedItem) => {
      const action = item.action?.toLowerCase() || 'keep';
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    }, { replace: 0, evaluate: 0, keep: 0 });
  };

  const actionCounts = getActionCounts();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-3xl font-bold">QA Test Harness</h1>
            <p className="text-muted-foreground">Manual testing tools for development</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Test Data Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Test Data Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button onClick={seedSampleStack} variant="outline">
                  Seed Sample Stack ({sampleTools.length} tools)
                </Button>
                <Button onClick={clearStack} variant="ghost" disabled={tools.length === 0}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Stack
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Current stack: {tools.length} tools loaded
                {tools.length > 0 && (
                  <span className="ml-2">
                    ({tools.map(t => t.name).join(', ')})
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Analysis Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Testing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={runAnalysis} 
                disabled={tools.length === 0 || isAnalyzing}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                {isAnalyzing ? 'Analyzing...' : 'Run "Analyze & Optimize"'}
              </Button>
              
              {analysisResult && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Analysis Complete</span>
                  </div>
                  
                  <div className="flex gap-4">
                    <Badge variant="destructive">
                      Replace: {actionCounts.replace}
                    </Badge>
                    <Badge variant="secondary">
                      Evaluate: {actionCounts.evaluate}
                    </Badge>
                    <Badge variant="outline">
                      Keep: {actionCounts.keep}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Top Recommendations:</h4>
                    <div className="space-y-1 text-sm">
                      {analysisResult
                        .filter((item: AnalyzedItem) => item.action !== 'Keep')
                        .slice(0, 3)
                        .map((item: AnalyzedItem, idx: number) => (
                          <div key={idx} className="flex justify-between">
                            <span>{item.name}</span>
                            <Badge variant={item.action === 'Replace' ? 'destructive' : 'secondary'} className="text-xs">
                              {item.action}
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Navigation */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/add-tools')}>
                  Add Tools
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/tech-map')}>
                  Tech Map
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/consolidation')}>
                  Consolidation
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/audit')}>
                  Audit Log
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                  Settings
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate('/qa-check')}>
                  QA Check
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
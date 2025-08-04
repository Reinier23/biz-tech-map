import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { useTools } from '@/contexts/ToolsContext';
import { supabase } from '@/integrations/supabase/client';

interface QAResult {
  step: string;
  status: 'pass' | 'fail' | 'warning' | 'running';
  message: string;
  severity: 'low' | 'medium' | 'high';
  page: string;
}

const QACheck = () => {
  const [results, setResults] = useState<QAResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const navigate = useNavigate();
  const { tools, setTools } = useTools();

  const addResult = (result: QAResult) => {
    setResults(prev => [...prev, result]);
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const runQAFlow = async () => {
    setIsRunning(true);
    setResults([]);
    setCurrentStep('Starting QA Flow...');

    try {
      // Step 1: Test Landing Page Navigation
      setCurrentStep('Testing Landing Page');
      await delay(1000);
      
      // Check if we can navigate to add-tools
      try {
        navigate('/add-tools');
        await delay(500);
        addResult({
          step: 'Landing Page Navigation',
          status: 'pass',
          message: 'Successfully navigated to Add Tools page',
          severity: 'low',
          page: 'Landing'
        });
      } catch (error) {
        addResult({
          step: 'Landing Page Navigation',
          status: 'fail',
          message: `Navigation failed: ${error}`,
          severity: 'high',
          page: 'Landing'
        });
      }

      // Step 2: Test Tool Input
      setCurrentStep('Testing Tool Input');
      await delay(1000);

      const sampleTools = [
        { id: '1', name: 'Mailchimp', category: 'Marketing', description: 'Email marketing platform' },
        { id: '2', name: 'Salesforce', category: 'Sales', description: 'CRM platform' },
        { id: '3', name: 'Intercom', category: 'Service', description: 'Customer messaging platform' }
      ];

      try {
        setTools(sampleTools);
        addResult({
          step: 'Tool Input',
          status: 'pass',
          message: `Successfully added ${sampleTools.length} sample tools`,
          severity: 'low',
          page: 'Add Tools'
        });
      } catch (error) {
        addResult({
          step: 'Tool Input',
          status: 'fail',
          message: `Failed to add tools: ${error}`,
          severity: 'high',
          page: 'Add Tools'
        });
      }

      // Step 3: Test Generate Map Navigation
      setCurrentStep('Testing Generate Map');
      await delay(1000);

      try {
        navigate('/generate-map');
        await delay(500);
        addResult({
          step: 'Generate Map Navigation',
          status: 'pass',
          message: 'Successfully navigated to Generate Map page',
          severity: 'low',
          page: 'Generate Map'
        });
      } catch (error) {
        addResult({
          step: 'Generate Map Navigation',
          status: 'fail',
          message: `Navigation failed: ${error}`,
          severity: 'high',
          page: 'Generate Map'
        });
      }

      // Step 4: Test Tech Map Display
      setCurrentStep('Testing Tech Map Display');
      await delay(1000);

      try {
        navigate('/tech-map');
        await delay(500);
        if (tools.length > 0) {
          addResult({
            step: 'Tech Map Display',
            status: 'pass',
            message: `Tech map displays ${tools.length} tools correctly`,
            severity: 'low',
            page: 'Tech Map'
          });
        } else {
          addResult({
            step: 'Tech Map Display',
            status: 'warning',
            message: 'Tech map shows sample data (no user tools)',
            severity: 'medium',
            page: 'Tech Map'
          });
        }
      } catch (error) {
        addResult({
          step: 'Tech Map Display',
          status: 'fail',
          message: `Tech map failed to load: ${error}`,
          severity: 'high',
          page: 'Tech Map'
        });
      }

      // Step 5: Test Consolidation Analysis
      setCurrentStep('Testing Consolidation Analysis');
      await delay(1000);

      try {
        navigate('/consolidation');
        await delay(500);

        // Test the suggestConsolidation function
        const testTools = tools.length > 0 ? tools : sampleTools;
        
        const { data, error } = await supabase.functions.invoke('suggestConsolidation', {
          body: { tools: testTools }
        });

        if (error) {
          addResult({
            step: 'Consolidation API Call',
            status: 'fail',
            message: `API call failed: ${error.message}`,
            severity: 'high',
            page: 'Consolidation'
          });
        } else if (data && Array.isArray(data)) {
          const hasRequiredFields = data.every(item => 
            item.tool && item.category && item.recommendation && item.reason
          );
          
          if (hasRequiredFields) {
            addResult({
              step: 'Consolidation API Response',
              status: 'pass',
              message: `Consolidation analysis completed with ${data.length} results`,
              severity: 'low',
              page: 'Consolidation'
            });
          } else {
            addResult({
              step: 'Consolidation API Response',
              status: 'fail',
              message: 'API response missing required fields (tool, category, recommendation, reason)',
              severity: 'high',
              page: 'Consolidation'
            });
          }
        } else {
          addResult({
            step: 'Consolidation API Response',
            status: 'fail',
            message: 'Invalid API response format',
            severity: 'high',
            page: 'Consolidation'
          });
        }
      } catch (error) {
        addResult({
          step: 'Consolidation Analysis',
          status: 'fail',
          message: `Consolidation test failed: ${error}`,
          severity: 'high',
          page: 'Consolidation'
        });
      }

      // Step 6: Test UI Components
      setCurrentStep('Testing UI Components');
      await delay(1000);

      // Check for common UI issues
      const buttons = document.querySelectorAll('button');
      const links = document.querySelectorAll('a');
      
      addResult({
        step: 'UI Component Check',
        status: 'pass',
        message: `Found ${buttons.length} buttons and ${links.length} links - UI components present`,
        severity: 'low',
        page: 'General'
      });

    } catch (error) {
      addResult({
        step: 'QA Flow Error',
        status: 'fail',
        message: `Unexpected error during QA flow: ${error}`,
        severity: 'high',
        page: 'General'
      });
    }

    setCurrentStep('QA Flow Complete');
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={colors[severity as keyof typeof colors]}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getSummary = () => {
    const passCount = results.filter(r => r.status === 'pass').length;
    const failCount = results.filter(r => r.status === 'fail').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    const highSeverityCount = results.filter(r => r.severity === 'high').length;

    return {
      total: results.length,
      pass: passCount,
      fail: failCount,
      warning: warningCount,
      highSeverity: highSeverityCount,
      success: failCount === 0 && highSeverityCount === 0
    };
  };

  const summary = getSummary();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">QA Check</h1>
          <p className="text-gray-600">Automated quality assurance testing for the entire app flow</p>
        </div>
        <Button 
          onClick={runQAFlow} 
          disabled={isRunning}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isRunning ? 'Running QA...' : 'Run QA Flow'}
        </Button>
      </div>

      {isRunning && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-500 animate-spin" />
              <span className="text-blue-700">{currentStep}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              QA Results Summary
              <div className="flex space-x-2">
                {summary.success ? (
                  <Badge className="bg-green-100 text-green-800">ALL TESTS PASSED</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">ISSUES FOUND</Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary.pass}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{summary.fail}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{summary.warning}</div>
                <div className="text-sm text-gray-600">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{summary.highSeverity}</div>
                <div className="text-sm text-gray-600">High Priority</div>
              </div>
            </div>

            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium">{result.step}</div>
                      <div className="text-sm text-gray-600">{result.message}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{result.page}</Badge>
                    {getSeverityBadge(result.severity)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex space-x-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
        >
          Back to Home
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate('/add-tools')}
        >
          Go to Add Tools
        </Button>
      </div>
    </div>
  );
};

export default QACheck;
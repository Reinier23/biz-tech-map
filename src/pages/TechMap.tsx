import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Map, Grid3X3, BarChart3, Settings, Download, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

import { SEO } from '@/components/SEO';
import { useTools } from '@/contexts/ToolsContext';
import { useAuth } from '@/contexts/AuthContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { exportMapPNG, exportMapPDF } from '@/lib/export';
import { createShare } from '@/lib/share';
import { GraphView } from '@/components/tech-map/GraphView';
import { BoardView } from '@/components/tech-map/BoardView';
import { getUniqueCategories, getUniqueVendors } from '@/components/tech-map/utils/dataTransform';

const TechMapPage: React.FC = () => {
  const { tools } = useTools();
  const { user, requireSignIn } = useAuth();
  
  // State management
  const [viewMode, setViewMode] = useState<'graph' | 'board'>('graph');
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = tools.length;
    const categories = getUniqueCategories(tools);
    const vendors = getUniqueVendors(tools);
    const categoryCount = categories.length;
    const vendorCount = vendors.length;

    return {
      total,
      categoryCount,
      vendorCount,
      categories,
      vendors
    };
  }, [tools]);

  // Handle view mode change
  const handleViewModeChange = useCallback((mode: 'graph' | 'board') => {
    setViewMode(mode);
  }, []);

  // Handle node/tool click
  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedToolId(nodeId);
    // Could open a tool drawer here
  }, []);

  // Export functions
  const handleExportPNG = useCallback(async () => {
    setIsExporting(true);
    try {
      const dateStr = new Date().toISOString().slice(0, 10);
      const container = document.querySelector('.tech-map-container') as HTMLElement;
      if (container) {
        await exportMapPNG(container, `BizTechMap_TechMap_${dateStr}.png`);
        toast.success('PNG exported successfully');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export PNG');
    } finally {
      setIsExporting(false);
    }
  }, []);

  const handleExportPDF = useCallback(async () => {
    setIsExporting(true);
    try {
      const dateStr = new Date().toISOString().slice(0, 10);
      const container = document.querySelector('.tech-map-container') as HTMLElement;
      if (container) {
        await exportMapPDF(container, `BizTechMap_TechMap_${dateStr}.pdf`, 'Your Company');
        toast.success('PDF exported successfully');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  }, []);

  // Share function
  const handleCreateShare = useCallback(async () => {
    if (!user) {
      requireSignIn(() => { void handleCreateShare(); });
      return;
    }

    try {
      const payload = {
        tools,
        latestAnalysis: [], // Empty array for now, could be populated with actual analysis data
        techMapMeta: { 
          timestamp: Date.now(),
          viewMode,
          metrics
        },
      };
      
      const { id } = await createShare(payload);
      const url = `${window.location.origin}/share/${id}`;
      
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Share link copied to clipboard');
      } catch {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch {}
        document.body.removeChild(ta);
        toast.success('Share link copied to clipboard');
      }
    } catch (error) {
      console.error('Share creation failed:', error);
      toast.error('Failed to create share link');
    }
  }, [user, requireSignIn, tools, viewMode, metrics]);

  return (
    <>
      <SEO
        title="Tech Map | BizTechMap"
        description="Visualize your tech stack with modern, interactive maps and board views."
        path="/tech-map"
      />
      
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Link 
              to="/add-tools" 
              className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Add Tools
            </Link>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Tech Stack Map
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{metrics.total} tools</span>
                  <span>•</span>
                  <span>{metrics.categoryCount} categories</span>
                  <span>•</span>
                  <span>{metrics.vendorCount} vendors</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Export dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={isExporting}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                      {isExporting && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-3 h-3 border border-primary border-t-transparent rounded-full ml-2"
                        />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleExportPNG}>
                      Download PNG
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportPDF}>
                      Download PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Share button */}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCreateShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>

                {/* Settings */}
                <Link to="/settings">
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.header>

          {/* View Mode Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'graph' | 'board')}>
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="graph" className="flex items-center gap-2">
                  <Map className="w-4 h-4" />
                  Graph View
                </TabsTrigger>
                <TabsTrigger value="board" className="flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4" />
                  Board View
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="tech-map-container"
          >
            <ErrorBoundary onError={(error) => console.error('[TechMap] Error:', error)}>
              <Card className="h-[80vh] bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-0 h-full">
                  {viewMode === 'graph' ? (
                    <GraphView
                      tools={tools}
                      onNodeClick={handleNodeClick}
                      className="h-full"
                    />
                  ) : (
                    <BoardView
                      viewMode={viewMode as any}
                      onViewModeChange={handleViewModeChange as any}
                      onNodeClick={handleNodeClick}
                      className="h-full"
                    />
                  )}
                </CardContent>
              </Card>
            </ErrorBoundary>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex justify-center"
          >
            <Link to="/consolidation">
              <Button variant="secondary" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Next: Consolidation Ideas
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default TechMapPage;

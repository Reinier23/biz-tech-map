import React, { Suspense, lazy, useState, useCallback, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Loader2, Database, Zap, Smartphone } from 'lucide-react';
import { Tool } from '@/contexts/ToolsContext';
import { loadDemoData } from './utils/demoData';
import { DataFlowNode, DataFlowEdge, FlowViewMode, FlowFilterOptions } from './utils/flowTypes';
import { transformToolsToFlowData } from './utils/flowDataTransform';
import { useIsMobile } from '@/hooks/use-mobile';
import GraphViewErrorBoundary from './GraphViewErrorBoundary';

// Lazy load the main GraphView component
const GraphViewContent = lazy(() => import('./GraphViewContent'));
const BoardView = lazy(() => import('./BoardView'));

interface GraphViewProps {
  tools: Tool[];
  onNodeClick: (toolId: string) => void;
  className?: string;
}

// Loading fallback component
const GraphViewLoader: React.FC = () => (
  <div className="flex items-center justify-center h-96 bg-gradient-to-br from-card/50 to-card/30 rounded-xl border border-border/50">
    <div className="text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
      <p className="text-muted-foreground">Loading data flow visualization...</p>
    </div>
  </div>
);

// Empty state component
const EmptyState: React.FC<{ onLoadDemo: () => void }> = ({ onLoadDemo }) => (
  <div className="flex items-center justify-center h-96 bg-gradient-to-br from-card/50 to-card/30 rounded-xl border border-border/50">
    <div className="text-center max-w-md">
      <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg font-semibold mb-2">No Data Flow Available</h3>
      <p className="text-muted-foreground mb-6">
        Add tools to your stack to see data flow connections and integrations between them.
      </p>
      <Button 
        onClick={onLoadDemo} 
        variant="premium" 
        className="gap-2"
      >
        <Zap className="w-4 h-4" />
        Load Demo Data
      </Button>
    </div>
  </div>
);

export const GraphView: React.FC<GraphViewProps> = ({ 
  tools, 
  onNodeClick, 
  className = "" 
}) => {
  // Mobile detection
  const isMobile = useIsMobile();
  
  // State management
  const [viewMode, setViewMode] = useState<FlowViewMode>('data-flow');
  const [filters, setFilters] = useState<FlowFilterOptions>({
    categories: [],
    flowTypes: ['native', 'custom', 'existing'],
    vendors: [],
    search: '',
    showDataLabels: true,
    showHubs: true
  });
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoData, setDemoData] = useState<{ nodes: DataFlowNode[]; edges: DataFlowEdge[] } | null>(null);

  // Load demo data
  const handleLoadDemo = useCallback(() => {
    const demo = loadDemoData();
    setDemoData(demo);
    setIsDemoMode(true);
  }, []);

  // Reset demo mode
  const handleResetDemo = useCallback(() => {
    setDemoData(null);
    setIsDemoMode(false);
  }, []);

  // Determine if we should show empty state
  const shouldShowEmptyState = useMemo(() => {
    return tools.length === 0 && !isDemoMode;
  }, [tools.length, isDemoMode]);

  // Determine if we should show demo state
  const shouldShowDemoState = useMemo(() => {
    return isDemoMode && demoData;
  }, [isDemoMode, demoData]);

  // Transform tools to data flow nodes
  const transformedNodes = useMemo(() => {
    if (shouldShowDemoState && demoData) {
      return demoData.nodes;
    }
    
    // Transform real tools to data flow format
    const flowData = transformToolsToFlowData(tools);
    return flowData.nodes;
  }, [shouldShowDemoState, demoData, tools]);

  const transformedEdges = useMemo(() => {
    if (shouldShowDemoState && demoData) {
      return demoData.edges;
    }
    
    // Transform real tools to data flow format
    const flowData = transformToolsToFlowData(tools);
    return flowData.edges;
  }, [shouldShowDemoState, demoData, tools]);

  // Auto-switch to BoardView on mobile
  useEffect(() => {
    if (isMobile && viewMode === 'data-flow') {
      setViewMode('simple-map');
    }
  }, [isMobile, viewMode]);

  // Handle node click
  const handleNodeClick = useCallback((nodeId: string) => {
    onNodeClick(nodeId);
  }, [onNodeClick]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: Partial<FlowFilterOptions>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Handle view mode change
  const handleViewModeChange = useCallback((mode: FlowViewMode) => {
    setViewMode(mode);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Demo mode indicator */}
      {isDemoMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 z-10"
        >
          <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Demo Mode</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetDemo}
              className="h-6 px-2 text-xs"
            >
              Exit
            </Button>
          </div>
        </motion.div>
      )}

      {/* Main content */}
      {shouldShowEmptyState ? (
        <EmptyState onLoadDemo={handleLoadDemo} />
      ) : (
        <GraphViewErrorBoundary>
          <Suspense fallback={<GraphViewLoader />}>
            {isMobile ? (
              <BoardView
                viewMode={viewMode as any}
                onViewModeChange={handleViewModeChange as any}
                onNodeClick={handleNodeClick}
                className="h-full"
              />
            ) : (
              <GraphViewContent
                nodes={transformedNodes}
                edges={transformedEdges}
                viewMode={viewMode}
                filters={filters}
                onNodeClick={handleNodeClick}
                onFilterChange={handleFilterChange}
                onViewModeChange={handleViewModeChange}
                isDemoMode={isDemoMode}
              />
            )}
          </Suspense>
        </GraphViewErrorBoundary>
      )}

      {/* Mobile indicator */}
      {isMobile && !shouldShowEmptyState && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 right-4 z-10"
        >
          <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-2 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Mobile View</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GraphView;

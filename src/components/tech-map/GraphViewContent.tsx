import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowInstance
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { DataFlowNode, DataFlowEdge, FlowViewMode, FlowFilterOptions, HoverState } from './utils/flowTypes';
import { applyLayout, getRecommendedLayout, optimizeLayout } from './utils/flowLayout';
import DataFlowNodeComponent from './DataFlowNode';
import DataFlowEdgeComponent from './DataFlowEdge';
import CategoryGroup from './CategoryGroup';
import FlowLegend from './FlowLegend';
import FlowControls from './FlowControls';

interface GraphViewContentProps {
  nodes: DataFlowNode[];
  edges: DataFlowEdge[];
  viewMode: FlowViewMode;
  filters: FlowFilterOptions;
  onNodeClick: (nodeId: string) => void;
  onFilterChange: (filters: Partial<FlowFilterOptions>) => void;
  onViewModeChange: (mode: FlowViewMode) => void;
  isDemoMode: boolean;
}

// Helper functions
const getConnectedNodeIds = (nodeId: string, edges: DataFlowEdge[]): string[] => {
  const connected: string[] = [];
  edges.forEach(edge => {
    if (edge.source === nodeId) connected.push(edge.target);
    if (edge.target === nodeId) connected.push(edge.source);
  });
  return [...new Set(connected)];
};

const getUniqueCategories = (nodes: DataFlowNode[]): string[] => {
  return [...new Set(nodes.map(node => node.data.category))].sort();
};

const getUniqueVendors = (nodes: DataFlowNode[]): string[] => {
  return [...new Set(nodes.map(node => node.data.vendor).filter(Boolean))].sort();
};

const GraphViewContentInner: React.FC<GraphViewContentProps> = ({
  nodes,
  edges,
  viewMode,
  filters,
  onNodeClick,
  onFilterChange,
  onViewModeChange,
  isDemoMode
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoverState, setHoverState] = useState<HoverState>({ nodeId: null, highlightConnections: false });
  const [isFocusMode, setIsFocusMode] = useState(false);

  // React Flow state
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState([]);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState([]);

  // Get connected nodes for focus mode
  const connectedNodeIds = useMemo(() => {
    if (!hoverState.nodeId || !isFocusMode) return new Set<string>();
    return new Set(getConnectedNodeIds(hoverState.nodeId, edges));
  }, [hoverState.nodeId, isFocusMode, edges]);

  // Filter nodes and edges based on focus mode
  const filteredNodes = useMemo(() => {
    if (!isFocusMode || !hoverState.nodeId) return nodes;
    
    const connectedIds = getConnectedNodeIds(hoverState.nodeId, edges);
    const focusIds = new Set([hoverState.nodeId, ...connectedIds]);
    
    return nodes.filter(node => focusIds.has(node.id));
  }, [nodes, edges, isFocusMode, hoverState.nodeId]);

  const filteredEdges = useMemo(() => {
    if (!isFocusMode || !hoverState.nodeId) return edges;
    
    const connectedIds = getConnectedNodeIds(hoverState.nodeId, edges);
    const focusIds = new Set([hoverState.nodeId, ...connectedIds]);
    
    return edges.filter(edge => 
      focusIds.has(edge.source) && focusIds.has(edge.target)
    );
  }, [edges, isFocusMode, hoverState.nodeId]);

  // Apply layout to nodes
  const layoutedNodes = useMemo(() => {
    const nodesToLayout = isFocusMode ? filteredNodes : nodes;
    const edgesToLayout = isFocusMode ? filteredEdges : edges;
    
    if (nodesToLayout.length === 0) return nodesToLayout;
    
    const layoutType = getRecommendedLayout(nodesToLayout, edgesToLayout);
    const optimized = optimizeLayout(nodesToLayout, edgesToLayout);
    return applyLayout(optimized.nodes, optimized.edges, layoutType);
  }, [nodes, edges, filteredNodes, filteredEdges, isFocusMode]);

  // Update React Flow state when layouted data changes
  useEffect(() => {
    setFlowNodes(layoutedNodes);
    setFlowEdges(isFocusMode ? filteredEdges : edges);
  }, [layoutedNodes, edges, filteredEdges, isFocusMode, setFlowNodes, setFlowEdges]);

  // Auto-fit view when data changes
  useEffect(() => {
    if (reactFlowInstance && layoutedNodes.length > 0) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.1, duration: 800 });
      }, 100);
    }
  }, [reactFlowInstance, layoutedNodes]);

  // Handle node click
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    onNodeClick(node.id);
  }, [onNodeClick]);

  // Handle node focus (hover)
  const handleNodeFocus = useCallback((nodeId: string) => {
    setHoverState({ nodeId, highlightConnections: true });
  }, []);

  // Handle node blur
  const handleNodeBlur = useCallback(() => {
    setHoverState({ nodeId: null, highlightConnections: false });
  }, []);

  // Handle focus mode toggle
  const handleToggleFocusMode = useCallback(() => {
    setIsFocusMode(!isFocusMode);
  }, [isFocusMode]);

  // Handle escape key to clear focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setHoverState({ nodeId: null, highlightConnections: false });
        setIsFocusMode(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle edge connection
  const onConnect = useCallback((params: Connection) => {
    setFlowEdges((eds) => addEdge(params, eds));
  }, [setFlowEdges]);

  // Handle React Flow instance
  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
  }, []);

  // Node types
  const nodeTypes = useMemo(() => ({
    dataFlowNode: (props: any) => (
      <DataFlowNodeComponent 
        {...props} 
        selected={selectedNodeId === props.id}
        onClick={handleNodeClick}
        onFocus={handleNodeFocus}
        onBlur={handleNodeBlur}
        isFocused={hoverState.nodeId && hoverState.nodeId !== props.id && !connectedNodeIds.has(props.id)}
      />
    )
  }), [selectedNodeId, handleNodeClick, handleNodeFocus, handleNodeBlur, hoverState.nodeId, connectedNodeIds]);

  // Edge types
  const edgeTypes = useMemo(() => ({
    dataFlowEdge: (props: any) => (
      <DataFlowEdgeComponent 
        {...props}
        isFocused={hoverState.nodeId && hoverState.nodeId !== props.source && hoverState.nodeId !== props.target && !connectedNodeIds.has(props.source) && !connectedNodeIds.has(props.target)}
        isHighlighted={hoverState.nodeId && (hoverState.nodeId === props.source || hoverState.nodeId === props.target)}
      />
    )
  }), [hoverState.nodeId, connectedNodeIds]);

  return (
    <div className="relative h-full">
      {/* React Flow */}
      <div ref={reactFlowWrapper} className="w-full h-full">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={onInit}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          proOptions={{ hideAttribution: true }}
          style={{ backgroundColor: 'hsl(var(--background))' }}
          className="bg-gradient-to-br from-background to-muted/20"
        >
          {/* Background */}
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={24} 
            size={1}
            color="hsl(var(--muted-foreground))"
            className="opacity-20"
          />

          {/* Controls */}
          <Controls className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg" />

          {/* Mini Map */}
          <MiniMap 
            zoomable 
            pannable 
            style={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
            nodeColor="hsl(var(--primary))"
            maskColor="hsl(var(--background) / 0.1)"
          />

          {/* Top Panel - Flow Controls */}
          <Panel position="top-left">
            <FlowControls
              filters={filters}
              onFilterChange={onFilterChange}
              categories={getUniqueCategories(nodes)}
              vendors={getUniqueVendors(nodes)}
              isFocusMode={isFocusMode}
              onToggleFocusMode={handleToggleFocusMode}
            />
          </Panel>

          {/* Top Right Panel - Flow Legend */}
          <Panel position="top-right">
            <FlowLegend
              filters={filters}
              onFilterChange={onFilterChange}
            />
          </Panel>

          {/* Bottom Left Panel - Metrics */}
          <Panel position="bottom-left">
            <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>{isFocusMode ? filteredNodes.length : nodes.length} tools</span>
                <span>{isFocusMode ? filteredEdges.length : edges.length} connections</span>
                <span>{new Set((isFocusMode ? filteredNodes : nodes).map(n => n.data.category)).size} categories</span>
                {isFocusMode && (
                  <span className="text-primary">Focus mode</span>
                )}
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Category Groups Background */}
      {!isFocusMode && nodes.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {getUniqueCategories(nodes).map((category, index) => {
            const categoryNodes = nodes.filter(node => node.data.category === category);
            if (categoryNodes.length === 0) return null;
            
            // Calculate category bounds
            const positions = categoryNodes.map(node => node.position);
            const minX = Math.min(...positions.map(p => p.x));
            const maxX = Math.max(...positions.map(p => p.x));
            const minY = Math.min(...positions.map(p => p.y));
            const maxY = Math.max(...positions.map(p => p.y));
            
            return (
              <CategoryGroup
                key={category}
                category={category}
                position={{ x: minX - 50, y: minY - 50 }}
                width={maxX - minX + 340}
                height={maxY - minY + 180}
                toolCount={categoryNodes.length}
                isVisible={!filters.categories.length || filters.categories.includes(category)}
              />
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">No data to visualize</h3>
            <p className="text-muted-foreground">Add tools or load demo data to see the flow</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrap with ReactFlowProvider
const GraphViewContent: React.FC<GraphViewContentProps> = (props) => {
  return (
    <ReactFlowProvider>
      <GraphViewContentInner {...props} />
    </ReactFlowProvider>
  );
};

export default GraphViewContent;

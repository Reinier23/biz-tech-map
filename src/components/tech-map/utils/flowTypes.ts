import { Node, Edge } from '@xyflow/react';
import { Tool } from '@/contexts/ToolsContext';

// Enhanced Tool interface with data flow properties
export interface EnhancedTool extends Tool {
  vendor?: string;
  domain?: string;
  isHub?: boolean; // Central hub like HubSpot
  prominence?: 'primary' | 'secondary' | 'tertiary';
  integrationCount?: number;
  dataVolume?: 'high' | 'medium' | 'low';
  lastSync?: Date;
}

// Data flow types
export interface DataFlow {
  type: 'contacts' | 'deals' | 'analytics' | 'events' | 'users' | 'custom';
  direction: 'in' | 'out' | 'bidirectional';
  frequency: 'realtime' | 'hourly' | 'daily' | 'manual';
  volume: 'high' | 'medium' | 'low';
}

// Flow types for integration styling
export type FlowType = 'native' | 'custom' | 'existing';

// Enhanced node for data flow visualization
export interface DataFlowNode extends Node {
  data: {
    tool: EnhancedTool;
    category: string;
    vendor?: string;
    
    // Data flow properties
    dataIn: DataFlow[];
    dataOut: DataFlow[];
    isHub: boolean;
    
    // Visual properties
    nodeType: 'tool' | 'hub' | 'category';
    prominence: 'primary' | 'secondary' | 'tertiary';
    
    // Metadata
    integrationCount: number;
    dataVolume: 'high' | 'medium' | 'low';
    lastSync?: Date;
  };
}

// Enhanced edge for data flow connections
export interface DataFlowEdge extends Edge {
  data: {
    // Connection details
    sourceTool: string;
    targetTool: string;
    flowType: FlowType;
    
    // Data being transferred
    datasets: string[]; // ['contacts', 'deals', 'analytics', etc.]
    direction: 'bidirectional' | 'unidirectional';
    
    // Integration details
    integrationName?: string;
    syncFrequency?: 'realtime' | 'hourly' | 'daily' | 'manual';
    reliability: number; // 0-1 confidence score
    
    // Visual properties
    edgeType: 'solid' | 'dashed' | 'dotted';
    thickness: 'thin' | 'medium' | 'thick';
    color: string; // Based on flow type
  };
}

// Category group configuration
export interface CategoryGroup {
  name: string;
  color: string;
  background: string;
  position: { x: number; y: number };
  width: number;
  height: number;
}

// Flow type styling configuration
export interface FlowTypeStyle {
  color: string;
  pattern: 'solid' | 'dashed' | 'dotted';
  thickness: 'thin' | 'medium' | 'thick';
  arrowStyle: 'filled' | 'hollow' | 'none';
}

// Filter options
export interface FlowFilterOptions {
  categories: string[];
  flowTypes: FlowType[];
  vendors: string[];
  search: string;
  showDataLabels: boolean;
  showHubs: boolean;
}

// View modes
export type FlowViewMode = 'data-flow' | 'simple-map';

// Hover state
export interface HoverState {
  nodeId: string | null;
  highlightConnections: boolean;
}

// Layout configuration
export interface LayoutConfig {
  type: 'dagre' | 'swimlanes' | 'force';
  direction: 'TB' | 'LR' | 'BT' | 'RL';
  nodeSpacing: number;
  rankSpacing: number;
  categorySpacing: number;
}

// Performance metrics
export interface PerformanceMetrics {
  nodeCount: number;
  edgeCount: number;
  renderTime: number;
  layoutTime: number;
  fps: number;
}

// Demo data structure
export interface DemoData {
  nodes: DataFlowNode[];
  edges: DataFlowEdge[];
  description: string;
}

// Legend item
export interface LegendItem {
  type: FlowType;
  label: string;
  description: string;
  style: FlowTypeStyle;
  visible: boolean;
}

// Tooltip content
export interface TooltipContent {
  tool: EnhancedTool;
  dataIn: DataFlow[];
  dataOut: DataFlow[];
  connections: {
    incoming: number;
    outgoing: number;
    bidirectional: number;
  };
  integrations: {
    native: number;
    custom: number;
    existing: number;
  };
}

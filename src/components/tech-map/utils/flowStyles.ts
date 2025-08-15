import { FlowTypeStyle, CategoryGroup, FlowType } from './flowTypes';

// Flow type styling configuration
export const FLOW_TYPE_STYLES: Record<string, FlowTypeStyle> = {
  native: {
    color: '#10B981', // Green
    pattern: 'solid',
    thickness: 'thick',
    arrowStyle: 'filled'
  },
  custom: {
    color: '#3B82F6', // Blue
    pattern: 'dashed',
    thickness: 'medium',
    arrowStyle: 'hollow'
  },
  existing: {
    color: '#6B7280', // Gray
    pattern: 'dotted',
    thickness: 'thin',
    arrowStyle: 'none'
  }
};

// Category group configurations
export const CATEGORY_GROUPS: Record<string, CategoryGroup> = {
  'Sales': {
    name: 'Sales',
    color: '#F472B6', // Pink
    background: 'rgba(244, 114, 182, 0.1)',
    position: { x: 0, y: 0 },
    width: 800,
    height: 300
  },
  'Marketing': {
    name: 'Marketing',
    color: '#60A5FA', // Blue
    background: 'rgba(96, 165, 250, 0.1)',
    position: { x: 850, y: 0 },
    width: 800,
    height: 300
  },
  'Service': {
    name: 'Service',
    color: '#34D399', // Green
    background: 'rgba(52, 211, 153, 0.1)',
    position: { x: 0, y: 350 },
    width: 800,
    height: 300
  },
  'Analytics': {
    name: 'Analytics',
    color: '#A78BFA', // Purple
    background: 'rgba(167, 139, 250, 0.1)',
    position: { x: 850, y: 350 },
    width: 800,
    height: 300
  },
  'Operations': {
    name: 'Operations',
    color: '#F59E0B', // Orange
    background: 'rgba(245, 158, 11, 0.1)',
    position: { x: 0, y: 700 },
    width: 800,
    height: 300
  },
  'Development': {
    name: 'Development',
    color: '#10B981', // Emerald
    background: 'rgba(16, 185, 129, 0.1)',
    position: { x: 850, y: 700 },
    width: 800,
    height: 300
  }
};

// Hub styling configuration
export const HUB_STYLES = {
  primary: {
    borderColor: '#F472B6',
    borderWidth: '3px',
    shadow: '0 0 0 4px rgba(244, 114, 182, 0.2)',
    scale: 1.1
  },
  secondary: {
    borderColor: '#60A5FA',
    borderWidth: '2px',
    shadow: '0 0 0 3px rgba(96, 165, 250, 0.15)',
    scale: 1.05
  }
};

// Node prominence styling
export const PROMINENCE_STYLES = {
  primary: {
    borderWidth: '2px',
    shadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    scale: 1.05
  },
  secondary: {
    borderWidth: '1px',
    shadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    scale: 1.02
  },
  tertiary: {
    borderWidth: '1px',
    shadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
    scale: 1.0
  }
};

// Edge thickness values
export const EDGE_THICKNESS = {
  thin: 1,
  medium: 2,
  thick: 3
};

// Animation durations
export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  layout: 800
};

// Layout configuration
export const LAYOUT_CONFIG = {
  dagre: {
    rankdir: 'TB' as const,
    nodesep: 60,
    ranksep: 80,
    marginx: 50,
    marginy: 50
  },
  swimlanes: {
    categorySpacing: 120,
    nodeSpacing: 40,
    horizontalPadding: 50,
    verticalPadding: 50
  }
};

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  maxNodes: 100,
  maxEdges: 200,
  targetFPS: 60,
  layoutTimeout: 5000
};

// Z-index layers
export const Z_INDEX = {
  background: 0,
  categoryGroups: 1,
  edges: 5,
  nodes: 10,
  controls: 20,
  tooltip: 30,
  legend: 40,
  modal: 50
};

// Responsive breakpoints
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280
};

// Data volume indicators
export const DATA_VOLUME_COLORS = {
  high: '#EF4444', // Red
  medium: '#F59E0B', // Orange
  low: '#10B981' // Green
};

// Integration frequency indicators
export const SYNC_FREQUENCY_COLORS = {
  realtime: '#10B981', // Green
  hourly: '#3B82F6', // Blue
  daily: '#F59E0B', // Orange
  manual: '#6B7280' // Gray
};

// Legend configuration
export const LEGEND_ITEMS = [
  {
    type: 'native' as FlowType,
    label: 'Native Integration',
    description: 'Built-in integration between tools',
    style: FLOW_TYPE_STYLES.native
  },
  {
    type: 'custom' as FlowType,
    label: 'Custom API',
    description: 'Custom API integration',
    style: FLOW_TYPE_STYLES.custom
  },
  {
    type: 'existing' as FlowType,
    label: 'Existing Connection',
    description: 'Manual or existing data flow',
    style: FLOW_TYPE_STYLES.existing
  }
];

// Tooltip positioning
export const TOOLTIP_OFFSET = {
  x: 10,
  y: 10
};

// Hover effects
export const HOVER_EFFECTS = {
  nodeScale: 1.05,
  nodeShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  edgeOpacity: 0.8,
  dimOpacity: 0.3
};

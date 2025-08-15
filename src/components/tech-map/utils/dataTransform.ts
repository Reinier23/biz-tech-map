import { Tool } from '@/contexts/ToolsContext';
import { 
  EnhancedTool, 
  ToolNode, 
  CategoryNode, 
  ToolConnection,
  CategoryConfig 
} from './types';

// Category configurations with premium styling
export const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  'Sales': {
    name: 'Sales',
    color: '#F472B6', // Pink
    icon: '💼',
    description: 'Customer acquisition and sales tools',
    order: 1
  },
  'Marketing': {
    name: 'Marketing',
    color: '#60A5FA', // Blue
    icon: '📢',
    description: 'Marketing and lead generation tools',
    order: 2
  },
  'Service': {
    name: 'Service',
    color: '#34D399', // Green
    icon: '🎧',
    description: 'Customer support and service tools',
    order: 3
  },
  'Operations': {
    name: 'Operations',
    color: '#F59E0B', // Orange
    icon: '⚙️',
    description: 'Business operations and workflow tools',
    order: 4
  },
  'Data': {
    name: 'Data',
    color: '#A78BFA', // Purple
    icon: '📊',
    description: 'Data analytics and business intelligence',
    order: 5
  },
  'Development': {
    name: 'Development',
    color: '#10B981', // Emerald
    icon: '💻',
    description: 'Development and engineering tools',
    order: 6
  },
  'Security': {
    name: 'Security',
    color: '#EF4444', // Red
    icon: '🔒',
    description: 'Security and compliance tools',
    order: 7
  },
  'Other': {
    name: 'Other',
    color: '#94A3B8', // Gray
    icon: '📦',
    description: 'Miscellaneous tools',
    order: 8
  }
};

// Vendor detection patterns
const VENDOR_PATTERNS: Record<string, string[]> = {
  'Microsoft': ['Microsoft', 'Office 365', 'Azure', 'Power BI', 'Power Apps', 'Dynamics', 'SharePoint', 'OneDrive', 'Outlook', 'Teams'],
  'Google': ['Google', 'Gmail', 'Google Analytics', 'Google Ads', 'BigQuery', 'Looker', 'GCP', 'Google Cloud'],
  'Salesforce': ['Salesforce', 'Pardot', 'Tableau', 'MuleSoft', 'Slack'],
  'HubSpot': ['HubSpot', 'HubSpot CRM', 'CMS Hub', 'Service Hub', 'Marketing Hub', 'Sales Hub'],
  'Adobe': ['Adobe', 'Marketo', 'Adobe Analytics', 'Adobe Creative Cloud', 'Workfront'],
  'Atlassian': ['Jira', 'Confluence', 'Trello', 'Bitbucket', 'Statuspage'],
  'AWS': ['AWS', 'Redshift', 'CloudWatch', 'ECS', 'EKS', 'S3'],
  'Zendesk': ['Zendesk', 'Zendesk Sell'],
  'Stripe': ['Stripe'],
  'Twilio': ['Twilio', 'Segment'],
  'Snowflake': ['Snowflake'],
  'MongoDB': ['MongoDB'],
  'Datadog': ['Datadog'],
  'Cloudflare': ['Cloudflare'],
  'Shopify': ['Shopify'],
  'Okta': ['Okta']
};

/**
 * Detect vendor from tool name
 */
export function detectVendor(toolName: string): string | undefined {
  const normalizedName = toolName.toLowerCase();
  
  for (const [vendor, patterns] of Object.entries(VENDOR_PATTERNS)) {
    for (const pattern of patterns) {
      if (normalizedName.includes(pattern.toLowerCase())) {
        return vendor;
      }
    }
  }
  
  return undefined;
}

/**
 * Enhance tool data with additional metadata
 */
export function enhanceTool(tool: Tool): EnhancedTool {
  const vendor = detectVendor(tool.name);
  
  return {
    ...tool,
    vendor,
    domain: tool.logoUrl ? new URL(tool.logoUrl).hostname : undefined,
    connections: [], // Will be populated by connection detection
    tags: [],
    status: 'active' as const
  };
}

/**
 * Transform tools into React Flow nodes
 */
export function toolsToNodes(tools: Tool[]): ToolNode[] {
  return tools.map((tool, index) => {
    const enhancedTool = enhanceTool(tool);
    const category = enhancedTool.confirmedCategory || enhancedTool.category;
    const config = CATEGORY_CONFIGS[category] || CATEGORY_CONFIGS['Other'];
    
    return {
      id: tool.id,
      type: 'toolNode',
      position: { x: 0, y: 0 }, // Will be set by layout algorithm
      data: {
        tool: enhancedTool,
        category,
        vendor: enhancedTool.vendor,
        connections: enhancedTool.connections || [],
        metadata: {
          cost: enhancedTool.cost,
          usage: enhancedTool.usage,
          notes: enhancedTool.notes,
          tags: enhancedTool.tags,
          status: enhancedTool.status
        }
      },
      style: {
        width: 240,
        height: 80
      }
    };
  });
}

/**
 * Create category nodes for swimlane layout
 */
export function createCategoryNodes(tools: Tool[]): CategoryNode[] {
  const categoryCounts = tools.reduce((acc, tool) => {
    const category = tool.confirmedCategory || tool.category;
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(categoryCounts).map(([category, count], index) => {
    const config = CATEGORY_CONFIGS[category] || CATEGORY_CONFIGS['Other'];
    
    return {
      id: `category-${category}`,
      type: 'categoryNode',
      position: { x: 0, y: index * 120 }, // Will be adjusted by layout
      data: {
        category,
        toolCount: count,
        color: config.color
      },
      style: {
        width: 1200,
        height: 100
      }
    };
  });
}

/**
 * Detect connections between tools based on common patterns
 */
export function detectConnections(tools: Tool[]): ToolConnection[] {
  const connections: ToolConnection[] = [];
  
  // Simple connection detection based on vendor relationships
  const vendorGroups = tools.reduce((acc, tool) => {
    const vendor = detectVendor(tool.name);
    if (vendor) {
      if (!acc[vendor]) acc[vendor] = [];
      acc[vendor].push(tool.id);
    }
    return acc;
  }, {} as Record<string, string[]>);

  // Create connections within vendor groups
  Object.values(vendorGroups).forEach(toolIds => {
    if (toolIds.length > 1) {
      for (let i = 0; i < toolIds.length - 1; i++) {
        connections.push({
          id: `edge-${toolIds[i]}-${toolIds[i + 1]}`,
          source: toolIds[i],
          target: toolIds[i + 1],
          type: 'smoothstep',
          data: {
            type: 'integration',
            strength: 0.8
          },
          style: {
            stroke: '#94A3B8',
            strokeWidth: 2,
            opacity: 0.6
          }
        });
      }
    }
  });

  return connections;
}

/**
 * Transform tools into React Flow data structure
 */
export function transformToolsToFlowData(tools: Tool[]) {
  const toolNodes = toolsToNodes(tools);
  const categoryNodes = createCategoryNodes(tools);
  const connections = detectConnections(tools);
  
  return {
    nodes: [...toolNodes, ...categoryNodes],
    edges: connections
  };
}

/**
 * Filter nodes based on search and filter criteria
 */
export function filterNodes(
  nodes: ToolNode[], 
  searchQuery: string, 
  categoryFilters: string[],
  vendorFilters: string[]
): ToolNode[] {
  return nodes.filter(node => {
    const tool = node.data.tool;
    const category = node.data.category;
    const vendor = node.data.vendor;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        tool.name.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query) ||
        (vendor && vendor.toLowerCase().includes(query)) ||
        (tool.description && tool.description.toLowerCase().includes(query));
      
      if (!matchesSearch) return false;
    }
    
    // Category filter
    if (categoryFilters.length > 0 && !categoryFilters.includes(category)) {
      return false;
    }
    
    // Vendor filter
    if (vendorFilters.length > 0 && vendor && !vendorFilters.includes(vendor)) {
      return false;
    }
    
    return true;
  });
}

/**
 * Get unique categories from tools
 */
export function getUniqueCategories(tools: Tool[]): string[] {
  const categories = new Set<string>();
  tools.forEach(tool => {
    categories.add(tool.confirmedCategory || tool.category);
  });
  return Array.from(categories).sort();
}

/**
 * Get unique vendors from tools
 */
export function getUniqueVendors(tools: Tool[]): string[] {
  const vendors = new Set<string>();
  tools.forEach(tool => {
    const vendor = detectVendor(tool.name);
    if (vendor) vendors.add(vendor);
  });
  return Array.from(vendors).sort();
}

/**
 * Calculate layout metrics for performance monitoring
 */
export function calculateMetrics(nodes: ToolNode[], edges: ToolConnection[]) {
  return {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    categories: getUniqueCategories(nodes.map(n => n.data.tool)),
    vendors: getUniqueVendors(nodes.map(n => n.data.tool))
  };
}

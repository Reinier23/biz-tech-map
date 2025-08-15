import { Tool } from '@/contexts/ToolsContext';
import { DataFlowNode, DataFlowEdge, EnhancedTool, DataFlow } from './flowTypes';
import { FLOW_TYPE_STYLES } from './flowStyles';

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
 * Enhance tool with additional metadata
 */
export function enhanceTool(tool: Tool): EnhancedTool {
  const vendor = detectVendor(tool.name);
  const category = tool.confirmedCategory || tool.category;
  
  // Determine if this is a hub (central tool)
  const isHub = vendor === 'HubSpot' || vendor === 'Salesforce' || 
                tool.name.toLowerCase().includes('hub') ||
                tool.name.toLowerCase().includes('crm');
  
  // Determine prominence based on category and vendor
  const prominence = isHub ? 'primary' : 
                    vendor ? 'secondary' : 'tertiary';
  
  // Estimate data volume based on category
  const dataVolume = category === 'Analytics' || category === 'Data' ? 'high' :
                    category === 'Sales' || category === 'Marketing' ? 'medium' : 'low';
  
  return {
    ...tool,
    vendor,
    domain: tool.logoUrl ? new URL(tool.logoUrl).hostname : undefined,
    isHub,
    prominence,
    integrationCount: 0, // Will be calculated when creating edges
    dataVolume,
    lastSync: new Date()
  };
}

/**
 * Generate sample data flows for tools
 */
export function generateDataFlows(tools: EnhancedTool[]): DataFlow[] {
  const flows: DataFlow[] = [];
  
  // Generate flows based on categories and vendors
  tools.forEach(tool => {
    const category = tool.confirmedCategory || tool.category;
    
    // Sales tools typically have contacts and deals
    if (category === 'Sales') {
      flows.push({
        type: 'contacts',
        direction: 'bidirectional',
        frequency: 'realtime',
        volume: 'high'
      });
      flows.push({
        type: 'deals',
        direction: 'bidirectional',
        frequency: 'realtime',
        volume: 'high'
      });
    }
    
    // Marketing tools have events and analytics
    if (category === 'Marketing') {
      flows.push({
        type: 'events',
        direction: 'out',
        frequency: 'realtime',
        volume: 'medium'
      });
      flows.push({
        type: 'analytics',
        direction: 'in',
        frequency: 'daily',
        volume: 'medium'
      });
    }
    
    // Analytics tools consume data
    if (category === 'Analytics' || category === 'Data') {
      flows.push({
        type: 'analytics',
        direction: 'in',
        frequency: 'realtime',
        volume: 'high'
      });
    }
    
    // Service tools have contacts and events
    if (category === 'Service') {
      flows.push({
        type: 'contacts',
        direction: 'bidirectional',
        frequency: 'hourly',
        volume: 'medium'
      });
      flows.push({
        type: 'events',
        direction: 'bidirectional',
        frequency: 'realtime',
        volume: 'medium'
      });
    }
  });
  
  return flows;
}

/**
 * Detect connections between tools
 */
export function detectConnections(tools: EnhancedTool[]): DataFlowEdge[] {
  const connections: DataFlowEdge[] = [];
  
  // Group tools by vendor
  const vendorGroups = tools.reduce((acc, tool) => {
    if (tool.vendor) {
      if (!acc[tool.vendor]) acc[tool.vendor] = [];
      acc[tool.vendor].push(tool);
    }
    return acc;
  }, {} as Record<string, EnhancedTool[]>);

  // Create connections within vendor groups (native integrations)
  Object.entries(vendorGroups).forEach(([vendor, vendorTools]) => {
    if (vendorTools.length > 1) {
      for (let i = 0; i < vendorTools.length - 1; i++) {
        const source = vendorTools[i];
        const target = vendorTools[i + 1];
        
        connections.push({
          id: `edge-${source.id}-${target.id}`,
          source: source.id,
          target: target.id,
          type: 'smoothstep',
          data: {
            sourceTool: source.name,
            targetTool: target.name,
            flowType: 'native',
            datasets: ['contacts', 'deals'],
            direction: 'bidirectional',
            integrationName: `${source.name}-${target.name} Integration`,
            syncFrequency: 'realtime',
            reliability: 0.95,
            edgeType: 'solid',
            thickness: 'thick',
            color: FLOW_TYPE_STYLES.native.color
          }
        });
      }
    }
  });

  // Create connections between hubs and other tools
  const hubs = tools.filter(tool => tool.isHub);
  const nonHubs = tools.filter(tool => !tool.isHub);
  
  hubs.forEach(hub => {
    nonHubs.forEach(tool => {
      // Skip if same vendor (already connected above)
      if (hub.vendor === tool.vendor) return;
      
      // Create custom API connections
      connections.push({
        id: `edge-${hub.id}-${tool.id}`,
        source: hub.id,
        target: tool.id,
        type: 'smoothstep',
        data: {
          sourceTool: hub.name,
          targetTool: tool.name,
          flowType: 'custom',
          datasets: ['analytics', 'events'],
          direction: 'unidirectional',
          integrationName: `${hub.name} to ${tool.name}`,
          syncFrequency: 'daily',
          reliability: 0.85,
          edgeType: 'dashed',
          thickness: 'medium',
          color: FLOW_TYPE_STYLES.custom.color
        }
      });
    });
  });

  return connections;
}

/**
 * Transform tools to data flow nodes
 */
export function toolsToDataFlowNodes(tools: Tool[]): DataFlowNode[] {
  const enhancedTools = tools.map(enhanceTool);
  
  return enhancedTools.map((tool, index) => {
    const category = tool.confirmedCategory || tool.category;
    const dataFlows = generateDataFlows([tool]);
    
    return {
      id: tool.id,
      type: 'dataFlowNode',
      position: { x: 0, y: 0 }, // Will be set by layout
      data: {
        tool,
        category,
        vendor: tool.vendor,
        dataIn: dataFlows.filter(f => f.direction === 'in' || f.direction === 'bidirectional'),
        dataOut: dataFlows.filter(f => f.direction === 'out' || f.direction === 'bidirectional'),
        isHub: tool.isHub || false,
        nodeType: tool.isHub ? 'hub' : 'tool',
        prominence: tool.prominence || 'tertiary',
        integrationCount: 0, // Will be updated after edge creation
        dataVolume: tool.dataVolume || 'low',
        lastSync: tool.lastSync
      },
      style: {
        width: 240,
        height: 80
      }
    };
  });
}

/**
 * Transform tools to data flow edges
 */
export function toolsToDataFlowEdges(tools: Tool[]): DataFlowEdge[] {
  const enhancedTools = tools.map(enhanceTool);
  return detectConnections(enhancedTools);
}

/**
 * Update integration counts on nodes based on edges
 */
export function updateIntegrationCounts(nodes: DataFlowNode[], edges: DataFlowEdge[]): DataFlowNode[] {
  return nodes.map(node => {
    const incomingEdges = edges.filter(edge => edge.target === node.id);
    const outgoingEdges = edges.filter(edge => edge.source === node.id);
    const integrationCount = incomingEdges.length + outgoingEdges.length;
    
    return {
      ...node,
      data: {
        ...node.data,
        integrationCount
      }
    };
  });
}

/**
 * Main transformation function
 */
export function transformToolsToFlowData(tools: Tool[]): { nodes: DataFlowNode[]; edges: DataFlowEdge[] } {
  if (tools.length === 0) {
    return { nodes: [], edges: [] };
  }
  
  const nodes = toolsToDataFlowNodes(tools);
  const edges = toolsToDataFlowEdges(tools);
  const updatedNodes = updateIntegrationCounts(nodes, edges);
  
  return {
    nodes: updatedNodes,
    edges
  };
}

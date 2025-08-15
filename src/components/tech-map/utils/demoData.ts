import { DataFlowNode, DataFlowEdge, DemoData } from './flowTypes';
import { FLOW_TYPE_STYLES } from './flowStyles';

// Demo data showing HubSpot ↔ Azure/PowerBI style flows
export const demoData: DemoData = {
  nodes: [
    // HubSpot (Central Hub)
    {
      id: 'hubspot',
      type: 'dataFlowNode',
      position: { x: 400, y: 200 },
      data: {
        tool: {
          id: 'hubspot',
          name: 'HubSpot',
          category: 'Marketing',
          description: 'All-in-one marketing, sales, and service platform',
          logoUrl: 'https://logo.clearbit.com/hubspot.com',
          isHub: true,
          vendor: 'HubSpot',
          prominence: 'primary',
          integrationCount: 8,
          dataVolume: 'high'
        },
        category: 'Marketing',
        vendor: 'HubSpot',
        dataIn: [
          { type: 'contacts', direction: 'in', frequency: 'realtime', volume: 'high' },
          { type: 'deals', direction: 'in', frequency: 'realtime', volume: 'high' },
          { type: 'analytics', direction: 'in', frequency: 'hourly', volume: 'medium' }
        ],
        dataOut: [
          { type: 'contacts', direction: 'out', frequency: 'realtime', volume: 'high' },
          { type: 'deals', direction: 'out', frequency: 'realtime', volume: 'high' },
          { type: 'events', direction: 'out', frequency: 'realtime', volume: 'medium' }
        ],
        isHub: true,
        nodeType: 'hub',
        prominence: 'primary',
        integrationCount: 8,
        dataVolume: 'high'
      }
    },

    // Sales Tools
    {
      id: 'salesforce',
      type: 'dataFlowNode',
      position: { x: 100, y: 100 },
      data: {
        tool: {
          id: 'salesforce',
          name: 'Salesforce',
          category: 'Sales',
          description: 'Customer relationship management platform',
          logoUrl: 'https://logo.clearbit.com/salesforce.com',
          vendor: 'Salesforce',
          prominence: 'secondary',
          integrationCount: 5,
          dataVolume: 'high'
        },
        category: 'Sales',
        vendor: 'Salesforce',
        dataIn: [
          { type: 'contacts', direction: 'in', frequency: 'realtime', volume: 'high' },
          { type: 'deals', direction: 'in', frequency: 'realtime', volume: 'high' }
        ],
        dataOut: [
          { type: 'contacts', direction: 'out', frequency: 'realtime', volume: 'high' },
          { type: 'deals', direction: 'out', frequency: 'realtime', volume: 'high' }
        ],
        isHub: false,
        nodeType: 'tool',
        prominence: 'secondary',
        integrationCount: 5,
        dataVolume: 'high'
      }
    },

    {
      id: 'pipedrive',
      type: 'dataFlowNode',
      position: { x: 100, y: 300 },
      data: {
        tool: {
          id: 'pipedrive',
          name: 'Pipedrive',
          category: 'Sales',
          description: 'Sales CRM and pipeline management',
          logoUrl: 'https://logo.clearbit.com/pipedrive.com',
          vendor: 'Pipedrive',
          prominence: 'tertiary',
          integrationCount: 3,
          dataVolume: 'medium'
        },
        category: 'Sales',
        vendor: 'Pipedrive',
        dataIn: [
          { type: 'contacts', direction: 'in', frequency: 'hourly', volume: 'medium' },
          { type: 'deals', direction: 'in', frequency: 'hourly', volume: 'medium' }
        ],
        dataOut: [
          { type: 'contacts', direction: 'out', frequency: 'hourly', volume: 'medium' },
          { type: 'deals', direction: 'out', frequency: 'hourly', volume: 'medium' }
        ],
        isHub: false,
        nodeType: 'tool',
        prominence: 'tertiary',
        integrationCount: 3,
        dataVolume: 'medium'
      }
    },

    // Analytics Tools
    {
      id: 'powerbi',
      type: 'dataFlowNode',
      position: { x: 700, y: 100 },
      data: {
        tool: {
          id: 'powerbi',
          name: 'Power BI',
          category: 'Analytics',
          description: 'Business analytics and data visualization',
          logoUrl: 'https://logo.clearbit.com/powerbi.microsoft.com',
          vendor: 'Microsoft',
          prominence: 'secondary',
          integrationCount: 6,
          dataVolume: 'high'
        },
        category: 'Analytics',
        vendor: 'Microsoft',
        dataIn: [
          { type: 'analytics', direction: 'in', frequency: 'daily', volume: 'high' },
          { type: 'events', direction: 'in', frequency: 'hourly', volume: 'medium' }
        ],
        dataOut: [
          { type: 'analytics', direction: 'out', frequency: 'daily', volume: 'high' }
        ],
        isHub: false,
        nodeType: 'tool',
        prominence: 'secondary',
        integrationCount: 6,
        dataVolume: 'high'
      }
    },

    {
      id: 'azure',
      type: 'dataFlowNode',
      position: { x: 700, y: 300 },
      data: {
        tool: {
          id: 'azure',
          name: 'Azure Data Factory',
          category: 'Analytics',
          description: 'Cloud data integration service',
          logoUrl: 'https://logo.clearbit.com/azure.microsoft.com',
          vendor: 'Microsoft',
          prominence: 'secondary',
          integrationCount: 7,
          dataVolume: 'high'
        },
        category: 'Analytics',
        vendor: 'Microsoft',
        dataIn: [
          { type: 'analytics', direction: 'in', frequency: 'realtime', volume: 'high' },
          { type: 'events', direction: 'in', frequency: 'realtime', volume: 'high' }
        ],
        dataOut: [
          { type: 'analytics', direction: 'out', frequency: 'realtime', volume: 'high' }
        ],
        isHub: false,
        nodeType: 'tool',
        prominence: 'secondary',
        integrationCount: 7,
        dataVolume: 'high'
      }
    },

    // Service Tools
    {
      id: 'zendesk',
      type: 'dataFlowNode',
      position: { x: 100, y: 500 },
      data: {
        tool: {
          id: 'zendesk',
          name: 'Zendesk',
          category: 'Service',
          description: 'Customer service and support platform',
          logoUrl: 'https://logo.clearbit.com/zendesk.com',
          vendor: 'Zendesk',
          prominence: 'secondary',
          integrationCount: 4,
          dataVolume: 'medium'
        },
        category: 'Service',
        vendor: 'Zendesk',
        dataIn: [
          { type: 'contacts', direction: 'in', frequency: 'hourly', volume: 'medium' },
          { type: 'events', direction: 'in', frequency: 'realtime', volume: 'medium' }
        ],
        dataOut: [
          { type: 'contacts', direction: 'out', frequency: 'hourly', volume: 'medium' },
          { type: 'events', direction: 'out', frequency: 'realtime', volume: 'medium' }
        ],
        isHub: false,
        nodeType: 'tool',
        prominence: 'secondary',
        integrationCount: 4,
        dataVolume: 'medium'
      }
    },

    // Marketing Tools
    {
      id: 'mailchimp',
      type: 'dataFlowNode',
      position: { x: 700, y: 500 },
      data: {
        tool: {
          id: 'mailchimp',
          name: 'Mailchimp',
          category: 'Marketing',
          description: 'Email marketing and automation platform',
          logoUrl: 'https://logo.clearbit.com/mailchimp.com',
          vendor: 'Mailchimp',
          prominence: 'tertiary',
          integrationCount: 2,
          dataVolume: 'medium'
        },
        category: 'Marketing',
        vendor: 'Mailchimp',
        dataIn: [
          { type: 'contacts', direction: 'in', frequency: 'daily', volume: 'medium' },
          { type: 'events', direction: 'in', frequency: 'realtime', volume: 'low' }
        ],
        dataOut: [
          { type: 'events', direction: 'out', frequency: 'realtime', volume: 'medium' }
        ],
        isHub: false,
        nodeType: 'tool',
        prominence: 'tertiary',
        integrationCount: 2,
        dataVolume: 'medium'
      }
    }
  ],

  edges: [
    // HubSpot ↔ Salesforce (Native Integration)
    {
      id: 'hubspot-salesforce',
      source: 'hubspot',
      target: 'salesforce',
      type: 'smoothstep',
      data: {
        sourceTool: 'hubspot',
        targetTool: 'salesforce',
        flowType: 'native',
        datasets: ['contacts', 'deals'],
        direction: 'bidirectional',
        integrationName: 'HubSpot-Salesforce Sync',
        syncFrequency: 'realtime',
        reliability: 0.95,
        edgeType: 'solid',
        thickness: 'thick',
        color: FLOW_TYPE_STYLES.native.color
      },
      style: {
        stroke: FLOW_TYPE_STYLES.native.color,
        strokeWidth: 3,
        strokeDasharray: undefined
      },
      markerEnd: {
        type: 'arrowclosed',
        color: FLOW_TYPE_STYLES.native.color
      }
    },

    // HubSpot ↔ Power BI (Custom API)
    {
      id: 'hubspot-powerbi',
      source: 'hubspot',
      target: 'powerbi',
      type: 'smoothstep',
      data: {
        sourceTool: 'hubspot',
        targetTool: 'powerbi',
        flowType: 'custom',
        datasets: ['analytics', 'events'],
        direction: 'unidirectional',
        integrationName: 'HubSpot Analytics Export',
        syncFrequency: 'daily',
        reliability: 0.85,
        edgeType: 'dashed',
        thickness: 'medium',
        color: FLOW_TYPE_STYLES.custom.color
      },
      style: {
        stroke: FLOW_TYPE_STYLES.custom.color,
        strokeWidth: 2,
        strokeDasharray: '5,5'
      },
      markerEnd: {
        type: 'arrow',
        color: FLOW_TYPE_STYLES.custom.color
      }
    },

    // HubSpot ↔ Azure (Custom API)
    {
      id: 'hubspot-azure',
      source: 'hubspot',
      target: 'azure',
      type: 'smoothstep',
      data: {
        sourceTool: 'hubspot',
        targetTool: 'azure',
        flowType: 'custom',
        datasets: ['analytics', 'events', 'contacts'],
        direction: 'unidirectional',
        integrationName: 'HubSpot Data Pipeline',
        syncFrequency: 'realtime',
        reliability: 0.90,
        edgeType: 'dashed',
        thickness: 'medium',
        color: FLOW_TYPE_STYLES.custom.color
      },
      style: {
        stroke: FLOW_TYPE_STYLES.custom.color,
        strokeWidth: 2,
        strokeDasharray: '5,5'
      },
      markerEnd: {
        type: 'arrow',
        color: FLOW_TYPE_STYLES.custom.color
      }
    },

    // HubSpot ↔ Pipedrive (Existing Connection)
    {
      id: 'hubspot-pipedrive',
      source: 'hubspot',
      target: 'pipedrive',
      type: 'smoothstep',
      data: {
        sourceTool: 'hubspot',
        targetTool: 'pipedrive',
        flowType: 'existing',
        datasets: ['contacts', 'deals'],
        direction: 'bidirectional',
        integrationName: 'Manual Data Sync',
        syncFrequency: 'manual',
        reliability: 0.70,
        edgeType: 'dotted',
        thickness: 'thin',
        color: FLOW_TYPE_STYLES.existing.color
      },
      style: {
        stroke: FLOW_TYPE_STYLES.existing.color,
        strokeWidth: 1,
        strokeDasharray: '2,2'
      }
    },

    // HubSpot ↔ Zendesk (Native Integration)
    {
      id: 'hubspot-zendesk',
      source: 'hubspot',
      target: 'zendesk',
      type: 'smoothstep',
      data: {
        sourceTool: 'hubspot',
        targetTool: 'zendesk',
        flowType: 'native',
        datasets: ['contacts', 'events'],
        direction: 'bidirectional',
        integrationName: 'HubSpot-Zendesk Integration',
        syncFrequency: 'realtime',
        reliability: 0.92,
        edgeType: 'solid',
        thickness: 'thick',
        color: FLOW_TYPE_STYLES.native.color
      },
      style: {
        stroke: FLOW_TYPE_STYLES.native.color,
        strokeWidth: 3,
        strokeDasharray: undefined
      },
      markerEnd: {
        type: 'arrowclosed',
        color: FLOW_TYPE_STYLES.native.color
      }
    },

    // HubSpot ↔ Mailchimp (Native Integration)
    {
      id: 'hubspot-mailchimp',
      source: 'hubspot',
      target: 'mailchimp',
      type: 'smoothstep',
      data: {
        sourceTool: 'hubspot',
        targetTool: 'mailchimp',
        flowType: 'native',
        datasets: ['contacts', 'events'],
        direction: 'bidirectional',
        integrationName: 'HubSpot-Mailchimp Sync',
        syncFrequency: 'realtime',
        reliability: 0.88,
        edgeType: 'solid',
        thickness: 'thick',
        color: FLOW_TYPE_STYLES.native.color
      },
      style: {
        stroke: FLOW_TYPE_STYLES.native.color,
        strokeWidth: 3,
        strokeDasharray: undefined
      },
      markerEnd: {
        type: 'arrowclosed',
        color: FLOW_TYPE_STYLES.native.color
      }
    },

    // Azure ↔ Power BI (Native Integration)
    {
      id: 'azure-powerbi',
      source: 'azure',
      target: 'powerbi',
      type: 'smoothstep',
      data: {
        sourceTool: 'azure',
        targetTool: 'powerbi',
        flowType: 'native',
        datasets: ['analytics'],
        direction: 'unidirectional',
        integrationName: 'Azure-Power BI Connector',
        syncFrequency: 'realtime',
        reliability: 0.98,
        edgeType: 'solid',
        thickness: 'thick',
        color: FLOW_TYPE_STYLES.native.color
      },
      style: {
        stroke: FLOW_TYPE_STYLES.native.color,
        strokeWidth: 3,
        strokeDasharray: undefined
      },
      markerEnd: {
        type: 'arrowclosed',
        color: FLOW_TYPE_STYLES.native.color
      }
    }
  ],

  description: 'Demo data flow showing HubSpot as a central hub with connections to Salesforce, Power BI, Azure, and other tools. Demonstrates native integrations (solid lines), custom APIs (dashed lines), and existing connections (dotted lines).'
};

// Helper function to load demo data
export const loadDemoData = (): { nodes: DataFlowNode[]; edges: DataFlowEdge[] } => {
  return {
    nodes: demoData.nodes,
    edges: demoData.edges
  };
};

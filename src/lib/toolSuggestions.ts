export interface ToolSuggestion {
  id: string;
  name: string;
  category: string;
  description: string;
  logoUrl?: string;
}

export const toolSuggestions: ToolSuggestion[] = [
  // Marketing Tools
  { id: 'hubspot', name: 'HubSpot', category: 'Marketing', description: 'All-in-one marketing, sales, and service platform', logoUrl: 'https://logo.clearbit.com/hubspot.com' },
  { id: 'mailchimp', name: 'Mailchimp', category: 'Marketing', description: 'Email marketing and automation platform', logoUrl: 'https://logo.clearbit.com/mailchimp.com' },
  { id: 'google-analytics', name: 'Google Analytics', category: 'Marketing', description: 'Web analytics and reporting tool', logoUrl: 'https://logo.clearbit.com/google.com' },
  { id: 'facebook-ads', name: 'Facebook Ads', category: 'Marketing', description: 'Social media advertising platform', logoUrl: 'https://logo.clearbit.com/facebook.com' },
  { id: 'linkedin-ads', name: 'LinkedIn Ads', category: 'Marketing', description: 'Professional network advertising', logoUrl: 'https://logo.clearbit.com/linkedin.com' },
  { id: 'google-ads', name: 'Google Ads', category: 'Marketing', description: 'Search and display advertising platform', logoUrl: 'https://logo.clearbit.com/google.com' },
  { id: 'canva', name: 'Canva', category: 'Marketing', description: 'Graphic design and visual content creation', logoUrl: 'https://logo.clearbit.com/canva.com' },
  { id: 'hootsuite', name: 'Hootsuite', category: 'Marketing', description: 'Social media management platform', logoUrl: 'https://logo.clearbit.com/hootsuite.com' },
  { id: 'buffer', name: 'Buffer', category: 'Marketing', description: 'Social media scheduling and analytics', logoUrl: 'https://logo.clearbit.com/buffer.com' },
  { id: 'constant-contact', name: 'Constant Contact', category: 'Marketing', description: 'Email marketing and automation', logoUrl: 'https://logo.clearbit.com/constantcontact.com' },
  { id: 'marketo', name: 'Marketo', category: 'Marketing', description: 'Marketing automation and analytics', logoUrl: 'https://logo.clearbit.com/marketo.com' },
  { id: 'pardot', name: 'Pardot', category: 'Marketing', description: 'B2B marketing automation by Salesforce', logoUrl: 'https://logo.clearbit.com/salesforce.com' },
  { id: 'klaviyo', name: 'Klaviyo', category: 'Marketing', description: 'Email and SMS marketing platform', logoUrl: 'https://logo.clearbit.com/klaviyo.com' },
  { id: 'semrush', name: 'SEMrush', category: 'Marketing', description: 'SEO and digital marketing toolkit', logoUrl: 'https://logo.clearbit.com/semrush.com' },
  { id: 'ahrefs', name: 'Ahrefs', category: 'Marketing', description: 'SEO analysis and backlink research', logoUrl: 'https://logo.clearbit.com/ahrefs.com' },

  // Sales Tools
  { id: 'salesforce', name: 'Salesforce', category: 'Sales', description: 'Customer relationship management platform', logoUrl: 'https://logo.clearbit.com/salesforce.com' },
  { id: 'pipedrive', name: 'Pipedrive', category: 'Sales', description: 'Sales pipeline management CRM', logoUrl: 'https://logo.clearbit.com/pipedrive.com' },
  { id: 'hubspot-crm', name: 'HubSpot CRM', category: 'Sales', description: 'Free customer relationship management', logoUrl: 'https://logo.clearbit.com/hubspot.com' },
  { id: 'linkedin-sales', name: 'LinkedIn Sales Navigator', category: 'Sales', description: 'Advanced LinkedIn prospecting tool', logoUrl: 'https://logo.clearbit.com/linkedin.com' },
  { id: 'outreach', name: 'Outreach', category: 'Sales', description: 'Sales engagement and automation platform', logoUrl: 'https://logo.clearbit.com/outreach.io' },
  { id: 'salesloft', name: 'SalesLoft', category: 'Sales', description: 'Sales engagement and cadence platform', logoUrl: 'https://logo.clearbit.com/salesloft.com' },
  { id: 'zoho-crm', name: 'Zoho CRM', category: 'Sales', description: 'Customer relationship management software', logoUrl: 'https://logo.clearbit.com/zoho.com' },
  { id: 'freshsales', name: 'Freshsales', category: 'Sales', description: 'CRM software for sales teams', logoUrl: 'https://logo.clearbit.com/freshworks.com' },
  { id: 'close', name: 'Close', category: 'Sales', description: 'Inside sales CRM and phone system', logoUrl: 'https://logo.clearbit.com/close.com' },
  { id: 'copper', name: 'Copper', category: 'Sales', description: 'CRM designed for Google Workspace', logoUrl: 'https://logo.clearbit.com/copper.com' },
  { id: 'apollo', name: 'Apollo', category: 'Sales', description: 'Sales intelligence and engagement platform', logoUrl: 'https://logo.clearbit.com/apollo.io' },
  { id: 'zoominfo', name: 'ZoomInfo', category: 'Sales', description: 'B2B contact database and sales intelligence', logoUrl: 'https://logo.clearbit.com/zoominfo.com' },
  { id: 'gong', name: 'Gong', category: 'Sales', description: 'Revenue intelligence and conversation analytics', logoUrl: 'https://logo.clearbit.com/gong.io' },
  { id: 'chorus', name: 'Chorus', category: 'Sales', description: 'Conversation intelligence for sales teams', logoUrl: 'https://logo.clearbit.com/chorus.ai' },
  { id: 'dynamics-365-sales', name: 'Dynamics 365 Sales', category: 'Sales', description: 'Microsoft CRM for sales and pipeline management', logoUrl: 'https://logo.clearbit.com/dynamics.com' },

  // Service Tools
  { id: 'zendesk', name: 'Zendesk', category: 'Service', description: 'Customer service and support ticketing system', logoUrl: 'https://logo.clearbit.com/zendesk.com' },
  { id: 'slack', name: 'Slack', category: 'Service', description: 'Team communication and collaboration platform', logoUrl: 'https://logo.clearbit.com/slack.com' },
  { id: 'jira', name: 'Jira', category: 'Service', description: 'Issue tracking and project management', logoUrl: 'https://logo.clearbit.com/atlassian.com' },
  { id: 'freshdesk', name: 'Freshdesk', category: 'Service', description: 'Customer support software', logoUrl: 'https://logo.clearbit.com/freshworks.com' },
  { id: 'intercom', name: 'Intercom', category: 'Service', description: 'Customer messaging and support platform', logoUrl: 'https://logo.clearbit.com/intercom.com' },
  { id: 'helpscout', name: 'Help Scout', category: 'Service', description: 'Customer service platform and help desk', logoUrl: 'https://logo.clearbit.com/helpscout.com' },
  { id: 'servicenow', name: 'ServiceNow', category: 'Service', description: 'IT service management platform', logoUrl: 'https://logo.clearbit.com/servicenow.com' },
  { id: 'microsoft-teams', name: 'Microsoft Teams', category: 'Service', description: 'Communication and collaboration platform', logoUrl: 'https://logo.clearbit.com/microsoft.com' },
  { id: 'zoom', name: 'Zoom', category: 'Service', description: 'Video conferencing and communication', logoUrl: 'https://logo.clearbit.com/zoom.us' },
  { id: 'discord', name: 'Discord', category: 'Service', description: 'Voice, video and text communication', logoUrl: 'https://logo.clearbit.com/discord.com' },
  { id: 'confluence', name: 'Confluence', category: 'Service', description: 'Team collaboration and documentation', logoUrl: 'https://logo.clearbit.com/atlassian.com' },
  { id: 'notion', name: 'Notion', category: 'Service', description: 'All-in-one workspace for notes and collaboration', logoUrl: 'https://logo.clearbit.com/notion.so' },
  { id: 'asana', name: 'Asana', category: 'Service', description: 'Project management and team collaboration', logoUrl: 'https://logo.clearbit.com/asana.com' },
  { id: 'trello', name: 'Trello', category: 'Service', description: 'Visual project management with boards', logoUrl: 'https://logo.clearbit.com/trello.com' },
  { id: 'dynamics-365-customer-service', name: 'Dynamics 365 Customer Service', category: 'Service', description: 'Microsoft customer service and support platform', logoUrl: 'https://logo.clearbit.com/dynamics.com' },
  { id: 'sharepoint', name: 'SharePoint', category: 'Service', description: 'Microsoft content and collaboration platform', logoUrl: 'https://logo.clearbit.com/sharepoint.com' },
  { id: 'onedrive', name: 'OneDrive', category: 'Service', description: 'Microsoft cloud file storage and sharing', logoUrl: 'https://logo.clearbit.com/onedrive.com' },
  { id: 'outlook', name: 'Outlook', category: 'Service', description: 'Microsoft email and calendar', logoUrl: 'https://logo.clearbit.com/outlook.com' },

  // Other Tools
  { id: 'github', name: 'GitHub', category: 'Other', description: 'Code hosting and version control platform', logoUrl: 'https://logo.clearbit.com/github.com' },
  { id: 'quickbooks', name: 'QuickBooks', category: 'Other', description: 'Accounting and financial management software', logoUrl: 'https://logo.clearbit.com/intuit.com' },
  { id: 'bamboohr', name: 'BambooHR', category: 'Other', description: 'Human resources management system', logoUrl: 'https://logo.clearbit.com/bamboohr.com' },
  { id: 'docker', name: 'Docker', category: 'Other', description: 'Containerization and deployment platform', logoUrl: 'https://logo.clearbit.com/docker.com' },
  { id: 'aws', name: 'AWS', category: 'Other', description: 'Cloud computing and infrastructure services', logoUrl: 'https://logo.clearbit.com/amazon.com' },
  { id: 'azure', name: 'Microsoft Azure', category: 'Other', description: 'Cloud computing platform and services', logoUrl: 'https://logo.clearbit.com/microsoft.com' },
  { id: 'google-cloud', name: 'Google Cloud', category: 'Other', description: 'Cloud computing and storage services', logoUrl: 'https://logo.clearbit.com/google.com' },
  { id: 'figma', name: 'Figma', category: 'Other', description: 'Collaborative design and prototyping tool', logoUrl: 'https://logo.clearbit.com/figma.com' },
  { id: 'adobe-creative', name: 'Adobe Creative Suite', category: 'Other', description: 'Design and creative software suite', logoUrl: 'https://logo.clearbit.com/adobe.com' },
  { id: 'tableau', name: 'Tableau', category: 'Other', description: 'Data visualization and analytics platform', logoUrl: 'https://logo.clearbit.com/tableau.com' },
  { id: 'power-bi', name: 'Power BI', category: 'Other', description: 'Business analytics and data visualization', logoUrl: 'https://logo.clearbit.com/microsoft.com' },
  { id: 'mongodb', name: 'MongoDB', category: 'Other', description: 'Document-oriented database platform', logoUrl: 'https://logo.clearbit.com/mongodb.com' },
  { id: 'postgresql', name: 'PostgreSQL', category: 'Other', description: 'Open source relational database', logoUrl: 'https://logo.clearbit.com/postgresql.org' },
  { id: 'redis', name: 'Redis', category: 'Other', description: 'In-memory data structure store and cache', logoUrl: 'https://logo.clearbit.com/redis.io' },
  { id: 'kubernetes', name: 'Kubernetes', category: 'Other', description: 'Container orchestration and management', logoUrl: 'https://logo.clearbit.com/kubernetes.io' },
  { id: 'microsoft-365', name: 'Microsoft 365', category: 'Other', description: 'Productivity suite including Office apps and cloud services', logoUrl: 'https://logo.clearbit.com/microsoft.com' },
  { id: 'power-automate', name: 'Power Automate', category: 'Other', description: 'Microsoft workflow automation platform', logoUrl: 'https://logo.clearbit.com/microsoft.com' },
  { id: 'power-apps', name: 'Power Apps', category: 'Other', description: 'Microsoft low-code app development platform', logoUrl: 'https://logo.clearbit.com/microsoft.com' },
  { id: 'azure-devops', name: 'Azure DevOps', category: 'Other', description: 'Microsoft CI/CD and project tracking for developers', logoUrl: 'https://logo.clearbit.com/azure.com' },
  { id: 'visual-studio', name: 'Visual Studio', category: 'Other', description: 'Microsoft IDE for development', logoUrl: 'https://logo.clearbit.com/visualstudio.com' },
  { id: 'windows-server', name: 'Windows Server', category: 'Other', description: 'Microsoft server operating system', logoUrl: 'https://logo.clearbit.com/windows.com' },
  { id: 'azure-active-directory', name: 'Azure Active Directory (Entra ID)', category: 'Other', description: 'Microsoft identity and access management', logoUrl: 'https://logo.clearbit.com/microsoft.com' },
  { id: 'intune', name: 'Microsoft Intune', category: 'Other', description: 'Endpoint management and device security', logoUrl: 'https://logo.clearbit.com/microsoft.com' }
];

export const getToolSuggestions = (query: string, limit: number = 8): ToolSuggestion[] => {
  if (!query || query.length < 2) {
    // Return popular tools when no query
    return toolSuggestions.slice(0, limit);
  }

  const lowercaseQuery = query.toLowerCase();
  
  // Score suggestions based on relevance
  const scored = toolSuggestions.map(tool => {
    let score = 0;
    const toolName = tool.name.toLowerCase();
    
    // Exact match gets highest score
    if (toolName === lowercaseQuery) {
      score = 100;
    }
    // Starts with query gets high score
    else if (toolName.startsWith(lowercaseQuery)) {
      score = 80;
    }
    // Contains query gets medium score
    else if (toolName.includes(lowercaseQuery)) {
      score = 60;
    }
    // Description contains query gets lower score
    else if (tool.description.toLowerCase().includes(lowercaseQuery)) {
      score = 30;
    }
    
    return { ...tool, score };
  });

  // Filter and sort by score, then take top results
  return scored
    .filter(tool => tool.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

export const getPopularToolsByCategory = (category: string): ToolSuggestion[] => {
  return toolSuggestions
    .filter(tool => tool.category === category)
    .slice(0, 5);
};

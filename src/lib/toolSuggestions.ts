export interface ToolSuggestion {
  id: string;
  name: string;
  category: string;
  description: string;
  logoUrl?: string;
}

export const toolSuggestions: ToolSuggestion[] = [
  // Marketing Tools
  { id: 'hubspot', name: 'HubSpot', category: 'Marketing', description: 'All-in-one marketing, sales, and service platform' },
  { id: 'mailchimp', name: 'Mailchimp', category: 'Marketing', description: 'Email marketing and automation platform' },
  { id: 'google-analytics', name: 'Google Analytics', category: 'Marketing', description: 'Web analytics and reporting tool' },
  { id: 'facebook-ads', name: 'Facebook Ads', category: 'Marketing', description: 'Social media advertising platform' },
  { id: 'linkedin-ads', name: 'LinkedIn Ads', category: 'Marketing', description: 'Professional network advertising' },
  { id: 'google-ads', name: 'Google Ads', category: 'Marketing', description: 'Search and display advertising platform' },
  { id: 'canva', name: 'Canva', category: 'Marketing', description: 'Graphic design and visual content creation' },
  { id: 'hootsuite', name: 'Hootsuite', category: 'Marketing', description: 'Social media management platform' },
  { id: 'buffer', name: 'Buffer', category: 'Marketing', description: 'Social media scheduling and analytics' },
  { id: 'constant-contact', name: 'Constant Contact', category: 'Marketing', description: 'Email marketing and automation' },
  { id: 'marketo', name: 'Marketo', category: 'Marketing', description: 'Marketing automation and analytics' },
  { id: 'pardot', name: 'Pardot', category: 'Marketing', description: 'B2B marketing automation by Salesforce' },
  { id: 'klaviyo', name: 'Klaviyo', category: 'Marketing', description: 'Email and SMS marketing platform' },
  { id: 'semrush', name: 'SEMrush', category: 'Marketing', description: 'SEO and digital marketing toolkit' },
  { id: 'ahrefs', name: 'Ahrefs', category: 'Marketing', description: 'SEO analysis and backlink research' },

  // Sales Tools
  { id: 'salesforce', name: 'Salesforce', category: 'Sales', description: 'Customer relationship management platform' },
  { id: 'pipedrive', name: 'Pipedrive', category: 'Sales', description: 'Sales pipeline management CRM' },
  { id: 'hubspot-crm', name: 'HubSpot CRM', category: 'Sales', description: 'Free customer relationship management' },
  { id: 'linkedin-sales', name: 'LinkedIn Sales Navigator', category: 'Sales', description: 'Advanced LinkedIn prospecting tool' },
  { id: 'outreach', name: 'Outreach', category: 'Sales', description: 'Sales engagement and automation platform' },
  { id: 'salesloft', name: 'SalesLoft', category: 'Sales', description: 'Sales engagement and cadence platform' },
  { id: 'zoho-crm', name: 'Zoho CRM', category: 'Sales', description: 'Customer relationship management software' },
  { id: 'freshsales', name: 'Freshsales', category: 'Sales', description: 'CRM software for sales teams' },
  { id: 'close', name: 'Close', category: 'Sales', description: 'Inside sales CRM and phone system' },
  { id: 'copper', name: 'Copper', category: 'Sales', description: 'CRM designed for Google Workspace' },
  { id: 'apollo', name: 'Apollo', category: 'Sales', description: 'Sales intelligence and engagement platform' },
  { id: 'zoominfo', name: 'ZoomInfo', category: 'Sales', description: 'B2B contact database and sales intelligence' },
  { id: 'gong', name: 'Gong', category: 'Sales', description: 'Revenue intelligence and conversation analytics' },
  { id: 'chorus', name: 'Chorus', category: 'Sales', description: 'Conversation intelligence for sales teams' },

  // Service Tools
  { id: 'zendesk', name: 'Zendesk', category: 'Service', description: 'Customer service and support ticketing system' },
  { id: 'slack', name: 'Slack', category: 'Service', description: 'Team communication and collaboration platform' },
  { id: 'jira', name: 'Jira', category: 'Service', description: 'Issue tracking and project management' },
  { id: 'freshdesk', name: 'Freshdesk', category: 'Service', description: 'Customer support software' },
  { id: 'intercom', name: 'Intercom', category: 'Service', description: 'Customer messaging and support platform' },
  { id: 'helpscout', name: 'Help Scout', category: 'Service', description: 'Customer service platform and help desk' },
  { id: 'servicenow', name: 'ServiceNow', category: 'Service', description: 'IT service management platform' },
  { id: 'microsoft-teams', name: 'Microsoft Teams', category: 'Service', description: 'Communication and collaboration platform' },
  { id: 'zoom', name: 'Zoom', category: 'Service', description: 'Video conferencing and communication' },
  { id: 'discord', name: 'Discord', category: 'Service', description: 'Voice, video and text communication' },
  { id: 'confluence', name: 'Confluence', category: 'Service', description: 'Team collaboration and documentation' },
  { id: 'notion', name: 'Notion', category: 'Service', description: 'All-in-one workspace for notes and collaboration' },
  { id: 'asana', name: 'Asana', category: 'Service', description: 'Project management and team collaboration' },
  { id: 'trello', name: 'Trello', category: 'Service', description: 'Visual project management with boards' },

  // Other Tools
  { id: 'github', name: 'GitHub', category: 'Other', description: 'Code hosting and version control platform' },
  { id: 'quickbooks', name: 'QuickBooks', category: 'Other', description: 'Accounting and financial management software' },
  { id: 'bamboohr', name: 'BambooHR', category: 'Other', description: 'Human resources management system' },
  { id: 'docker', name: 'Docker', category: 'Other', description: 'Containerization and deployment platform' },
  { id: 'aws', name: 'AWS', category: 'Other', description: 'Cloud computing and infrastructure services' },
  { id: 'azure', name: 'Microsoft Azure', category: 'Other', description: 'Cloud computing platform and services' },
  { id: 'google-cloud', name: 'Google Cloud', category: 'Other', description: 'Cloud computing and storage services' },
  { id: 'figma', name: 'Figma', category: 'Other', description: 'Collaborative design and prototyping tool' },
  { id: 'adobe-creative', name: 'Adobe Creative Suite', category: 'Other', description: 'Design and creative software suite' },
  { id: 'tableau', name: 'Tableau', category: 'Other', description: 'Data visualization and analytics platform' },
  { id: 'power-bi', name: 'Power BI', category: 'Other', description: 'Business analytics and data visualization' },
  { id: 'mongodb', name: 'MongoDB', category: 'Other', description: 'Document-oriented database platform' },
  { id: 'postgresql', name: 'PostgreSQL', category: 'Other', description: 'Open source relational database' },
  { id: 'redis', name: 'Redis', category: 'Other', description: 'In-memory data structure store and cache' },
  { id: 'kubernetes', name: 'Kubernetes', category: 'Other', description: 'Container orchestration and management' }
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

import { Settings, MessageSquare, Database, Package, FileText, DollarSign, Users, Monitor, Building2, Calendar, BarChart3, Heart, MessageCircle, Code } from 'lucide-react';

export interface CategoryDefinition {
  id: string;
  name: string;
  icon: typeof Settings;
  description: string;
  examples: string[];
  color: string;
  textColor: string;
}

export const defaultCategories: CategoryDefinition[] = [
  { 
    id: 'Marketing', 
    name: 'Marketing', 
    icon: MessageSquare, 
    description: 'Tools for campaigns, analytics, and content creation',
    examples: ['HubSpot', 'Google Analytics', 'Mailchimp'],
    color: 'bg-primary-glow',
    textColor: 'text-primary-glow'
  },
  { 
    id: 'Sales', 
    name: 'Sales', 
    icon: Settings, 
    description: 'CRM, lead generation, and sales automation tools',
    examples: ['Salesforce', 'Pipedrive', 'LinkedIn Sales Navigator'],
    color: 'bg-primary',
    textColor: 'text-primary'
  },
  { 
    id: 'Service', 
    name: 'Service', 
    icon: Database, 
    description: 'Customer support and service delivery tools',
    examples: ['Zendesk', 'Slack', 'Jira'],
    color: 'bg-accent',
    textColor: 'text-accent'
  },
  { 
    id: 'ERP', 
    name: 'ERP', 
    icon: Building2, 
    description: 'Enterprise resource planning and business process management',
    examples: ['SAP', 'Oracle NetSuite', 'Microsoft Dynamics'],
    color: 'bg-primary',
    textColor: 'text-primary'
  },
  { 
    id: 'HR', 
    name: 'HR', 
    icon: Users, 
    description: 'Human resources, payroll, and employee management',
    examples: ['BambooHR', 'Workday', 'ADP'],
    color: 'bg-accent',
    textColor: 'text-accent'
  },
  { 
    id: 'ProjectManagement', 
    name: 'Project Management', 
    icon: Calendar, 
    description: 'Task management, project planning, and team collaboration',
    examples: ['Asana', 'Monday.com', 'Trello'],
    color: 'bg-secondary',
    textColor: 'text-secondary-foreground'
  },
  { 
    id: 'Analytics', 
    name: 'Analytics', 
    icon: BarChart3, 
    description: 'Data visualization, business intelligence, and reporting',
    examples: ['Tableau', 'Power BI', 'Looker'],
    color: 'bg-primary-glow',
    textColor: 'text-primary-glow'
  },
  { 
    id: 'Finance', 
    name: 'Finance & Accounting', 
    icon: DollarSign, 
    description: 'Accounting, invoicing, and financial management',
    examples: ['QuickBooks', 'Xero', 'FreshBooks'],
    color: 'bg-primary',
    textColor: 'text-primary'
  },
  { 
    id: 'CustomerSuccess', 
    name: 'Customer Success', 
    icon: Heart, 
    description: 'Customer retention, onboarding, and success management',
    examples: ['Gainsight', 'ChurnZero', 'Totango'],
    color: 'bg-accent',
    textColor: 'text-accent'
  },
  { 
    id: 'Communication', 
    name: 'Communication', 
    icon: MessageCircle, 
    description: 'Team chat, video conferencing, and internal communication',
    examples: ['Slack', 'Microsoft Teams', 'Zoom'],
    color: 'bg-secondary',
    textColor: 'text-secondary-foreground'
  },
  { 
    id: 'Development', 
    name: 'Development', 
    icon: Code, 
    description: 'Code repositories, deployment, and developer tools',
    examples: ['GitHub', 'GitLab', 'Docker'],
    color: 'bg-primary-glow',
    textColor: 'text-primary-glow'
  },
  {
    id: 'Other',
    name: 'Other',
    icon: Package,
    description: 'Miscellaneous business tools and specialized software',
    examples: ['Custom tools', 'Industry-specific software'],
    color: 'bg-secondary',
    textColor: 'text-secondary-foreground'
  }
];

// Fallback configurations for unknown categories
export const fallbackCategoryConfigs = {
  DevOps: { icon: Monitor, color: 'bg-blue-500', textColor: 'text-blue-500' },
  IT: { icon: Monitor, color: 'bg-gray-500', textColor: 'text-gray-500' },
  HR: { icon: Users, color: 'bg-green-500', textColor: 'text-green-500' },
  Finance: { icon: DollarSign, color: 'bg-yellow-500', textColor: 'text-yellow-500' },
  Operations: { icon: Settings, color: 'bg-purple-500', textColor: 'text-purple-500' },
  Productivity: { icon: FileText, color: 'bg-indigo-500', textColor: 'text-indigo-500' }
};

export const getCategoryConfig = (category: string) => {
  // First check if it's in our default categories
  const defaultCategory = defaultCategories.find(cat => cat.id === category);
  if (defaultCategory) {
    return {
      icon: defaultCategory.icon,
      color: defaultCategory.color,
      textColor: defaultCategory.textColor
    };
  }

  // Check fallback configurations
  const fallback = fallbackCategoryConfigs[category as keyof typeof fallbackCategoryConfigs];
  if (fallback) {
    return fallback;
  }

  // Default fallback
  return {
    icon: Package,
    color: 'bg-muted',
    textColor: 'text-muted-foreground'
  };
};

export const getAllCategoryIds = (): string[] => {
  return defaultCategories.map(cat => cat.id);
};

export const getAllCategories = (): CategoryDefinition[] => {
  return [...defaultCategories];
};
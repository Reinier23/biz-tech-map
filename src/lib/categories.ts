import { Settings, MessageSquare, Database, Package, FileText, DollarSign, Users, Monitor } from 'lucide-react';

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
    id: 'Other',
    name: 'Other',
    icon: Package,
    description: 'DevOps, HR, Finance, and specialized business tools',
    examples: ['GitHub', 'BambooHR', 'QuickBooks', 'Jira', 'Docker'],
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
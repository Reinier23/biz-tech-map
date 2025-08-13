import { useEffect } from 'react';
import { useTools } from '@/contexts/ToolsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const sampleTools = [
  {
    id: 'salesforce-1',
    name: 'Salesforce',
    category: 'Sales',
    description: 'Cloud-based CRM platform for sales automation, lead management, and customer relationship management with advanced reporting and forecasting capabilities.',
  },
  {
    id: 'mailchimp-1',
    name: 'Mailchimp',
    category: 'Marketing',
    description: 'Email marketing platform with automation, landing pages, audience segmentation, and marketing analytics for small to medium businesses.',
  },
  {
    id: 'intercom-1',
    name: 'Intercom',
    category: 'Service',
    description: 'Customer messaging platform providing live chat, help desk, knowledge base, and customer support automation with conversational experiences.',
  },
  {
    id: 'pipedrive-1',
    name: 'Pipedrive',
    category: 'Sales',
    description: 'Visual sales pipeline management tool with deal tracking, activity reminders, and sales reporting designed for small sales teams.',
  },
  {
    id: 'marketo-1',
    name: 'Marketo',
    category: 'Marketing',
    description: 'Enterprise marketing automation platform with lead nurturing, email marketing, social media marketing, and advanced analytics.',
  },
  {
    id: 'zendesk-1',
    name: 'Zendesk',
    category: 'Service',
    description: 'Customer service platform with ticketing system, knowledge base, live chat, and customer satisfaction surveys for support teams.',
  },
  {
    id: 'pardot-1',
    name: 'Pardot',
    category: 'Marketing',
    description: 'B2B marketing automation by Salesforce with lead scoring, email marketing, landing pages, and ROI reporting for complex sales cycles.',
  },
  {
    id: 'freshsales-1',
    name: 'Freshsales',
    category: 'Sales',
    description: 'CRM software with lead management, deal tracking, email integration, phone integration, and sales analytics for growing businesses.',
  },
  {
    id: 'slack-1',
    name: 'Slack',
    category: 'Service',
    description: 'Team communication platform with channels, direct messaging, file sharing, and integration with various business applications.',
  },
  {
    id: 'constant-contact-1',
    name: 'Constant Contact',
    category: 'Marketing',
    description: 'Email marketing service with templates, list management, automation, social media posting, and event management tools.',
  },
  {
    id: 'monday-1',
    name: 'Monday.com',
    category: 'Sales',
    description: 'Work management platform with project tracking, team collaboration, pipeline management, and customizable workflows.',
  },
  {
    id: 'freshdesk-1',
    name: 'Freshdesk',
    category: 'Service',
    description: 'Customer support software with multi-channel ticketing, automation, knowledge base, and customer satisfaction measurement.',
  }
];

interface SampleDataLoaderProps {
  onDataLoaded?: () => void;
}

export const SampleDataLoader = ({ onDataLoaded }: SampleDataLoaderProps) => {
  const { tools, setTools } = useTools();

  const loadSampleData = () => {
    setTools(sampleTools);
    onDataLoaded?.();
  };

  const clearData = () => {
    setTools([]);
  };

  return null;
};
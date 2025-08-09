export interface SimpleTool {
  name: string;
  category: string;
  description?: string;
}

export interface OverlapGroup {
  subdomain: string;
  tools: SimpleTool[];
}

export const deriveSubdomain = (tool: SimpleTool): string => {
  const text = `${tool.name} ${tool.category} ${tool.description ?? ''}`.toLowerCase();

  const checks: Array<{ match: RegExp; label: string }> = [
    { match: /(email|newsletter|mailchimp|klaviyo|campaign|mailer|hubspot)/, label: 'Email Marketing' },
    { match: /(crm|customer relationship|salesforce|pipedrive|hubspot\s*crm)/, label: 'CRM' },
    { match: /(marketing automation|automation|workflow|journey|nurture)/, label: 'Marketing Automation' },
    { match: /(support|help\s?desk|ticket|zendesk|service desk)/, label: 'Customer Support' },
    { match: /(analytics|reporting|tracking|amplitude|mixpanel|ga4|google analytics)/, label: 'Analytics' },
    { match: /(chat|messaging|live chat|intercom|drift)/, label: 'Chat/Messaging' },
    { match: /(cms|content management|website builder)/, label: 'CMS' },
    { match: /(ads|advertising|ad platform|campaign manager)/, label: 'Advertising' },
  ];

  const found = checks.find(c => c.match.test(text));
  return found ? found.label : (tool.category || 'Other');
};

export const computeOverlap = (tools: SimpleTool[]): OverlapGroup[] => {
  const groups = new Map<string, SimpleTool[]>();

  for (const tool of tools) {
    const sub = deriveSubdomain(tool);
    if (!groups.has(sub)) groups.set(sub, []);
    groups.get(sub)!.push(tool);
  }

  const overlaps: OverlapGroup[] = [];
  for (const [subdomain, items] of groups.entries()) {
    if (items.length >= 2) {
      overlaps.push({ subdomain, tools: items });
    }
  }

  // Sort by largest overlap first, then alphabetically
  overlaps.sort((a, b) => (b.tools.length - a.tools.length) || a.subdomain.localeCompare(b.subdomain));
  return overlaps;
};

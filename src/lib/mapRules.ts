export interface ToolLike {
  name: string;
  category: string;
  confirmedCategory?: string;
}

export interface SuggestionAction {
  label: string; // button label
  name: string;  // tool to add
  category: string; // target lane
}

export interface Suggestion {
  id: string;
  prompt: string;
  actions: SuggestionAction[];
}

const hasName = (tools: ToolLike[], names: string[]) => {
  const lower = names.map((n) => n.toLowerCase());
  return tools.some((t) => lower.some((n) => t.name.toLowerCase().includes(n)));
};

const hasLane = (tools: ToolLike[], lane: string) => tools.some((t) => (t.confirmedCategory || t.category) === lane);

export function getSuggestions(tools: ToolLike[]): Suggestion[] {
  const out: Suggestion[] = [];

  // 1) ERP missing
  if (!hasLane(tools, 'ERP')) {
    out.push({
      id: 'erp-missing',
      prompt: 'I don’t see an ERP. Are you using NetSuite, SAP, or Odoo?',
      actions: [
        { label: 'Add NetSuite', name: 'NetSuite', category: 'ERP' },
        { label: 'Add SAP', name: 'SAP', category: 'ERP' },
        { label: 'Add Odoo', name: 'Odoo', category: 'ERP' },
      ],
    });
  }

  // 2) Marketing has HubSpot -> suggest CDP (Segment)
  if (hasName(tools, ['HubSpot']) && !hasName(tools, ['Segment'])) {
    out.push({
      id: 'cdp-segment',
      prompt: 'Marketing has HubSpot, do you also use a CDP (Segment)?',
      actions: [{ label: 'Add Segment', name: 'Segment', category: 'Data' }],
    });
  }

  // 3) Cloud present but no monitoring
  if (hasName(tools, ['AWS', 'Azure', 'GCP', 'Google Cloud']) && !hasName(tools, ['Datadog'])) {
    out.push({
      id: 'monitoring',
      prompt: 'Cloud is present. Do you use Datadog for monitoring?',
      actions: [{ label: 'Add Datadog', name: 'Datadog', category: 'Dev/IT' }],
    });
  }

  // 4) Comms present but no Service (helpdesk)
  if (hasLane(tools, 'Comms') && !hasLane(tools, 'Service')) {
    out.push({
      id: 'helpdesk',
      prompt: 'You have Comms tools. Do you also use a helpdesk (Zendesk)?',
      actions: [{ label: 'Add Zendesk', name: 'Zendesk', category: 'Service' }],
    });
  }

  return out.slice(0, 3);
}

export type RuleAction = "Replace" | "Evaluate" | "Keep";

export type AnalyzedItem = {
  name: string;
  category: string;
  cost_mo: number | null;
  action: RuleAction;
  reason: string;
  suggested_alt?: string;
};

export type CostInfo = {
  cost_mo: number | null;
  cost_basis: string | null;
  source: "tool" | "category" | null;
};

const normalize = (s: string) => s.toLowerCase().trim();

const KEY_CATEGORIES = new Set([
  "crm",
  "customer support",
  "helpdesk",
  "service",
  "marketing automation",
  "marketing",
]);

export function analyzeStack(
  tools: Array<{ name: string; category: string }>,
  costsByName: Record<string, CostInfo>
): AnalyzedItem[] {
  const lowerNames = new Set(tools.map((t) => normalize(t.name)));

  // Known overlap rules (MVP)
  const hasIntercom = lowerNames.has("intercom");
  const hasZendesk = lowerNames.has("zendesk");
  const hasMarketo = lowerNames.has("marketo");

  // Category counts
  const catCounts = tools.reduce<Record<string, number>>((acc, t) => {
    const c = normalize(t.category || "other");
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  const results: AnalyzedItem[] = tools.map((t) => {
    const key = normalize(t.name);
    const costInfo = costsByName[key];
    const base: AnalyzedItem = {
      name: t.name,
      category: t.category,
      cost_mo: costInfo?.cost_mo ?? null,
      action: "Keep",
      reason: "No issues detected in initial pass.",
    };

    // Known overlaps first
    if ((hasIntercom && key === "intercom") || (hasZendesk && key === "zendesk")) {
      return {
        ...base,
        action: "Replace",
        reason: hasIntercom && hasZendesk
          ? "Intercom and Zendesk overlap in support/messaging. Consider consolidating."
          : "Overlaps with other service tools; consider consolidation.",
        suggested_alt: "HubSpot Service Hub",
      };
    }
    if (key === "marketo") {
      return {
        ...base,
        action: "Replace",
        reason: "Marketo overlaps with full‑stack marketing platforms.",
        suggested_alt: "HubSpot Marketing Hub",
      };
    }

    // Category redundancy
    const cat = normalize(t.category || "other");
    if ((catCounts[cat] || 0) > 1) {
      return {
        ...base,
        action: "Evaluate",
        reason: `Multiple tools in category “${t.category}” → redundancy potential`,
      };
    }

    // Single tool in key category → Keep
    if (KEY_CATEGORIES.has(cat) && catCounts[cat] === 1) {
      return {
        ...base,
        action: "Keep",
        reason: `Single tool in key category “${t.category}”`,
      };
    }

    return base;
  });

  return results;
}

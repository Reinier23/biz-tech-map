import { supabase } from "@/integrations/supabase/client";

export type CostInfo = {
  cost_mo: number | null;
  cost_basis: string | null;
  source: "tool" | "category" | null;
};

const toNumber = (v: unknown): number | null => {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return isFinite(v) ? v : null;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  }
  return null;
};

export async function resolveCost(name: string, category: string): Promise<CostInfo> {
  const { data, error } = await supabase.rpc("resolve_tool_cost", { name, category });
  if (error) {
    console.warn("resolveCost error", error);
    return { cost_mo: null, cost_basis: null, source: null };
  }
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) return { cost_mo: null, cost_basis: null, source: null };

  return {
    cost_mo: toNumber((row as any).cost_mo),
    cost_basis: (row as any).cost_basis ?? null,
    source: ((row as any).source as "tool" | "category" | null) ?? null,
  };
}

export async function resolveCostsBatch(
  tools: Array<{ name: string; category: string }>
): Promise<Record<string, CostInfo>> {
  const results: Record<string, CostInfo> = {};
  for (const t of tools) {
    const key = t.name.toLowerCase();
    try {
      results[key] = await resolveCost(t.name, t.category);
    } catch {
      results[key] = { cost_mo: null, cost_basis: null, source: null };
    }
  }
  return results;
}

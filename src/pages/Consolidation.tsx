import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useTools } from "@/contexts/ToolsContext";
import { resolveCostsBatch, type CostInfo } from "@/hooks/useToolCosts";
import { analyzeStack, type AnalyzedItem } from "@/lib/ruleEngine";
import { toast } from "sonner";
import { exportConsolidationPDF } from "@/lib/export";

const currency = (n: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const agentSteps = [
  {
    title: "Assess overlaps",
    reasoning: "We detect duplicate categories and known conflicts.",
    next: "Review the Evaluate items and confirm ownership.",
    why: "Redundancy increases cost and operational complexity.",
  },
  {
    title: "Estimate savings",
    reasoning: "We total monthly estimates from tool and category defaults.",
    next: "Prioritize the highest-cost overlaps for action.",
    why: "Targeting big-ticket redundancies delivers faster ROI.",
  },
  {
    title: "Suggest path",
    reasoning: "Propose consolidating into unified hubs where applicable.",
    next: "Start with Service/Marketing Hub evaluation plan.",
    why: "A unified platform reduces overhead and simplifies workflows.",
  },
];

const Consolidation: React.FC = () => {
  const { tools, addTool, removeTool } = useTools();
  const toolsForAnalysis = useMemo(
    () => tools.map(t => ({ name: t.name, category: t.confirmedCategory || t.category })),
    [tools]
  );

  const [costs, setCosts] = useState<Record<string, CostInfo>>({});
  const [loadingCosts, setLoadingCosts] = useState(false);
  const [agentStep, setAgentStep] = useState(0);
  const [staged, setStaged] = useState<Record<string, boolean>>({});
const [drawerOpen, setDrawerOpen] = useState(false);
const exportRef = useRef<HTMLDivElement>(null);
const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoadingCosts(true);
      try {
        const res = await resolveCostsBatch(toolsForAnalysis);
        if (active) setCosts(res);
      } catch (e) {
        // Fallback to empty costs
        if (active) setCosts({});
      } finally {
        if (active) setLoadingCosts(false);
      }
    };
    if (toolsForAnalysis.length > 0) {
      load();
    } else {
      setCosts({});
    }
    return () => {
      active = false;
    };
  }, [toolsForAnalysis]);

  const analyzed: AnalyzedItem[] = useMemo(() => analyzeStack(toolsForAnalysis, costs), [toolsForAnalysis, costs]);

  const { replaceCount, evaluateCount, keepCount } = useMemo(() => {
    let r = 0, e = 0, k = 0;
    for (const a of analyzed) {
      if (a.action === "Replace") r++;
      else if (a.action === "Evaluate") e++;
      else k++;
    }
    return { replaceCount: r, evaluateCount: e, keepCount: k };
  }, [analyzed]);

  const estimatedSpend = useMemo(() => {
    return Object.values(costs).reduce((sum, ci) => sum + (typeof ci?.cost_mo === "number" ? (ci.cost_mo || 0) : 0), 0);
  }, [costs]);

  const actionable = useMemo(() => analyzed.filter((a) => a.action === "Replace" || a.action === "Evaluate"), [analyzed]);

  const findToolForItem = useCallback((item: AnalyzedItem) => {
    const normName = item.name.toLowerCase();
    const normCat = (item.category || "").toLowerCase();
    return (
      tools.find(
        (t) => t.name.toLowerCase() === normName && (t.confirmedCategory || t.category).toLowerCase() === normCat
      ) || tools.find((t) => t.name.toLowerCase() === normName)
    );
  }, [tools]);

  const stagedItems = useMemo(() => {
    return actionable
      .map((item) => ({ item, tool: findToolForItem(item) }))
      .filter((x) => x.tool && staged[x.tool.id]);
  }, [actionable, findToolForItem, staged]);

  const stagedCount = stagedItems.length;

  const estimatedSavings = useMemo(() => {
    return stagedItems.reduce(
      (sum, si) => sum + (typeof si.item.cost_mo === "number" ? (si.item.cost_mo || 0) : 0),
      0
    );
  }, [stagedItems]);

  const suggestedAlts = useMemo(() => {
    const out: Array<{ name: string; category: string }> = [];
    const seen = new Set<string>();
    const mapCategory = (alt: string, fallback: string) => {
      const a = alt.toLowerCase();
      if (a.includes("service hub")) return "service";
      if (a.includes("marketing hub")) return "marketing automation";
      return fallback || "other";
    };
    for (const { item } of stagedItems) {
      if (item.suggested_alt) {
        const key = item.suggested_alt.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          out.push({ name: item.suggested_alt, category: mapCategory(item.suggested_alt, item.category) });
        }
      }
    }
    return out;
  }, [stagedItems]);

  const handleApplyChanges = useCallback(() => {
    const itemsToApply = actionable
      .map((item) => ({ item, tool: findToolForItem(item) }))
      .filter((x) => x.tool && staged[x.tool.id]);

    const idsToRemove = itemsToApply.map((x) => x.tool!.id);
    let removed = 0;
    idsToRemove.forEach((id) => {
      removeTool(id);
      removed++;
    });

    const existingNames = new Set(tools.map((t) => t.name.toLowerCase()));
    let added = 0;
    for (const { item } of itemsToApply) {
      if (item.suggested_alt) {
        const altName = item.suggested_alt;
        if (!existingNames.has(altName.toLowerCase())) {
          const altCategory = (suggestedAlts.find((a) => a.name === altName)?.category) || item.category;
          addTool({
            id: crypto.randomUUID(),
            name: altName,
            category: altCategory,
            description: "Added via consolidation suggestion",
          });
          existingNames.add(altName.toLowerCase());
          added++;
        }
      }
    }

    const count = removed + added;
    toast.success(`Applied ${count} changes`);
    setDrawerOpen(false);
    setStaged({});
    navigate("/tech-map");
  }, [actionable, findToolForItem, staged, removeTool, addTool, tools, suggestedAlts, navigate]);

  if (tools.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
        <SEO title="Consolidation | Tech Stack Mapper" description="Analyze overlaps and estimate savings for your stack." path="/consolidation" />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <CardTitle>No tools yet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Add tools to generate consolidation ideas and savings estimates.</p>
              <Link to="/add-tools">
                <Button>Go to Add Tools</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

const step = agentSteps[agentStep];
const companyName = 'Your Company';

const handleExportReport = useCallback(async () => {
  if (!exportRef.current) return;
  try {
    await exportConsolidationPDF(exportRef.current, 'Consolidation-Report.pdf', companyName);
  } catch (e) {
    toast.error('Failed to export report');
  }
}, []);

return (
    <>
      <SEO title="Consolidation | Tech Stack Mapper" description="Analyze overlaps and estimate savings for your stack." path="/consolidation" />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary" id="main-content">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-6" aria-labelledby="page-title">
            <h1 id="page-title" className="text-3xl font-bold text-foreground">Stack Consolidation</h1>
            <p className="text-sm text-muted-foreground">MVP rule engine: Replace • Evaluate • Keep</p>
          </header>

<div ref={exportRef} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
  <div className="lg:col-span-2 space-y-4">
    {/* Summary Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Estimated Monthly Spend</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingCosts ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <div className="text-2xl font-semibold">{estimatedSpend > 0 ? currency(estimatedSpend) : "—"}</div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Replace</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{replaceCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Evaluate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold">{evaluateCount}</div>
        </CardContent>
      </Card>
    </div>

    {/* Results Table */}
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Analysis Results</CardTitle>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm" onClick={() => setDrawerOpen(true)}>
              View Staged Changes{stagedCount > 0 ? ` (${stagedCount})` : ""}
            </Button>
            <Tooltip>
              <TooltipTrigger className="text-xs text-muted-foreground underline underline-offset-4">
                Cost method
              </TooltipTrigger>
              <TooltipContent>
                Uses tool-specific defaults when known; otherwise a category fallback.
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tool</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Est. Monthly Cost</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Suggested Alternative</TableHead>
              <TableHead>Stage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {analyzed.map((item) => {
              const costInfo = costs[item.name.toLowerCase()];
              const tool = findToolForItem(item);
              const isActionable = item.action === "Replace" || item.action === "Evaluate";
              const isChecked = !!(tool && staged[tool.id]);
              return (
                <TableRow key={item.name}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>
                    {loadingCosts ? (
                      <Skeleton className="h-4 w-20" />
                    ) : item.cost_mo != null ? (
                      <div>
                        <div>{currency(item.cost_mo)}</div>
                        {costInfo?.cost_basis && (
                          <div className="text-xs text-muted-foreground">{costInfo.cost_basis} • {costInfo.source}</div>
                        )}
                      </div>
                    ) : (
                      <span>—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.action === "Replace" ? (
                      <Badge variant="destructive">Replace</Badge>
                    ) : item.action === "Evaluate" ? (
                      <Badge variant="secondary">Evaluate</Badge>
                    ) : (
                      <Badge>Keep</Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[360px]">
                    <span className="text-sm text-foreground">{item.reason}</span>
                  </TableCell>
                  <TableCell>{item.suggested_alt ?? ""}</TableCell>
                  <TableCell>
                    {isActionable && tool ? (
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(val) =>
                          setStaged((prev) => ({ ...prev, [tool.id]: !!val }))
                        }
                        aria-label="Stage change"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableCaption className="pt-4">Estimates only. Actual pricing varies by seats, tiers, and usage.</TableCaption>
        </Table>
      </CardContent>
    </Card>

    <div className="flex justify-end">
      <Button onClick={() => setDrawerOpen(true)}>
        Review Staged Changes
      </Button>
    </div>
  </div>

  {/* Agent Loop Panel */}
  <div className="space-y-4">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Agent Loop</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-sm font-medium">Current step</div>
          <div className="text-sm text-muted-foreground">{step.title}</div>
        </div>
        <div>
          <div className="text-sm font-medium">Reasoning</div>
          <p className="text-sm text-muted-foreground">{step.reasoning}</p>
        </div>
        <div>
          <div className="text-sm font-medium">Why this matters</div>
          <p className="text-sm text-muted-foreground">{step.why}</p>
        </div>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={() => setAgentStep((s) => (s + 1) % agentSteps.length)}>
            Next step
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</div>

          {/* Diff Drawer */}
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetContent side="right" className="w-[400px] sm:w-[480px]">
              <SheetHeader>
                <SheetTitle>Staged Changes</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-6">
                <section>
                  <h3 className="text-sm font-medium">Tools to remove</h3>
                  <ul className="mt-2 space-y-2">
                    {stagedItems.length === 0 ? (
                      <li className="text-sm text-muted-foreground">No staged items.</li>
                    ) : (
                      stagedItems.map(({ item, tool }) => (
                        <li key={tool!.id} className="flex items-center justify-between">
                          <span>{item.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {item.cost_mo != null ? currency(item.cost_mo) : "—"}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </section>
                <section>
                  <h3 className="text-sm font-medium">Suggested replacements</h3>
                  <ul className="mt-2 space-y-2">
                    {suggestedAlts.length === 0 ? (
                      <li className="text-sm text-muted-foreground">None</li>
                    ) : (
                      suggestedAlts.map((alt) => (
                        <li key={alt.name} className="flex items-center justify-between">
                          <span>{alt.name}</span>
                          <Badge variant="outline">{alt.category}</Badge>
                        </li>
                      ))
                    )}
                  </ul>
                </section>
                <section className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Estimated savings</div>
                    <div className="text-xl font-semibold">
                      {estimatedSavings > 0 ? currency(estimatedSavings) : "—"}
                    </div>
                  </div>
                </section>
              </div>
              <SheetFooter className="mt-6">
                <Button disabled={stagedItems.length === 0} onClick={handleApplyChanges}>
                  Apply Staged Changes
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </main>
    </>
  );
};

export default Consolidation;

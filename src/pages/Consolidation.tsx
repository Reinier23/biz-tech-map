import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTools } from "@/contexts/ToolsContext";
import { resolveCostsBatch, type CostInfo } from "@/hooks/useToolCosts";
import { analyzeStack, type AnalyzedItem } from "@/lib/ruleEngine";
import { toast } from "sonner";

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
  const { tools } = useTools();
  const toolsForAnalysis = useMemo(
    () => tools.map(t => ({ name: t.name, category: t.confirmedCategory || t.category })),
    [tools]
  );

  const [costs, setCosts] = useState<Record<string, CostInfo>>({});
  const [loadingCosts, setLoadingCosts] = useState(false);
  const [agentStep, setAgentStep] = useState(0);

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

  return (
    <>
      <SEO title="Consolidation | Tech Stack Mapper" description="Analyze overlaps and estimate savings for your stack." path="/consolidation" />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary" id="main-content">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-6" aria-labelledby="page-title">
            <h1 id="page-title" className="text-3xl font-bold text-foreground">Stack Consolidation</h1>
            <p className="text-sm text-muted-foreground">MVP rule engine: Replace • Evaluate • Keep</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                    <Tooltip>
                      <TooltipTrigger className="text-xs text-muted-foreground underline underline-offset-4">
                        Cost method
                      </TooltipTrigger>
                      <TooltipContent>
                        Uses tool-specific defaults when known; otherwise a category fallback.
                      </TooltipContent>
                    </Tooltip>
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analyzed.map((item) => {
                        const costInfo = costs[item.name.toLowerCase()];
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
                          </TableRow>
                        );
                      })}
                    </TableBody>
                    <TableCaption className="pt-4">Estimates only. Actual pricing varies by seats, tiers, and usage.</TableCaption>
                  </Table>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  onClick={() => toast.success("Suggestions queued. Coming soon!")}
                >
                  Apply Suggestions
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
        </div>
      </main>
    </>
  );
};

export default Consolidation;

import React, { useEffect, useMemo, useState } from "react";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_LANES } from "@/contexts/MapGraphContext";
import { toast } from "sonner";

interface ToolCostRow {
  name: string;
  category: string;
  cost_mo: number | null;
  cost_basis: string;
  notes: string | null;
}

interface CategoryFallbackRow {
  category: string;
  default_cost_mo: number | null;
  cost_basis: string;
}

type LaneSettings = { labels?: Record<string, string>; colors?: Record<string, string> };

const SettingsPage: React.FC = () => {
  // Costs tab state
  const [toolCosts, setToolCosts] = useState<ToolCostRow[] | null>(null);
  const [catFallbacks, setCatFallbacks] = useState<CategoryFallbackRow[] | null>(null);
  const [savingRow, setSavingRow] = useState<string | null>(null);

  // Categories tab state
  const [laneSettings, setLaneSettings] = useState<LaneSettings>({ labels: {}, colors: {} });
  const [loadingLanes, setLoadingLanes] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [{ data: tc }, { data: cf }, { data: lanes }] = await Promise.all([
          supabase.from("tool_cost_defaults").select("name, category, cost_mo, cost_basis, notes").order("name"),
          supabase.from("category_cost_fallbacks").select("category, default_cost_mo, cost_basis").order("category"),
          supabase.from("ui_settings").select("value").eq("key", "lanes").maybeSingle(),
        ]);
        if (!active) return;
        setToolCosts(tc ?? []);
        setCatFallbacks(cf ?? []);
        if (lanes?.value) setLaneSettings(lanes.value as LaneSettings);
      } catch (e) {
        console.error("[settings] load error", e);
        toast.error("Failed to load settings");
      } finally {
        if (active) setLoadingLanes(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSaveToolCost = async (row: ToolCostRow) => {
    setSavingRow(`tool:${row.name}`);
    try {
      const { error } = await supabase
        .from("tool_cost_defaults")
        .update({
          category: row.category,
          cost_mo: row.cost_mo,
          cost_basis: row.cost_basis,
          notes: row.notes,
        })
        .eq("name", row.name);
      if (error) throw error;
      toast.success("Saved");
    } catch (e) {
      console.error(e);
      toast.error("Save failed");
    } finally {
      setSavingRow(null);
    }
  };

  const handleSaveCategoryFallback = async (row: CategoryFallbackRow) => {
    setSavingRow(`cat:${row.category}`);
    try {
      const { error } = await supabase
        .from("category_cost_fallbacks")
        .update({
          default_cost_mo: row.default_cost_mo,
          cost_basis: row.cost_basis,
        })
        .eq("category", row.category);
      if (error) throw error;
      toast.success("Saved");
    } catch (e) {
      console.error(e);
      toast.error("Save failed");
    } finally {
      setSavingRow(null);
    }
  };

  const lanesList = useMemo(() => CATEGORY_LANES, []);

  const handleSaveLanes = async () => {
    try {
      const { error } = await supabase
        .from("ui_settings")
        .upsert({ key: "lanes", value: laneSettings }, { onConflict: "key" });
      if (error) throw error;
      toast.success("Lane settings saved (refresh Tech Map to see changes)");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save lane settings");
    }
  };

  return (
    <>
      <SEO title="Settings | Tech Stack Mapper" description="Configure costs and categories." path="/settings" />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary" id="main-content">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-6">
            <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Edit cost defaults and category display.</p>
          </header>

          <Tabs defaultValue="costs" className="w-full">
            <TabsList>
              <TabsTrigger value="costs">Costs</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </TabsList>

            <TabsContent value="costs" className="space-y-8 mt-4">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-4">Tool Cost Defaults</h2>
                  {!toolCosts ? (
                    <Skeleton className="h-32 w-full" />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Cost/mo</TableHead>
                          <TableHead>Basis</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead>Save</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {toolCosts.map((row, idx) => (
                          <TableRow key={row.name + idx}>
                            <TableCell className="font-medium">{row.name}</TableCell>
                            <TableCell>
                              <Input value={row.category}
                                onChange={(e) => setToolCosts(prev => prev!.map((r, i) => i === idx ? { ...r, category: e.target.value } : r))} />
                            </TableCell>
                            <TableCell>
                              <Input type="number" value={row.cost_mo ?? ''}
                                onChange={(e) => setToolCosts(prev => prev!.map((r, i) => i === idx ? { ...r, cost_mo: e.target.value === '' ? null : Number(e.target.value) } : r))} />
                            </TableCell>
                            <TableCell>
                              <Input value={row.cost_basis}
                                onChange={(e) => setToolCosts(prev => prev!.map((r, i) => i === idx ? { ...r, cost_basis: e.target.value } : r))} />
                            </TableCell>
                            <TableCell>
                              <Input value={row.notes ?? ''}
                                onChange={(e) => setToolCosts(prev => prev!.map((r, i) => i === idx ? { ...r, notes: e.target.value } : r))} />
                            </TableCell>
                            <TableCell>
                              <Button size="sm" onClick={() => handleSaveToolCost(toolCosts[idx])} disabled={savingRow === `tool:${row.name}`}>
                                {savingRow === `tool:${row.name}` ? 'Saving...' : 'Save'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-lg font-semibold mb-4">Category Cost Fallbacks</h2>
                  {!catFallbacks ? (
                    <Skeleton className="h-32 w-full" />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead>Default Cost/mo</TableHead>
                          <TableHead>Basis</TableHead>
                          <TableHead>Save</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {catFallbacks.map((row, idx) => (
                          <TableRow key={row.category + idx}>
                            <TableCell className="font-medium">{row.category}</TableCell>
                            <TableCell>
                              <Input type="number" value={row.default_cost_mo ?? ''}
                                onChange={(e) => setCatFallbacks(prev => prev!.map((r, i) => i === idx ? { ...r, default_cost_mo: e.target.value === '' ? null : Number(e.target.value) } : r))} />
                            </TableCell>
                            <TableCell>
                              <Input value={row.cost_basis}
                                onChange={(e) => setCatFallbacks(prev => prev!.map((r, i) => i === idx ? { ...r, cost_basis: e.target.value } : r))} />
                            </TableCell>
                            <TableCell>
                              <Button size="sm" onClick={() => handleSaveCategoryFallback(catFallbacks[idx])} disabled={savingRow === `cat:${row.category}`}>
                                {savingRow === `cat:${row.category}` ? 'Saving...' : 'Save'}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="mt-4">
              <Card>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {lanesList.map((lane) => (
                      <div key={lane} className="border rounded-lg p-4 bg-card/30">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold">{lane}</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-3 items-center">
                            <Label className="text-xs">Display Label</Label>
                            <Input className="col-span-2" value={laneSettings.labels?.[lane] ?? ''}
                              onChange={(e) => setLaneSettings(prev => ({
                                labels: { ...(prev.labels || {}), [lane]: e.target.value },
                                colors: prev.colors || {}
                              }))}
                              placeholder={lane}
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-3 items-center">
                            <Label className="text-xs">Color</Label>
                            <input type="color" className="col-span-2 h-10 w-20 bg-transparent border rounded"
                              value={laneSettings.colors?.[lane] ?? "#e5e7eb"}
                              onChange={(e) => setLaneSettings(prev => ({
                                labels: prev.labels || {},
                                colors: { ...(prev.colors || {}), [lane]: e.target.value }
                              }))}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveLanes}>Save Category Settings</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
};

export default SettingsPage;

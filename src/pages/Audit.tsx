import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Download, Eye, Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { fetchAudit, fetchEventTypes, AuditRow } from '@/hooks/useAuditLog';
import { summarize } from '@/lib/auditUtils';
import { toCSV } from '@/lib/csv';
import { DEBUG } from '@/lib/config';

const PAGE_SIZE_OPTIONS = [25, 50, 100];

const AuditPage: React.FC = () => {
  const { toast } = useToast();

  // Filters
  const [eventType, setEventType] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [from, setFrom] = useState<string | null>(null);
  const [to, setTo] = useState<string | null>(null);
  const [groupByEvent, setGroupByEvent] = useState(false);

  // Paging
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);

  // Data
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [eventTypes, setEventTypes] = useState<string[]>([]);

  // Details
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<AuditRow | null>(null);

  // Default date range: last 7 days
  useEffect(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    setFrom(start.toISOString());
    setTo(now.toISOString());
  }, []);

  // Load event types
  useEffect(() => {
    fetchEventTypes().then(setEventTypes).catch(() => {});
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    try {
      const { rows, total } = await fetchAudit({ eventType, q: debouncedQ || null, from, to, page, pageSize });
      if (DEBUG) console.debug('audit load', { eventType, debouncedQ, from, to, page, pageSize, total });
      setRows(rows);
      setTotal(total);
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Failed to load audit log', description: e?.message ?? 'Unexpected error' });
    }
  }, [eventType, debouncedQ, from, to, page, pageSize, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const pages = Math.max(1, Math.ceil(total / pageSize));

  const grouped = useMemo(() => {
    const map = new Map<string, AuditRow[]>();
    for (const r of rows) {
      const k = r.event_type;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(r);
    }
    return map;
  }, [rows]);

  const handleView = (row: AuditRow) => {
    setSelected(row);
    setOpen(true);
  };

  const handleExport = useCallback(async () => {
    try {
      // Re-query up to 2000 with current filters
      const { rows: all } = await fetchAudit({ eventType, q: debouncedQ || null, from, to, page: 1, pageSize: 2000 });
      const csvRows = all.map((r) => ({
        timestamp: new Date(r.timestamp).toLocaleString(),
        event_type: r.event_type,
        summary: summarize(r.details, r.event_type),
        details_json: JSON.stringify(r.details),
      }));
      const csv = toCSV(csvRows);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_export_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      if (DEBUG) console.debug('audit CSV exported', csvRows.length);
    } catch (e: any) {
      console.error(e);
      toast({ title: 'CSV export failed', description: e?.message ?? 'Unexpected error' });
    }
  }, [eventType, debouncedQ, from, to, toast]);

  const resetPageOnFilter = useCallback(() => setPage(1), []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <SEO title="Audit Log Console" description="Filter and export your activity logs" path="/audit" />

      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Audit Log</h1>
        <nav className="text-sm">
          <Link to="/" className="underline">Home</Link>
        </nav>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Event type */}
            <div className="md:col-span-1">
              <Select 
                value={eventType ?? ''} 
                onValueChange={(v) => { setEventType(v || null); resetPageOnFilter(); }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All events</SelectItem>
                  {(eventTypes || []).map((et) => (
                    <SelectItem key={et} value={et}>{et}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* From date */}
            <div>
              <Input 
                type="date" 
                value={from ? new Date(from).toISOString().slice(0,10) : ''}
                onChange={(e) => { 
                  const v = e.target.value ? new Date(e.target.value) : null;
                  setFrom(v ? new Date(v.setHours(0,0,0,0)).toISOString() : null);
                  resetPageOnFilter();
                }}
                aria-label="From date"
              />
            </div>

            {/* To date */}
            <div>
              <Input 
                type="date" 
                value={to ? new Date(to).toISOString().slice(0,10) : ''}
                onChange={(e) => { 
                  const v = e.target.value ? new Date(e.target.value) : null;
                  setTo(v ? new Date(v.setHours(23,59,59,999)).toISOString() : null);
                  resetPageOnFilter();
                }}
                aria-label="To date"
              />
            </div>

            {/* Search */}
            <div className="md:col-span-2 flex items-center gap-2">
              <Search className="h-4 w-4 opacity-60" />
              <Input 
                placeholder="Search events or details..." 
                value={q}
                onChange={(e) => { setQ(e.target.value); resetPageOnFilter(); }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <label className="text-sm flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={groupByEvent} 
                  onChange={(e) => setGroupByEvent(e.target.checked)}
                />
                Group by event
              </label>
              <Separator orientation="vertical" className="h-6" />
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs opacity-70">Page size</span>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-[90px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Results ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div className="text-sm opacity-70">No events match your filters.</div>
          ) : (
            <div className="overflow-x-auto">
              {groupByEvent ? (
                Array.from(grouped.entries()).map(([type, items]) => (
                  <div key={type} className="mb-6">
                    <div className="text-sm font-medium mb-2">{type} <span className="opacity-60">({items.length})</span></div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-48">Timestamp</TableHead>
                          <TableHead className="w-40">Event</TableHead>
                          <TableHead>Summary</TableHead>
                          <TableHead className="w-20">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((r) => (
                          <TableRow key={r.id}>
                            <TableCell className="align-top text-xs whitespace-nowrap">{new Date(r.timestamp).toLocaleString()}</TableCell>
                            <TableCell className="align-top"><Badge variant="outline">{r.event_type}</Badge></TableCell>
                            <TableCell className="align-top text-sm">{summarize(r.details, r.event_type)}</TableCell>
                            <TableCell className="align-top">
                              <Button variant="secondary" size="sm" onClick={() => handleView(r)}><Eye className="h-4 w-4" /></Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-48">Timestamp</TableHead>
                      <TableHead className="w-40">Event</TableHead>
                      <TableHead>Summary</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="align-top text-xs whitespace-nowrap">{new Date(r.timestamp).toLocaleString()}</TableCell>
                        <TableCell className="align-top"><Badge variant="outline">{r.event_type}</Badge></TableCell>
                        <TableCell className="align-top text-sm">{summarize(r.details, r.event_type)}</TableCell>
                        <TableCell className="align-top">
                          <Button variant="secondary" size="sm" onClick={() => handleView(r)}><Eye className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <div className="text-xs opacity-70">Page {page} of {pages}</div>
            <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Details Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[90vw] sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Event Details</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-4 space-y-3">
              <div className="text-sm"><span className="opacity-60">ID:</span> {selected.id}</div>
              <div className="text-sm"><span className="opacity-60">Timestamp:</span> {new Date(selected.timestamp).toLocaleString()}</div>
              <div className="text-sm"><span className="opacity-60">Event:</span> {selected.event_type}</div>
              <Separator />
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(selected.id)}>Copy ID</Button>
                <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(JSON.stringify(selected.details, null, 2))}>Copy JSON</Button>
              </div>
              <pre className="text-xs bg-muted/40 p-3 rounded overflow-auto max-h-[60vh]">
                {JSON.stringify(selected.details, null, 2)}
              </pre>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AuditPage;

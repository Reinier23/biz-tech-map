import React, { useEffect, useState } from 'react';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { runSmokeChecklist, type SmokeResult } from '@/lib/smoke';
import fixQueue from '../../docs/fix_queue.json';

const FixRunner: React.FC = () => {
  const [results, setResults] = useState<SmokeResult[] | null>(null);

  const run = async () => {
    const r = await runSmokeChecklist();
    setResults(r);
  };

  useEffect(() => {
    // optional auto-run
  }, []);

  return (
    <>
      <SEO title="Fix Runner | Tech Stack Mapper" description="Run queued fixes and smoke checks." path="/fix-runner" />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary" id="main-content">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Fix Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(fixQueue) && fixQueue.map((item: any) => (
                  <div key={item.id} className="flex items-start justify-between gap-4 border-b pb-4">
                    <div>
                      <div className="font-medium">{item.id} · {item.title} <Badge variant={item.severity === 'critical' ? 'destructive' : 'secondary'} className="ml-2">{item.severity}</Badge></div>
                      <div className="text-sm text-muted-foreground mt-1">Files: {item.files.join(', ')}</div>
                      <div className="text-sm mt-2">Status: <Badge variant={item.status === 'done' ? 'default' : 'outline'}>{item.status}</Badge> {item.note ? `— ${item.note}` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Smoke Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={run}>Run Checks</Button>
              <div className="mt-4 space-y-2">
                {results?.map((r, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>{r.name}</div>
                    <Badge variant={r.pass ? 'default' : 'destructive'}>{r.pass ? 'pass' : 'fail'}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default FixRunner;

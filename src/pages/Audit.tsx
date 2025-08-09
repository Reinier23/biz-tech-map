import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from 'react-router-dom';

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  event_type: string;
  details: any;
}

const AuditPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }
        setEmail(user.email ?? null);
        const { data, error } = await supabase
          .from('audit_log')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(100);
        if (error) throw error;
        setLogs((data as AuditLog[]) || []);
      } catch (e: any) {
        console.error('Failed to load audit logs', e);
        setError('Could not load audit logs');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <SEO 
        title="Audit Log | Tech Map"
        description="View your recent activity in the audit log"
        path="/audit"
      />

      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Audit Log</h1>
        <nav className="text-sm">
          <Link to="/" className="underline">Home</Link>
        </nav>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Last 100 events {email ? `for ${email}` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm opacity-70">Loading…</div>
          ) : !email ? (
            <div className="text-sm opacity-70">Please sign in to view your audit log.</div>
          ) : error ? (
            <div className="text-sm text-destructive">{error}</div>
          ) : logs.length === 0 ? (
            <div className="text-sm opacity-70">No events yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-48">Timestamp</TableHead>
                    <TableHead className="w-40">Event</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="align-top text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell className="align-top text-xs font-medium">{log.event_type}</TableCell>
                      <TableCell className="align-top text-xs">
                        <pre className="text-xs whitespace-pre-wrap break-words">{JSON.stringify(log.details, null, 2)}</pre>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditPage;

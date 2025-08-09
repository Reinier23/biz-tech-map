export function toCSV(rows: Array<{ timestamp: string; event_type: string; summary: string; details_json: string }>): string {
  const headers = ['timestamp', 'event_type', 'summary', 'details_json'];
  const escape = (val: string) => '"' + (val ?? '').replace(/"/g, '""') + '"';
  const lines = [headers.join(',')];
  for (const r of rows) {
    lines.push([
      escape(r.timestamp),
      escape(r.event_type),
      escape(r.summary),
      escape(r.details_json),
    ].join(','));
  }
  return lines.join('\n');
}

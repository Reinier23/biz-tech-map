import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent } from '@/components/ui/card';
import { ListPlus, ChevronDown, ChevronUp, Upload } from 'lucide-react';

interface BulkAddPanelProps {
  onAddTool: (toolName: string, category?: string) => void;
}

// Simple parser: supports lines like "Marketo (Marketing)" or just "Slack"
function parseTools(input: string): Array<{ name: string; category?: string }> {
  return input
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(.*?)(?:\s*\(([^)]+)\))?$/);
      if (!match) return { name: line };
      const name = match[1].trim();
      const category = match[2]?.trim();
      return { name, category };
    });
}

export const BulkAddPanel: React.FC<BulkAddPanelProps> = ({ onAddTool }) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  const items = useMemo(() => parseTools(value), [value]);
  const count = items.length;

  const handleSubmit = async () => {
    for (const item of items) {
      if (item.name) {
        onAddTool(item.name, item.category);
      }
    }
    setValue('');
  };

  return (
    <Card className="border-dashed">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span className="inline-flex items-center gap-2">
              <ListPlus className="h-4 w-4" />
              Bulk add tools (paste a list)
            </span>
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-6 space-y-3">
            <Textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={
                'Example:\nSlack (Service)\nSalesforce (Sales)\nMarketo (Marketing)\nJira\nConfluence'
              }
              className="min-h-32"
              aria-label="Bulk add tools textarea"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{count} item{count !== 1 ? 's' : ''} detected</span>
              <Button onClick={handleSubmit} disabled={count === 0} className="gap-2">
                <Upload className="h-4 w-4" />
                Add {count} tool{count !== 1 ? 's' : ''}
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default BulkAddPanel;

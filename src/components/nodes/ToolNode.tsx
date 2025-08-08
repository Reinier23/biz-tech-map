import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { Building } from 'lucide-react';

export const ToolNode: React.FC<NodeProps> = ({ data }) => {
  const d = (data || {}) as { label?: string; logoUrl?: string; category?: string };
  const label = d.label ?? '';
  const logoUrl = d.logoUrl as string | undefined;

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-md border bg-card shadow-sm w-[200px] h-[72px]">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={`${label} logo`}
          className="w-8 h-8 rounded"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).onerror = null;
            (e.currentTarget as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
      ) : (
        <div className="w-8 h-8 rounded border flex items-center justify-center text-muted-foreground">
          <Building className="w-4 h-4" />
        </div>
      )}
      <div className="text-sm font-medium text-foreground line-clamp-2">{label}</div>
    </div>
  );
};

export default ToolNode;

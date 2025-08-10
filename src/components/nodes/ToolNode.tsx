import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { Building } from 'lucide-react';

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const ToolNode: React.FC<NodeProps> = ({ data }) => {
  const d = (data || {}) as { label?: string; logoUrl?: string; category?: string; colorHex?: string };
  const label = d.label ?? '';
  const logoUrl = d.logoUrl as string | undefined;
  const category = d.category ?? 'Other';
  const colorHex = d.colorHex ?? '#94A3B8';
  const pillBg = hexToRgba(colorHex, 0.12);

  return (
    <div
      className="tool-card flex items-center gap-3 px-3 py-2 rounded-lg border bg-card shadow-sm w-[200px] h-[72px]"
      style={{ ['--lane-color' as any]: colorHex } as React.CSSProperties}
    >
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={`${label} logo`}
          className="w-8 h-8 rounded"
          loading="lazy"
          crossOrigin="anonymous"
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
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-foreground truncate" title={label}>{label}</div>
        <div className="mt-1">
          <span className="inline-flex items-center px-2 py-[2px] rounded-full text-[10px]" style={{ backgroundColor: pillBg, color: colorHex }}>
            {category}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ToolNode;

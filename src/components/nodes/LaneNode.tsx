import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { ChevronDown, ChevronUp } from 'lucide-react';

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const bigint = parseInt(h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const LaneNode: React.FC<NodeProps> = ({ data }) => {
  const d = (data || {}) as { label?: string; width?: number; height?: number; colorHex?: string; count?: number; collapsed?: boolean; onToggle?: () => void };
  const width = d.width ?? 1600;
  const height = d.height ?? 120;
  const label = d.label ?? '';
  const colorHex = d.colorHex ?? '#94A3B8';
  const tint = hexToRgba(colorHex, 0.02); // gentle tint

  return (
    <div className="rounded-md border relative overflow-visible" style={{ width, height, background: tint }}>
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-3 py-2 bg-card/80 backdrop-blur rounded-t-md"
        style={{ borderBottom: '1px solid hsl(var(--border))' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">{label}</span>
          <span className="inline-flex items-center text-[10px] px-2 py-[1px] rounded-full" style={{ backgroundColor: hexToRgba(colorHex, 0.12), color: colorHex }}>
            {d.count ?? 0}
          </span>
        </div>
        <button onClick={d.onToggle} className="text-xs text-muted-foreground hover:text-foreground" aria-label={d.collapsed ? 'Expand lane' : 'Collapse lane'}>
          {d.collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default LaneNode;

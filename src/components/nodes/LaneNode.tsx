import React from 'react';
import type { NodeProps } from '@xyflow/react';

export const LaneNode: React.FC<NodeProps> = ({ data }) => {
  const d = (data || {}) as { label?: string; width?: number; height?: number; color?: string };
  const width = d.width ?? 1600;
  const height = d.height ?? 120;
  const label = d.label ?? '';
  const bg = d.color || undefined;

  return (
    <div
      className="rounded-md border"
      style={{ width, height, background: bg ? bg : undefined }}
    >
      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">
        {label}
      </div>
    </div>
  );
};

export default LaneNode;

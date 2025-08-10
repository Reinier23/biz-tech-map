import React from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useStore } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

const LabeledEdge: React.FC<EdgeProps> = (props) => {
  const { id, label, style, markerEnd } = props;
  const [edgePath, labelX, labelY] = getBezierPath(props as any);
  const zoom = useStore((s) => s.transform[2]);

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ stroke: '#CBD5E1', strokeWidth: 2, ...(style || {}) }} markerEnd={markerEnd} />
      {label && zoom >= 0.5 && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan"
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
              fontSize: 10,
              color: 'hsl(var(--muted-foreground))',
              background: 'hsl(var(--card) / 0.8)',
              backdropFilter: 'blur(4px)',
              padding: '2px 6px',
              borderRadius: 6,
              border: '1px solid hsl(var(--border))',
            }}
          >
            {String(label)}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default React.memo(LabeledEdge);

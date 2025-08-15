import React, { useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useStore } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

const LabeledEdge: React.FC<EdgeProps> = (props) => {
  const { id, style, markerEnd } = props;
  const [edgePath, labelX, labelY] = getSmoothStepPath(props);
  const zoom = useStore((s) => s.transform[2]);
  const [hovered, setHovered] = useState(false);
  const labelText = props.data?.label ?? props.label;

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={{ stroke: '#CBD5E1', strokeWidth: hovered ? 3 : 2, filter: hovered ? 'drop-shadow(0 0 6px rgba(148,163,184,0.6))' : undefined, transition: 'stroke-width 120ms ease', ...(style || {}) }} markerEnd={markerEnd} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} />
      {labelText && zoom >= 0.5 && (
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
            {String(labelText)}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default React.memo(LabeledEdge);

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { EdgeProps, getSmoothStepPath, BaseEdge } from '@xyflow/react';
import { DataFlowEdge as DataFlowEdgeType } from './utils/flowTypes';
import { FLOW_TYPE_STYLES, EDGE_THICKNESS } from './utils/flowStyles';

interface DataFlowEdgeProps extends EdgeProps {
  data: DataFlowEdgeType['data'];
  isFocused?: boolean;
  isHighlighted?: boolean;
}

export const DataFlowEdge: React.FC<DataFlowEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  isFocused = false,
  isHighlighted = false
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Get styling based on flow type
  const flowStyle = useMemo(() => {
    const style = FLOW_TYPE_STYLES[data.flowType] || FLOW_TYPE_STYLES.existing;
    const thickness = EDGE_THICKNESS[data.thickness] || EDGE_THICKNESS.medium;
    
    return {
      stroke: style.color,
      strokeWidth: thickness,
      strokeDasharray: style.pattern === 'solid' ? undefined : 
                      style.pattern === 'dashed' ? '5,5' : '2,2',
      opacity: isFocused ? 0.3 : isHighlighted ? 1 : 0.6
    };
  }, [data.flowType, data.thickness, isFocused, isHighlighted]);

  // Calculate stroke width based on data volume
  const strokeWidth = useMemo(() => {
    const baseWidth = flowStyle.strokeWidth;
    if (data.datasets && data.datasets.length > 0) {
      const volume = data.datasets.length;
      const scale = 0.5;
      return Math.min(Math.max(1, volume * scale), 6);
    }
    return baseWidth;
  }, [data.datasets, flowStyle.strokeWidth]);

  // Edge label
  const edgeLabel = useMemo(() => {
    if (!data.datasets || data.datasets.length === 0) return null;
    return data.datasets.join(", ");
  }, [data.datasets]);

  // Arrow markers
  const arrowMarker = useMemo(() => {
    const style = FLOW_TYPE_STYLES[data.flowType] || FLOW_TYPE_STYLES.existing;
    return {
      type: style.arrowStyle === 'filled' ? 'arrowclosed' : 'arrow',
      color: style.color
    };
  }, [data.flowType]);

  return (
    <>
      {/* Main edge path */}
      <motion.path
        id={id}
        d={edgePath}
        stroke={flowStyle.stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={flowStyle.strokeDasharray}
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ 
          pathLength: 1, 
          opacity: flowStyle.opacity 
        }}
        transition={{ 
          duration: 0.5, 
          ease: "easeInOut" 
        }}
        className="react-flow__edge-path"
      />

      {/* Edge label */}
      {edgeLabel && (
        <motion.text
          x={labelX}
          y={labelY}
          className="text-xs font-medium pointer-events-none select-none"
          textAnchor="middle"
          dominantBaseline="middle"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: isFocused ? 0.3 : isHighlighted ? 1 : 0.7,
            scale: 1 
          }}
          transition={{ duration: 0.2 }}
          style={{
            fill: flowStyle.stroke,
            fontSize: '10px',
            fontWeight: 500
          }}
        >
          {edgeLabel}
        </motion.text>
      )}

      {/* Directional arrows */}
      {data.direction === 'bidirectional' ? (
        <>
          {/* Source arrow */}
          <motion.path
            d={`M ${sourceX - 10} ${sourceY - 10} L ${sourceX} ${sourceY} L ${sourceX - 10} ${sourceY + 10}`}
            stroke={flowStyle.stroke}
            strokeWidth={strokeWidth}
            fill="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: flowStyle.opacity }}
            transition={{ duration: 0.3, delay: 0.2 }}
          />
          {/* Target arrow */}
          <motion.path
            d={`M ${targetX + 10} ${targetY - 10} L ${targetX} ${targetY} L ${targetX + 10} ${targetY + 10}`}
            stroke={flowStyle.stroke}
            strokeWidth={strokeWidth}
            fill="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: flowStyle.opacity }}
            transition={{ duration: 0.3, delay: 0.2 }}
          />
        </>
      ) : (
        // Unidirectional arrow
        <motion.path
          d={`M ${targetX + 10} ${targetY - 10} L ${targetX} ${targetY} L ${targetX + 10} ${targetY + 10}`}
          stroke={flowStyle.stroke}
          strokeWidth={strokeWidth}
          fill="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: flowStyle.opacity }}
          transition={{ duration: 0.3, delay: 0.2 }}
        />
      )}

      {/* Reliability indicator */}
      {data.reliability && data.reliability < 0.9 && (
        <motion.circle
          cx={labelX}
          cy={labelY - 15}
          r="3"
          fill={data.reliability > 0.7 ? '#F59E0B' : '#EF4444'}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        />
      )}
    </>
  );
};

export default DataFlowEdge;

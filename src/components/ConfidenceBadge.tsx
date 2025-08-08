import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ConfidenceBadgeProps {
  confidence?: number;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence }) => {
  if (confidence === undefined) return null;

  const strong = confidence >= 80;
  const moderate = confidence >= 50 && confidence < 80;

  const cls = strong
    ? 'border-primary text-primary'
    : moderate
    ? 'border-foreground text-foreground'
    : 'border-muted-foreground text-muted-foreground';

  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 ${cls}`} aria-label={`AI confidence ${confidence}%`}>
      AI {Math.round(confidence)}%
    </Badge>
  );
};

export default ConfidenceBadge;

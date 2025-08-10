import React from 'react';
import type { NodeProps } from '@xyflow/react';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GhostData {
  label: string;
  hint: string;
  query: string;
  onAdd?: (name: string, category?: string) => void;
  suggestedName?: string;
  suggestedCategory?: string;
}

export const GhostNode: React.FC<NodeProps<GhostData>> = ({ data }) => {
  const d = data;
  const navigate = useNavigate();

  const handleSearch = () => {
    try {
      window.dispatchEvent(new CustomEvent('toolsearch:prefill', { detail: d.query || d.suggestedName || '' }));
    } catch {}
    navigate('/add-tools');
  };

  const handleAdd = () => {
    d.onAdd?.(d.suggestedName || d.query, d.suggestedCategory);
  };

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg border border-dashed bg-card/60 w-[200px] h-[72px]">
      <div className="w-8 h-8 rounded border flex items-center justify-center text-muted-foreground">
        <Plus className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-muted-foreground truncate" title={d.label}>{d.label}</div>
        <div className="text-[10px] text-muted-foreground/80 truncate" title={d.hint}>{d.hint}</div>
        <div className="mt-1 flex gap-2">
          <button className="text-[10px] px-2 py-[2px] rounded border" onClick={handleAdd}>Add</button>
          <button className="text-[10px] px-2 py-[2px] rounded border" onClick={handleSearch}><Search className="inline w-3 h-3 mr-1"/>Search</button>
        </div>
      </div>
    </div>
  );
};

export default GhostNode;

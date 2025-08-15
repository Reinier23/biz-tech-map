import React, { createContext, useContext, useState, ReactNode } from 'react';
import { logAudit } from '@/lib/audit';

export interface Tool {
  id: string;
  name: string;
  category: string;
  confirmedCategory?: string; // User's confirmed category choice
  description: string;
  logoUrl?: string;
  confidence?: number;
  manualRecommendation?: "Replace" | "Evaluate" | "Keep"; // User's manual override
}

interface ToolsContextType {
  tools: Tool[];
  setTools: (tools: Tool[]) => void;
  addTool: (tool: Tool) => void;
  updateTool: (id: string, updatedTool: Partial<Tool>) => void;
  removeTool: (id: string) => void;
}

const ToolsContext = createContext<ToolsContextType | undefined>(undefined);

export const useTools = () => {
  const context = useContext(ToolsContext);
  if (!context) {
    throw new Error('useTools must be used within a ToolsProvider');
  }
  return context;
};

interface ToolsProviderProps {
  children: ReactNode;
  initialTools?: Tool[];
  readOnly?: boolean;
}

export const ToolsProvider: React.FC<ToolsProviderProps> = ({ children, initialTools, readOnly }) => {
  const [tools, setToolsState] = useState<Tool[]>(initialTools || []);

  const setTools = (next: Tool[]) => {
    if (readOnly) return;
    setToolsState(next);
  };

  const addTool = (tool: Tool) => {
    if (readOnly) return;
    setToolsState(prev => [...prev, tool]);
    // Fire-and-forget audit
    void logAudit('tool_added', { id: tool.id, name: tool.name, category: tool.category }).catch(() => {});
  };

  const updateTool = (id: string, updatedTool: Partial<Tool>) => {
    if (readOnly) return;
    setToolsState(prev => prev.map(tool => 
      tool.id === id ? { ...tool, ...updatedTool } : tool
    ));
  };

  const removeTool = (id: string) => {
    if (readOnly) return;
    setToolsState(prev => prev.filter(tool => tool.id !== id));
    const removed = tools.find(t => t.id === id);
    void logAudit('tool_removed', { id, name: removed?.name, category: removed?.category }).catch(() => {});
  };

  const value: ToolsContextType = {
    tools,
    setTools,
    addTool,
    updateTool,
    removeTool,
  };

  return (
    <ToolsContext.Provider value={value}>
      {children}
    </ToolsContext.Provider>
  );
};

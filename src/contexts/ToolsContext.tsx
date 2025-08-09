import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Tool {
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

  const setTools = (next: Tool[] | ((prev: Tool[]) => Tool[])) => {
    if (readOnly) return;
    setToolsState(typeof next === 'function' ? (next as (prev: Tool[]) => Tool[])(tools) : next);
  };

  const addTool = (tool: Tool) => {
    if (readOnly) return;
    setToolsState(prev => [...prev, tool]);
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
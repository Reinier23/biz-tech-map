import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  logoUrl?: string;
  confidence?: number;
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
}

export const ToolsProvider: React.FC<ToolsProviderProps> = ({ children }) => {
  const [tools, setTools] = useState<Tool[]>([]);

  const addTool = (tool: Tool) => {
    setTools(prev => [...prev, tool]);
  };

  const updateTool = (id: string, updatedTool: Partial<Tool>) => {
    setTools(prev => prev.map(tool => 
      tool.id === id ? { ...tool, ...updatedTool } : tool
    ));
  };

  const removeTool = (id: string) => {
    setTools(prev => prev.filter(tool => tool.id !== id));
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
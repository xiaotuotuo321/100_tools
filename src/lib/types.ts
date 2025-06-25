export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  path: string;
  tags: string[];
  featured?: boolean;
}

export interface ToolCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tools: Tool[];
}

export interface ToolStats {
  toolId: string;
  usageCount: number;
  lastUsed: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  favorites: string[];
  recentTools: string[];
  stats: ToolStats[];
} 
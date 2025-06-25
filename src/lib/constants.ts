export const SITE_CONFIG = {
  name: "100+ 工具集合",
  description: "一个包含100+实用工具的现代化Web应用",
  url: "https://100tools.vercel.app",
  ogImage: "https://100tools.vercel.app/og.jpg",
  author: {
    name: "工具集合团队",
    url: "https://github.com/toolsTeam",
  },
}

export const TOOL_CATEGORIES = {
  TEXT_TOOLS: 'text-tools',
  DEVELOPER_TOOLS: 'developer-tools',
  IMAGE_TOOLS: 'image-tools',
  MATH_TOOLS: 'math-tools',
  LIFE_TOOLS: 'life-tools',
  ENTERTAINMENT_TOOLS: 'entertainment-tools',
  STUDY_TOOLS: 'study-tools',
  NETWORK_TOOLS: 'network-tools',
} as const

export const THEME_COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
}

export const LOCAL_STORAGE_KEYS = {
  FAVORITES: 'tool-favorites',
  RECENT_TOOLS: 'recent-tools',
  USER_STATS: 'user-stats',
  THEME: 'theme-preference',
}

export const MAX_RECENT_TOOLS = 10
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB 
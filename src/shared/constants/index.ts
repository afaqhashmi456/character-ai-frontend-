// API base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  USERS: {
    LIST: '/users',
    GET: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
  PERSONALITIES: {
    LIST: (userId: string) => `/users/${userId}/personalities`,
    GET: (userId: string, id: string) => `/users/${userId}/personalities/${id}`,
    CREATE: (userId: string) => `/users/${userId}/personalities`,
    UPDATE: (userId: string, id: string) => `/users/${userId}/personalities/${id}`,
    DELETE: (userId: string, id: string) => `/users/${userId}/personalities/${id}`,
  },
  CHAT: {
    SEND: '/chat/message',
    HISTORY: '/chat/history',
    CLEAR: '/chat/history',
  },
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CHAT: '/chat',
  ADMIN: {
    USERS: '/admin/users',
    PERSONALITIES: '/admin/personalities',
  },
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

// Message types
export const MESSAGE_TYPES = {
  USER: 'user',
  AI: 'ai',
  SYSTEM: 'system',
} as const;
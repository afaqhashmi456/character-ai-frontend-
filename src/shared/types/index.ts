// User roles
export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// Personality trait interface
export interface PersonalityTrait {
  id: string;
  userId: string;
  trait: string;
  description: string;
  examples?: string[];
  createdAt: string;
  updatedAt: string;
}

// Chat message interface
export interface ChatMessage {
  id: string;
  content: string;
  response?: string;
  createdAt: string;
}

// API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth tokens
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Register data
export interface RegisterData {
  email: string;
  password: string;
  name: string;
}
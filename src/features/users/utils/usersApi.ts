import axiosInstance from '@/lib/api/axios.config';
import { API_ENDPOINTS } from '@/shared/constants';
import type { User } from '@/shared/types';

export const usersApi = {
  // Get all users
  async getAll(): Promise<User[]> {
    const response = await axiosInstance.get(API_ENDPOINTS.USERS.LIST);
    return response.data;
  },

  // Get one user
  async getOne(id: string): Promise<User> {
    const response = await axiosInstance.get(API_ENDPOINTS.USERS.GET(id));
    return response.data;
  },

  // Create user
  async create(data: {
    email: string;
    password: string;
    name: string;
    role?: 'ADMIN' | 'MEMBER';
  }): Promise<User> {
    const response = await axiosInstance.post(API_ENDPOINTS.USERS.CREATE, data);
    return response.data;
  },

  // Update user
  async update(
    id: string,
    data: {
      email?: string;
      password?: string;
      name?: string;
      role?: 'ADMIN' | 'MEMBER';
    }
  ): Promise<User> {
    const response = await axiosInstance.patch(API_ENDPOINTS.USERS.UPDATE(id), data);
    return response.data;
  },

  // Delete user
  async delete(id: string): Promise<{ message: string }> {
    const response = await axiosInstance.delete(API_ENDPOINTS.USERS.DELETE(id));
    return response.data;
  },
};
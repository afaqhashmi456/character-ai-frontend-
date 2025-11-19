import axiosInstance from '@/lib/api/axios.config';
import { API_ENDPOINTS } from '@/shared/constants';
import type { PersonalityTrait } from '@/shared/types';

export const personalitiesApi = {
  // Get all personalities for a user
  async getAll(userId: string): Promise<PersonalityTrait[]> {
    const response = await axiosInstance.get(API_ENDPOINTS.PERSONALITIES.LIST(userId));
    return response.data;
  },

  // Get one personality
  async getOne(userId: string, id: string): Promise<PersonalityTrait> {
    const response = await axiosInstance.get(API_ENDPOINTS.PERSONALITIES.GET(userId, id));
    return response.data;
  },

  // Create personality
  async create(
    userId: string,
    data: {
      trait: string;
      description: string;
      examples?: string[];
    }
  ): Promise<PersonalityTrait> {
    const response = await axiosInstance.post(
      API_ENDPOINTS.PERSONALITIES.CREATE(userId),
      data
    );
    return response.data;
  },

  // Update personality
  async update(
    userId: string,
    id: string,
    data: {
      trait?: string;
      description?: string;
      examples?: string[];
    }
  ): Promise<PersonalityTrait> {
    const response = await axiosInstance.patch(
      API_ENDPOINTS.PERSONALITIES.UPDATE(userId, id),
      data
    );
    return response.data;
  },

  // Delete personality
  async delete(userId: string, id: string): Promise<{ message: string }> {
    const response = await axiosInstance.delete(
      API_ENDPOINTS.PERSONALITIES.DELETE(userId, id)
    );
    return response.data;
  },
};
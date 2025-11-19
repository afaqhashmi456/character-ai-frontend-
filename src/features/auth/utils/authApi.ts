import axiosInstance from '@/lib/api/axios.config';
import { API_ENDPOINTS } from '@/shared/constants';
import { LoginCredentials, RegisterData, User, AuthTokens, ApiResponse } from '@/shared/types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await axiosInstance.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    return response.data.data!;
  },

  register: async (data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> => {
    const response = await axiosInstance.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    return response.data.data!;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME);
    return response.data.data!;
  },

  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const response = await axiosInstance.post<ApiResponse<AuthTokens>>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );
    return response.data.data!;
  },
};
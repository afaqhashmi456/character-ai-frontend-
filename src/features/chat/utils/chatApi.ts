import axiosInstance from '@/lib/api/axios.config';
import { API_ENDPOINTS } from '@/shared/constants';
import { ChatMessage } from '@/shared/types';

export const chatApi = {
  sendMessage: async (content: string): Promise<ChatMessage> => {
    const response = await axiosInstance.post<ChatMessage>(
      API_ENDPOINTS.CHAT.SEND,
      { content }
    );
    return response.data;
  },

  getHistory: async (): Promise<ChatMessage[]> => {
    const response = await axiosInstance.get<ChatMessage[]>(
      API_ENDPOINTS.CHAT.HISTORY
    );
    return response.data;
  },

  clearHistory: async (): Promise<void> => {
    await axiosInstance.delete(API_ENDPOINTS.CHAT.CLEAR);
  },
};
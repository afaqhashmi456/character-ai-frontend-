import apiClient from './axios.config';

export interface Conversation {
  id: string;
  title: string;
  messageCount: number;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationDetail extends Omit<Conversation, 'messageCount' | 'lastMessage' | 'lastMessageAt'> {
  messages: Array<{
    id: string;
    content: string;
    response: string | null;
    createdAt: string;
  }>;
}

export interface CreateConversationDto {
  title?: string;
}

export interface UpdateConversationDto {
  title?: string;
}

export const conversationsApi = {
  /**
   * Get all conversations for the current user
   */
  getAll: async (): Promise<Conversation[]> => {
    const response = await apiClient.get<Conversation[]>('/conversations');
    return response.data;
  },

  /**
   * Get a single conversation with all messages
   */
  getOne: async (id: string): Promise<ConversationDetail> => {
    const response = await apiClient.get<ConversationDetail>(`/conversations/${id}`);
    return response.data;
  },

  /**
   * Create a new conversation
   */
  create: async (data: CreateConversationDto = {}): Promise<Conversation> => {
    const response = await apiClient.post<Conversation>('/conversations', data);
    return response.data;
  },

  /**
   * Update conversation title
   */
  update: async (id: string, data: UpdateConversationDto): Promise<Conversation> => {
    const response = await apiClient.patch<Conversation>(`/conversations/${id}`, data);
    return response.data;
  },

  /**
   * Delete a conversation
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/conversations/${id}`);
  },
};
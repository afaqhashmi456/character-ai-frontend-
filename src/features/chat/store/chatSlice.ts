import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage } from '@/shared/types';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  isTyping: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
      state.error = null;
    },
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
    updateMessage: (state, action: PayloadAction<{ id: string; response?: string; newId?: string; createdAt?: string }>) => {
      const messageIndex = state.messages.findIndex(m => m.id === action.payload.id);
      if (messageIndex !== -1) {
        const message = state.messages[messageIndex];
        if (action.payload.response !== undefined) {
          message.response = action.payload.response;
        }
        if (action.payload.newId) {
          message.id = action.payload.newId;
        }
        if (action.payload.createdAt) {
          message.createdAt = action.payload.createdAt;
        }
      }
    },
    clearMessages: (state) => {
      state.messages = [];
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
      state.isTyping = false;
    },
  },
});

export const {
  addMessage,
  setMessages,
  updateMessage,
  clearMessages,
  setLoading,
  setTyping,
  setError,
} = chatSlice.actions;

export default chatSlice.reducer;
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { conversationsApi, Conversation, ConversationDetail } from '@/lib/api/conversations.api';

interface ConversationsState {
  conversations: Conversation[];
  currentConversation: ConversationDetail | null;
  loading: boolean;
  error: string | null;
}

const initialState: ConversationsState = {
  conversations: [],
  currentConversation: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchConversations = createAsyncThunk(
  'conversations/fetchAll',
  async () => {
    const conversations = await conversationsApi.getAll();
    return conversations;
  }
);

export const fetchConversation = createAsyncThunk(
  'conversations/fetchOne',
  async (id: string) => {
    const conversation = await conversationsApi.getOne(id);
    return conversation;
  }
);

export const createConversation = createAsyncThunk(
  'conversations/create',
  async (title?: string) => {
    const conversation = await conversationsApi.create({ title });
    return conversation;
  }
);

export const updateConversationTitle = createAsyncThunk(
  'conversations/update',
  async ({ id, title }: { id: string; title: string }) => {
    const conversation = await conversationsApi.update(id, { title });
    return conversation;
  }
);

export const deleteConversation = createAsyncThunk(
  'conversations/delete',
  async (id: string) => {
    await conversationsApi.delete(id);
    return id;
  }
);

const conversationsSlice = createSlice({
  name: 'conversations',
  initialState,
  reducers: {
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch all conversations
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch conversations';
      });

    // Fetch single conversation
    builder
      .addCase(fetchConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentConversation = action.payload;
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch conversation';
      });

    // Create conversation
    builder
      .addCase(createConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations.unshift(action.payload);
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create conversation';
      });

    // Update conversation
    builder
      .addCase(updateConversationTitle.fulfilled, (state, action) => {
        const index = state.conversations.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.conversations[index] = { ...state.conversations[index], ...action.payload };
        }
        if (state.currentConversation?.id === action.payload.id) {
          state.currentConversation = { ...state.currentConversation, ...action.payload };
        }
      });

    // Delete conversation
    builder
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter(c => c.id !== action.payload);
        if (state.currentConversation?.id === action.payload) {
          state.currentConversation = null;
        }
      });
  },
});

export const { clearCurrentConversation, setError } = conversationsSlice.actions;
export default conversationsSlice.reducer;
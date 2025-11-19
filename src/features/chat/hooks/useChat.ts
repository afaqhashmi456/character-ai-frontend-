import { useCallback, useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  addMessage,
  setMessages,
  updateMessage,
  clearMessages as clearMessagesAction,
  setLoading,
  setTyping,
  setError,
} from '../store/chatSlice';
import { chatApi } from '../utils/chatApi';
import { STORAGE_KEYS } from '@/shared/constants';

export const useChat = () => {
  const dispatch = useAppDispatch();
  const { messages, isLoading, isTyping, error } = useAppSelector((state) => state.chat);

  // Load chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        dispatch(setLoading(true));
        const history = await chatApi.getHistory();
        dispatch(setMessages(history));
      } catch (err: any) {
        console.error('Failed to load chat history:', err);
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadHistory();
  }, [dispatch]);

  const sendMessage = useCallback(
    async (content: string) => {
      // Create temporary message ID
      const tempId = `temp-${Date.now()}`;
      
      // Optimistically add user message immediately (without response)
      const optimisticMessage = {
        id: tempId,
        content,
        response: '',
        createdAt: new Date().toISOString(),
      };
      
      dispatch(addMessage(optimisticMessage as any));
      dispatch(setTyping(true));
      
      try {
        // Get auth token from localStorage (stored by authSlice)
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        
        if (!token) {
          dispatch(setError('No authentication token found. Please log in again.'));
          dispatch(setMessages(messages.filter(m => m.id !== tempId)));
          dispatch(setTyping(false));
          return;
        }
        
        // Create EventSource for streaming
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/chat/message/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let streamedResponse = '';
        let messageId = tempId;

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.type === 'chunk') {
                    streamedResponse += data.content;
                    // Update message with streaming response
                    dispatch(updateMessage({
                      id: tempId,
                      response: streamedResponse
                    }));
                  } else if (data.type === 'done') {
                    // Replace temp ID with real ID
                    messageId = data.messageId;
                    dispatch(updateMessage({
                      id: tempId,
                      newId: messageId,
                      createdAt: data.createdAt
                    }));
                  } else if (data.type === 'error') {
                    dispatch(setError(data.message));
                    dispatch(setMessages(messages.filter(m => m.id !== tempId)));
                  }
                } catch (e) {
                  // Ignore parse errors for incomplete chunks
                }
              }
            }
          }
        }
      } catch (err: any) {
        const message = err.response?.data?.message || 'Failed to send message';
        dispatch(setError(message));
        // Remove the optimistic message on error
        dispatch(setMessages(messages.filter(m => m.id !== tempId)));
      } finally {
        dispatch(setTyping(false));
      }
    },
    [dispatch, messages]
  );

  const clearHistory = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      await chatApi.clearHistory();
      dispatch(clearMessagesAction());
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to clear history';
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  return {
    messages,
    isLoading,
    isTyping,
    error,
    sendMessage,
    clearHistory,
  };
};
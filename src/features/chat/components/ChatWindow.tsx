import { useEffect, useRef, useState } from 'react';
import { useChat } from '../hooks/useChat';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Toast } from '@/shared/components/Toast';
import { Sidebar } from './Sidebar';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchConversation } from '@/lib/store/slices/conversationsSlice';
import { setMessages } from '../store/chatSlice';

export const ChatWindow = () => {
  const { messages, isTyping, sendMessage, error } = useChat();
  const { user, logout } = useAuth();
  const dispatch = useAppDispatch();
  const { currentConversation } = useAppSelector((state) => state.conversations);
  const [input, setInput] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (error) {
      // Check if it's a rate limit error
      if (error.includes('Rate limit') || error.includes('429') || error.includes('Too Many Requests')) {
        setToast({
          message: '⏱️ Rate limit reached! Please wait 30-60 seconds before sending another message.',
          type: 'warning'
        });
      } else {
        setToast({
          message: error,
          type: 'error'
        });
      }
    }
  }, [error]);

  const handleSelectConversation = async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    try {
      const conversation = await dispatch(fetchConversation(conversationId)).unwrap();
      // Convert null to undefined for response field
      const messages = conversation.messages.map(msg => ({
        ...msg,
        response: msg.response ?? undefined
      }));
      dispatch(setMessages(messages));
    } catch (error) {
      console.error('Failed to load conversation:', error);
      setToast({
        message: 'Failed to load conversation',
        type: 'error'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const messageToSend = input;
    setInput(''); // Clear input immediately
    await sendMessage(messageToSend);
  };

  return (
    <div className="flex h-screen bg-[#0A0A0A]">
      {/* Sidebar */}
      <Sidebar
        onSelectConversation={handleSelectConversation}
        currentConversationId={currentConversationId}
      />

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Header */}
      <div className="bg-[#0A0A0A] border-b border-white/10 px-6 py-3 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-base font-semibold text-white">
                Team Fun AI
              </h1>
              <p className="text-xs text-gray-400">
                {user?.name}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-lg font-semibold text-white mb-2">Start a conversation</h3>
              <p className="text-sm text-gray-500">Send a message to begin</p>
            </div>
          ) : (
            messages.map((message) => {
              const isPending = !message.response && message.id.startsWith('temp-');
              
              return (
                <div key={message.id} className="space-y-6">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="group relative">
                      <div className={`bg-[#2F2F2F] text-white rounded-full px-6 py-3 ${isPending ? 'opacity-60' : 'opacity-100'}`}>
                        <p className="text-sm font-medium">{message.content}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI response */}
                  {message.response && (
                    <div className="flex justify-start">
                      <div className="group relative max-w-2xl">
                        <p className="text-[15px] text-gray-200 leading-relaxed whitespace-pre-wrap">{message.response}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-[#0A0A0A] border-t border-white/10 px-6 py-4 sticky bottom-0">
        <div>
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Team Fun AI..."
              className="w-full px-5 py-4 pr-12 bg-[#2F2F2F] border-0 rounded-3xl focus:outline-none focus:ring-1 focus:ring-white/20 text-[15px] text-white placeholder-gray-500 transition-all"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white hover:bg-gray-200 text-black rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
};
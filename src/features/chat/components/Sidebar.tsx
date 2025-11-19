import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import {
  fetchConversations,
  createConversation,
  deleteConversation,
  clearCurrentConversation,
} from '@/lib/store/slices/conversationsSlice';
import { clearMessages } from '../store/chatSlice';
import { ConfirmModal } from '@/shared/components/ConfirmModal';

interface SidebarProps {
  onSelectConversation: (conversationId: string) => void;
  currentConversationId?: string;
}

export const Sidebar = ({ onSelectConversation, currentConversationId }: SidebarProps) => {
  const dispatch = useAppDispatch();
  const { conversations, loading } = useAppSelector((state) => state.conversations);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; conversationId: string | null; title: string }>({
    isOpen: false,
    conversationId: null,
    title: '',
  });

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const handleNewChat = async () => {
    setIsCreating(true);
    try {
      const result = await dispatch(createConversation()).unwrap();
      dispatch(clearCurrentConversation());
      dispatch(clearMessages());
      onSelectConversation(result.id);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClick = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      conversationId: id,
      title,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.conversationId) return;

    try {
      await dispatch(deleteConversation(deleteModal.conversationId)).unwrap();
      if (currentConversationId === deleteModal.conversationId) {
        dispatch(clearCurrentConversation());
        dispatch(clearMessages());
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    } finally {
      setDeleteModal({ isOpen: false, conversationId: null, title: '' });
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, conversationId: null, title: '' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <>
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Conversation"
        message={`Are you sure you want to delete "${deleteModal.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      <div className="w-64 bg-[#0A0A0A] border-r border-white/10 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <button
          onClick={handleNewChat}
          disabled={isCreating}
          className="w-full px-3 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm border border-white/10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {isCreating ? 'Creating...' : 'New Chat'}
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading && conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin w-5 h-5 border-2 border-white/20 border-t-blue-500 rounded-full mx-auto"></div>
            <p className="mt-2 text-xs">Loading...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-xs">No conversations</p>
            <p className="text-xs mt-0.5">Start a new chat</p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition-all group relative ${
                currentConversationId === conversation.id
                  ? 'bg-white/10 border border-white/20'
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-sm truncate">
                    {conversation.title}
                  </h3>
                  {conversation.lastMessage && (
                    <p className="text-gray-400 text-xs truncate mt-1">
                      {conversation.lastMessage}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-gray-500 text-xs">
                      {conversation.messageCount} msg
                    </span>
                    {conversation.lastMessageAt && (
                      <>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-500 text-xs">
                          {formatDate(conversation.lastMessageAt)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteClick(conversation.id, conversation.title, e)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded-lg transition-all"
                  title="Delete conversation"
                >
                  <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10">
        <div className="text-xs text-gray-500 text-center">
          {conversations.length} {conversations.length === 1 ? 'chat' : 'chats'}
        </div>
      </div>
    </div>
    </>
  );
};
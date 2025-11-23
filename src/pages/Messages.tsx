import { useState, useEffect, useRef } from 'react';
import { Send, Plus, ArrowLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { conversationApi } from '../api/conversations';
import { useNavigate } from 'react-router-dom';

interface Message {
    id: string;
    content: string;
    created_at: string;
    sender: {
        id: string;
        name: string;
        avatar: string;
    };
}

interface Conversation {
    id: string;
    participants: Array<{
        id: string;
        name: string;
        avatar: string;
    }>;
    lastMessage?: Message;
    messages?: Message[];
    unreadCount?: number;
    updated_at: string;
}

export const Messages = () => {
    const navigate = useNavigate();
    const { currentUser, users } = useStore();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messageText, setMessageText] = useState('');
    const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Redirect non-authenticated users
    useEffect(() => {
        if (!currentUser) {
            navigate('/login?redirect=/messages');
        }
    }, [currentUser, navigate]);

    // Load conversations
    useEffect(() => {
        loadConversations();
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [selectedConversation?.messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadConversations = async () => {
        try {
            const data = await conversationApi.getAll();
            setConversations(data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading conversations:', error);
            setLoading(false);
        }
    };

    const loadConversation = async (conversationId: string) => {
        try {
            const data = await conversationApi.getById(conversationId);
            setSelectedConversation(data);
            // Update conversation in list to mark as read
            setConversations(prev =>
                prev.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c)
            );
        } catch (error) {
            console.error('Error loading conversation:', error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim() || !selectedConversation) return;

        try {
            const newMessage = await conversationApi.sendMessage(selectedConversation.id, messageText);
            setSelectedConversation(prev => prev ? {
                ...prev,
                messages: [...(prev.messages || []), newMessage]
            } : null);
            setMessageText('');
            loadConversations(); // Refresh list to update last message
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        }
    };

    const handleStartNewConversation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserId) return;

        try {
            console.log('Creating conversation with user:', selectedUserId);
            const newConversation = await conversationApi.create([selectedUserId]);
            console.log('Conversation created:', newConversation);

            // Close modal first
            setIsNewConversationModalOpen(false);
            setSelectedUserId('');

            // Wait for RLS policies to catch up after service role insert
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Reload conversations to get the new one
            await loadConversations();

            // Wait a bit more before loading specific conversation
            await new Promise(resolve => setTimeout(resolve, 300));

            // Load the specific conversation
            console.log('Loading conversation:', newConversation.id);
            await loadConversation(newConversation.id);
        } catch (error) {
            console.error('Error creating conversation:', error);
            alert('Failed to create conversation. Please try again.');
        }
    };

    const getOtherParticipant = (conv: Conversation) => {
        return conv.participants.find(p => p.id !== currentUser?.id);
    };

    const availableUsers = users.filter(u =>
        u.id !== currentUser?.id &&
        !conversations.some(c => c.participants.some(p => p.id === u.id))
    );

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">Loading messages...</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
                <div className="flex h-full">
                    {/* Conversations List */}
                    <div className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                            <button
                                onClick={() => setIsNewConversationModalOpen(true)}
                                className="p-2 text-brand-primary hover:bg-brand-light rounded-full"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {conversations.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    No conversations yet. Start a new conversation!
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {conversations.map(conv => {
                                        const other = getOtherParticipant(conv);
                                        return (
                                            <li
                                                key={conv.id}
                                                onClick={() => loadConversation(conv.id)}
                                                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${selectedConversation?.id === conv.id ? 'bg-brand-light' : ''}`}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <img
                                                        src={other?.avatar || '/default-avatar.png'}
                                                        alt={other?.name}
                                                        className="h-12 w-12 rounded-full object-cover"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-baseline">
                                                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                                                {other?.name || 'Unknown User'}
                                                            </h3>
                                                            <span className="text-xs text-gray-500">
                                                                {conv.lastMessage && new Date(conv.lastMessage.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 truncate">
                                                            {conv.lastMessage?.content || 'No messages yet'}
                                                        </p>
                                                        {(conv.unreadCount || 0) > 0 && (
                                                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-brand-primary rounded-full">
                                                                {conv.unreadCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Message Thread */}
                    <div className={`flex-1 flex flex-col ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
                        {selectedConversation ? (
                            <>
                                {/* Header */}
                                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center space-x-3">
                                    <button
                                        onClick={() => setSelectedConversation(null)}
                                        className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </button>
                                    <img
                                        src={getOtherParticipant(selectedConversation)?.avatar || '/default-avatar.png'}
                                        alt={getOtherParticipant(selectedConversation)?.name}
                                        className="h-10 w-10 rounded-full object-cover"
                                    />
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {getOtherParticipant(selectedConversation)?.name || 'Unknown User'}
                                    </h3>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {selectedConversation.messages?.map(msg => {
                                        const isCurrentUser = msg.sender.id === currentUser?.id;
                                        return (
                                            <div key={msg.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-900'} rounded-lg px-4 py-2`}>
                                                    {!isCurrentUser && (
                                                        <p className="text-xs font-medium mb-1">{msg.sender.name}</p>
                                                    )}
                                                    <p className="text-sm">{msg.content}</p>
                                                    <p className={`text-xs mt-1 ${isCurrentUser ? 'text-white/70' : 'text-gray-500'}`}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-gray-50">
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                            placeholder="Type a message..."
                                            className="flex-1 rounded-full border-gray-300 focus:ring-brand-primary focus:border-brand-primary"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!messageText.trim()}
                                            className="p-3 bg-brand-primary text-white rounded-full hover:bg-brand-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send className="h-5 w-5" />
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500">
                                Select a conversation to start messaging
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* New Conversation Modal */}
            {isNewConversationModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" onClick={() => setIsNewConversationModalOpen(false)}>
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Start New Conversation</h3>
                            <form onSubmit={handleStartNewConversation}>
                                <select
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="w-full border-gray-300 rounded-md"
                                    required
                                >
                                    <option value="">Select a user...</option>
                                    {availableUsers.map(user => (
                                        <option key={user.id} value={user.id}>{user.name}</option>
                                    ))}
                                </select>
                                <div className="mt-4 flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsNewConversationModalOpen(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary"
                                    >
                                        Start Chat
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

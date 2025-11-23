import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../../services/gemini';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const Chatbot = () => {
    const { currentUser } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
        { text: "Hello! I'm your Akita breed expert. Ask me anything about Akitas!", isUser: false }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input;
        setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
        setInput('');
        setLoading(true);

        try {
            const response = await geminiService.askAkitaExpert(userMessage);
            setMessages(prev => [...prev, { text: response, isUser: false }]);
        } catch (error) {
            setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting right now.", isUser: false }]);
        } finally {
            setLoading(false);
        }
    };

    // Only show chatbot to logged-in users (after all hooks)
    if (!currentUser) {
        return null;
    }

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 bg-brand-primary text-white p-4 rounded-full shadow-lg hover:bg-brand-secondary transition-all z-50 ${isOpen ? 'hidden' : 'flex'}`}
            >
                <MessageCircle className="h-6 w-6" />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-lg shadow-xl z-50 flex flex-col max-h-[600px] border border-gray-200">
                    {/* Header */}
                    <div className="bg-brand-primary text-white p-4 rounded-t-lg flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <Bot className="h-5 w-5" />
                            <span className="font-medium">Akita Expert AI</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 h-96 bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.isUser
                                    ? 'bg-brand-primary text-white rounded-br-none'
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white text-gray-500 border border-gray-200 rounded-lg p-3 text-sm shadow-sm">
                                    Thinking...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about Akitas..."
                                className="flex-1 border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary text-sm"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="bg-brand-primary text-white p-2 rounded-md hover:bg-brand-secondary disabled:opacity-50"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </>
    );
};

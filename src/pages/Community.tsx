import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MessageSquare, Plus, Clock, Eye, X, Search, Pin, Tag, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthGate } from '../components/AuthGate';

export const Community = () => {
    const { threads, users, currentUser, addThread, categories, toggleThreadLike, toggleThreadPin } = useStore();
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'replies'>('latest');
    const [isNewThreadModalOpen, setIsNewThreadModalOpen] = useState(false);
    const [newThreadForm, setNewThreadForm] = useState({
        category: 'General',
        title: '',
        content: '',
        tags: ''
    });

    const allCategories = ['All', ...categories];

    // Filter by category
    let filteredThreads = activeCategory === 'All'
        ? threads
        : threads.filter(t => t.category === activeCategory);

    // Filter by search query
    if (searchQuery.trim()) {
        filteredThreads = filteredThreads.filter(t =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // Sort threads
    const sortedThreads = [...filteredThreads].sort((a, b) => {
        if (sortBy === 'latest') {
            return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
        } else if (sortBy === 'popular') {
            return b.views - a.views;
        } else { // replies
            return b.replies.length - a.replies.length;
        }
    });

    const getUser = (id: string) => users.find(u => u.id === id);

    const handleNewThreadClick = () => {
        setNewThreadForm({
            category: 'General',
            title: '',
            content: '',
            tags: ''
        });
        setIsNewThreadModalOpen(true);
    };

    const handleNewThreadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentUser && newThreadForm.title.trim() && newThreadForm.content.trim()) {
            addThread({
                authorId: currentUser.id,
                category: newThreadForm.category,
                title: newThreadForm.title,
                content: newThreadForm.content,
                tags: newThreadForm.tags.split(',').map(t => t.trim()).filter(Boolean)
            });
            setIsNewThreadModalOpen(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            {/* New Thread Modal */}
            {isNewThreadModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsNewThreadModalOpen(false)}></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Thread</h3>
                                    <button onClick={() => setIsNewThreadModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                                <form onSubmit={handleNewThreadSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Category *</label>
                                            <select
                                                required
                                                value={newThreadForm.category}
                                                onChange={(e) => setNewThreadForm({ ...newThreadForm, category: e.target.value })}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                            >
                                                {categories.filter(c => c !== 'All').map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Title *</label>
                                            <input
                                                type="text"
                                                required
                                                value={newThreadForm.title}
                                                onChange={(e) => setNewThreadForm({ ...newThreadForm, title: e.target.value })}
                                                placeholder="What's your topic?"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Content *</label>
                                            <textarea
                                                rows={6}
                                                required
                                                value={newThreadForm.content}
                                                onChange={(e) => setNewThreadForm({ ...newThreadForm, content: e.target.value })}
                                                placeholder="Share your thoughts..."
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
                                            <input
                                                type="text"
                                                value={newThreadForm.tags}
                                                onChange={(e) => setNewThreadForm({ ...newThreadForm, tags: e.target.value })}
                                                placeholder="health, diet, training"
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:mt-6">
                                        <button
                                            type="submit"
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-primary text-base font-medium text-white hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary sm:text-sm"
                                        >
                                            Create Thread
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Community Forums</h1>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search threads..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                        />
                    </div>
                    {/* Sort Dropdown */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'latest' | 'popular' | 'replies')}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                    >
                        <option value="latest">Latest Activity</option>
                        <option value="popular">Most Popular</option>
                        <option value="replies">Most Replies</option>
                    </select>
                    {/* New Thread Button */}
                    <AuthGate action="Start Discussions">
                        <button
                            onClick={handleNewThreadClick}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary whitespace-nowrap"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Thread
                        </button>
                    </AuthGate>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar Categories */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Categories</h3>
                        </div>
                        <nav className="p-2 space-y-1">
                            {allCategories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeCategory === category
                                        ? 'bg-brand-light text-brand-primary'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Thread List */}
                <div className="flex-1">
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                            {sortedThreads.map((thread: any) => {
                                const author = getUser(thread.authorId);
                                return (
                                    <li key={thread.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className={`flex items-start space-x-4 ${thread.isPinned ? 'bg-yellow-50 -mx-6 px-6 py-4 border-l-4 border-yellow-400' : ''}`}>
                                            <div className="flex-shrink-0">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${thread.isPinned ? 'bg-yellow-100 text-yellow-600' : 'bg-brand-light text-brand-primary'}`}>
                                                    {thread.isPinned ? <Pin className="h-5 w-5 transform rotate-45" /> : <MessageSquare className="h-6 w-6" />}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <p className="text-sm font-medium text-brand-primary truncate">
                                                            {thread.category}
                                                        </p>
                                                        {thread.tags && thread.tags.map((tag: string) => (
                                                            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                                <Tag className="h-3 w-3 mr-1" />
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                                                        <span className="flex items-center">
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            {thread.views}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Clock className="h-4 w-4 mr-1" />
                                                            {new Date(thread.lastActive).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Link to={`/community/thread/${thread.id}`} className="block mt-1">
                                                    <h3 className="text-lg font-medium text-gray-900 truncate">
                                                        {thread.isPinned && <span className="mr-2 text-yellow-500">[Pinned]</span>}
                                                        {thread.title}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-gray-500 truncate">{thread.content}</p>
                                                </Link>
                                                <div className="mt-2 flex items-center justify-between">
                                                    <div className="flex items-center text-xs text-gray-500">
                                                        <span>Posted by {author?.name || 'Unknown'}</span>
                                                        <span className="mx-2">•</span>
                                                        <span>{thread.replies.length} replies</span>
                                                    </div>
                                                    <div className="flex items-center space-x-4">
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                toggleThreadLike(thread.id);
                                                            }}
                                                            className={`flex items-center text-sm ${thread.userHasLiked ? 'text-brand-primary' : 'text-gray-400 hover:text-gray-500'}`}
                                                        >
                                                            <ThumbsUp className={`h-4 w-4 mr-1 ${thread.userHasLiked ? 'fill-current' : ''}`} />
                                                            {thread.likesCount || 0}
                                                        </button>
                                                        {currentUser?.role === 'moderator' && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    toggleThreadPin(thread.id);
                                                                }}
                                                                className={`flex items-center text-sm ${thread.isPinned ? 'text-yellow-600' : 'text-gray-400 hover:text-gray-500'}`}
                                                            >
                                                                <Pin className="h-4 w-4 mr-1" />
                                                                {thread.isPinned ? 'Unpin' : 'Pin'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                            {sortedThreads.length === 0 && (
                                <li className="p-6 text-center text-gray-500">
                                    {searchQuery ? 'No threads found matching your search.' : 'No threads found in this category.'}
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

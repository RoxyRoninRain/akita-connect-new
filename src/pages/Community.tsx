// src/pages/Community.tsx
import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, X, Search, Paperclip, ThumbsUp, Pin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthGate } from '../components/AuthGate';
import { ImageUpload } from '../components/common/ImageUpload';

export const Community = () => {
    const {
        threads,
        users,
        currentUser,
        addThread,
        categories,
        toggleThreadLike,
        toggleThreadPin,
    } = useStore();

    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'replies'>('latest');
    const [isNewThreadModalOpen, setIsNewThreadModalOpen] = useState(false);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [newThreadForm, setNewThreadForm] = useState({
        category: 'General',
        title: '',
        content: '',
        tags: '',
        images: [] as string[],
    });

    const allCategories = ['All', ...categories];

    // Filter threads by category
    let filteredThreads = activeCategory === 'All' ? threads : threads.filter(t => t.category === activeCategory);

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
        } else {
            return b.replies.length - a.replies.length;
        }
    });

    const getUser = (id: string) => users.find(u => u.id === id);

    const handleNewThreadClick = () => setIsNewThreadModalOpen(true);

    const handleNewThreadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentUser && newThreadForm.title.trim() && newThreadForm.content.trim()) {
            addThread({
                authorId: currentUser.id,
                category: newThreadForm.category,
                title: newThreadForm.title,
                content: newThreadForm.content,
                tags: newThreadForm.tags.split(',').map(t => t.trim()).filter(Boolean),
                images: newThreadForm.images,
            });
            setIsNewThreadModalOpen(false);
            setNewThreadForm({
                category: 'General',
                title: '',
                content: '',
                tags: '',
                images: [],
            });
            setShowImageUpload(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4">
            {/* New Thread Modal */}
            {isNewThreadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Create New Thread</h3>
                            <button onClick={() => setIsNewThreadModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleNewThreadSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Category *</label>
                                <select
                                    required
                                    value={newThreadForm.category}
                                    onChange={e => setNewThreadForm({ ...newThreadForm, category: e.target.value })}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                >
                                    {categories.filter(c => c !== 'All').map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={newThreadForm.title}
                                    onChange={e => setNewThreadForm({ ...newThreadForm, title: e.target.value })}
                                    placeholder="What's your topic?"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Content *</label>
                                <textarea
                                    rows={6}
                                    required
                                    value={newThreadForm.content}
                                    onChange={e => setNewThreadForm({ ...newThreadForm, content: e.target.value })}
                                    placeholder="Share your thoughts..."
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    value={newThreadForm.tags}
                                    onChange={e => setNewThreadForm({ ...newThreadForm, tags: e.target.value })}
                                    placeholder="health, diet, training"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Images</label>
                                <div className="flex items-center space-x-2 mb-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowImageUpload(!showImageUpload)}
                                        className="p-2 text-gray-500 hover:text-brand-primary hover:bg-gray-100 rounded-full transition-colors"
                                        title="Attach image"
                                    >
                                        <Paperclip className="h-5 w-5" />
                                    </button>
                                    {showImageUpload && (
                                        <ImageUpload
                                            uploadType="thread-image"
                                            onUploadSuccess={url => setNewThreadForm(prev => ({ ...prev, images: [...prev.images, url] }))}
                                        />
                                    )}
                                </div>
                                {newThreadForm.images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {newThreadForm.images.map((url, index) => (
                                            <div key={index} className="relative group">
                                                <img src={url} alt={`Upload ${index + 1}`} className="h-20 w-full object-cover rounded-md" />
                                                <button
                                                    type="button"
                                                    onClick={() => setNewThreadForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }))}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="mt-5">
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
            )}

            {/* Header */}
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
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                        />
                    </div>
                    {/* Sort Dropdown */}
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as 'latest' | 'popular' | 'replies')}
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

            {/* Main Content */}
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
                                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeCategory === category ? 'bg-brand-light text-brand-primary' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}`}
                                >
                                    {category}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Thread List */}
                <div className="flex-1">
                    {sortedThreads.map(thread => {
                        const author = getUser(thread.authorId);
                        return (
                            <div key={thread.id} className="bg-white shadow rounded-lg p-4 mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="text-lg font-semibold"><Link to={`/thread/${thread.id}`} className="text-brand-primary hover:underline">{thread.title}</Link></h2>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => toggleThreadLike(thread.id)} className="text-gray-500 hover:text-brand-primary">
                                            <ThumbsUp className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => toggleThreadPin(thread.id)} className="text-gray-500 hover:text-brand-primary">
                                            <Pin className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-700 mb-2">{thread.content}</p>
                                {thread.images && thread.images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                        {thread.images.map((url, idx) => (
                                            <img key={idx} src={url} alt={`Thread ${thread.id} image ${idx}`} className="h-20 w-full object-cover rounded-md" />
                                        ))}
                                    </div>
                                )}
                                <div className="text-sm text-gray-500">
                                    Posted by {author?.name || 'Unknown'} • {thread.createdAt ? new Date(thread.createdAt).toLocaleDateString() : 'Unknown Date'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, MessageSquare, Clock, Pin, Tag, ThumbsUp, Paperclip, X } from 'lucide-react';
import { ImageUpload } from '../components/common/ImageUpload';

export const ThreadDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { threads, users, addThreadReply, toggleThreadLike, toggleThreadPin, currentUser } = useStore();
    const [replyContent, setReplyContent] = useState('');
    const [replyImages, setReplyImages] = useState<string[]>([]);
    const [showImageUpload, setShowImageUpload] = useState(false);

    const thread = threads.find(t => t.id === id);
    const author = thread ? users.find(u => u.id === thread.authorId) : null;

    if (!thread) {
        return (
            <div className="max-w-3xl mx-auto p-4 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Thread not found</h2>
                <Link to="/community" className="text-brand-primary hover:underline mt-4 inline-block">
                    Return to Community
                </Link>
            </div>
        );
    }

    const getUser = (userId: string) => users.find(u => u.id === userId);

    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (replyContent.trim() && thread) {
            addThreadReply(thread.id, replyContent, replyImages);
            setReplyContent('');
            setReplyImages([]);
            setShowImageUpload(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4">
            <Link to="/community" className="inline-flex items-center text-gray-500 hover:text-brand-primary mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Forums
            </Link>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-light text-brand-primary">
                                {thread.category}
                            </span>
                            {thread.tags && thread.tags.map((tag: string) => (
                                <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(thread.lastActive).toLocaleDateString()}
                        </div>
                    </div>
                    <div className="mt-4 flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                {thread.isPinned && <Pin className="h-5 w-5 text-yellow-500 mr-2 transform rotate-45" />}
                                {thread.title}
                            </h1>
                            <div className="mt-2 flex items-center">
                                <img
                                    className="h-8 w-8 rounded-full object-cover mr-3"
                                    src={author?.avatar}
                                    alt={author?.name}
                                />
                                <span className="text-sm font-medium text-gray-900">Posted by {author?.name || 'Unknown'}</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => toggleThreadLike(thread.id)}
                                className={`flex items-center px-3 py-1 rounded-md text-sm font-medium ${thread.userHasLiked ? 'bg-brand-light text-brand-primary' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                <ThumbsUp className={`h-4 w-4 mr-2 ${thread.userHasLiked ? 'fill-current' : ''}`} />
                                {thread.likesCount || 0}
                            </button>
                            {currentUser?.role === 'moderator' && (
                                <button
                                    onClick={() => toggleThreadPin(thread.id)}
                                    className={`flex items-center px-3 py-1 rounded-md text-sm font-medium ${thread.isPinned ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <Pin className="h-4 w-4 mr-2" />
                                    {thread.isPinned ? 'Unpin' : 'Pin'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="px-4 py-5 sm:p-6">
                    <p className="text-gray-800 whitespace-pre-wrap">{thread.content}</p>
                    {thread.images && thread.images.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            {thread.images.map((img, idx) => (
                                <img key={idx} src={img} alt={`Thread image ${idx + 1}`} className="rounded-lg object-cover w-full h-64" />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Replies ({thread.replies.length})</h3>

                {thread.replies.map(reply => {
                    const replyAuthor = getUser(reply.authorId);
                    return (
                        <div key={reply.id} className="bg-white shadow sm:rounded-lg p-6">
                            <div className="flex space-x-4">
                                <div className="flex-shrink-0">
                                    <img
                                        className="h-10 w-10 rounded-full object-cover"
                                        src={replyAuthor?.avatar}
                                        alt={replyAuthor?.name}
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-bold text-gray-900">{replyAuthor?.name}</h4>
                                        <span className="text-xs text-gray-500">
                                            {new Date(reply.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                                    {reply.images && reply.images.length > 0 && (
                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                            {reply.images.map((img, idx) => (
                                                <img key={idx} src={img} alt={`Reply attachment ${idx + 1}`} className="rounded-md object-cover w-full h-40" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div className="bg-white shadow sm:rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Leave a Reply</h3>
                    <form onSubmit={handleReplySubmit}>
                        <textarea
                            rows={4}
                            className="shadow-sm block w-full focus:ring-brand-primary focus:border-brand-primary sm:text-sm border-gray-300 rounded-md"
                            placeholder="Write your reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                        />

                        {/* Image Upload Section */}
                        <div className="mt-3">
                            <button
                                type="button"
                                onClick={() => setShowImageUpload(!showImageUpload)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                            >
                                <Paperclip className="h-4 w-4 mr-2" />
                                {showImageUpload ? 'Hide' : 'Attach Image'}
                            </button>

                            {showImageUpload && (
                                <div className="mt-3">
                                    <ImageUpload
                                        uploadType="thread-image"
                                        onUploadSuccess={(url) => setReplyImages([...replyImages, url])}
                                        currentImage={replyImages[replyImages.length - 1]}
                                    />
                                </div>
                            )}

                            {replyImages.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {replyImages.map((img, idx) => (
                                        <div key={idx} className="relative">
                                            <img src={img} alt={`Attachment ${idx + 1}`} className="h-20 w-20 object-cover rounded-md" />
                                            <button
                                                type="button"
                                                onClick={() => setReplyImages(replyImages.filter((_, i) => i !== idx))}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                            >
                                                <X className="h-3 w-3 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={!replyContent.trim()}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50"
                            >
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Post Reply
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

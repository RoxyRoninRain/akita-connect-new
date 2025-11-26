import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Heart, MessageSquare, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CreatePost } from '../components/feed/CreatePost';

export const Home = () => {
    const { posts, currentUser, users, toggleLike, addComment, following } = useStore();
    const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
    const [commentContent, setCommentContent] = useState('');
    const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

    const handleCommentSubmit = (e: React.FormEvent, postId: string) => {
        e.preventDefault();
        if (commentContent.trim()) {
            addComment(postId, commentContent);
            setCommentContent('');
        }
    };

    const handleShare = async (postId: string) => {
        const url = window.location.href;

        // Try Web Share API first
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Akita Connect',
                    text: 'Check out this post on Akita Connect!',
                    url: url
                });
                return; // Share successful
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    console.warn('Web Share API failed, falling back to clipboard...', err);
                } else {
                    return; // User cancelled
                }
            }
        }

        // Fallback to Clipboard
        try {
            await navigator.clipboard.writeText(url);
            setCopiedPostId(postId);
            setTimeout(() => setCopiedPostId(null), 2000);
        } catch (err) {
            console.warn('Clipboard API failed, trying fallback...', err);
            try {
                const textArea = document.createElement("textarea");
                textArea.value = url;
                textArea.style.position = "fixed";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                if (successful) {
                    setCopiedPostId(postId);
                    setTimeout(() => setCopiedPostId(null), 2000);
                } else {
                    throw new Error('Fallback copy failed');
                }
            } catch (fallbackErr) {
                console.error('Copy failed:', fallbackErr);
                alert('Failed to copy link. Please copy manually: ' + url);
            }
        }
    };

    const getUser = (id: string) => users.find(u => u.id === id);

    const [activeTab, setActiveTab] = useState<'all' | 'following'>('all');

    // Filter posts based on active tab
    const displayedPosts = activeTab === 'all'
        ? posts
        : posts.filter(p => following.includes(p.authorId));

    return (
        <div className="max-w-3xl mx-auto">
            {/* Feed Tabs */}
            <div className="bg-white rounded-lg shadow mb-6 flex overflow-hidden">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`flex-1 py-3 text-sm font-medium text-center ${activeTab === 'all' ? 'bg-brand-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    For You
                </button>
                <button
                    onClick={() => setActiveTab('following')}
                    className={`flex-1 py-3 text-sm font-medium text-center ${activeTab === 'following' ? 'bg-brand-primary text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    Following
                </button>
            </div>

            {/* Create Post */}
            {activeTab === 'all' && <CreatePost />}

            {/* Feed */}
            <div className="space-y-6">
                {activeTab === 'following' && displayedPosts.length === 0 && (
                    <div className="text-center py-10 bg-white rounded-lg shadow">
                        <p className="text-gray-500">You aren't following anyone yet, or they haven't posted.</p>
                        <Link to="/directory" className="text-brand-primary hover:underline mt-2 inline-block">Find people to follow</Link>
                    </div>
                )}
                {displayedPosts.map(post => {
                    const author = getUser(post.authorId);
                    if (!author) return null;
                    const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;

                    return (
                        <div key={post.id} className="bg-white rounded-lg shadow">
                            <div className="p-4">
                                <div className="flex items-center space-x-3 mb-4">
                                    <Link to={`/profile/${author.id}`}>
                                        <img
                                            className="h-10 w-10 rounded-full object-cover"
                                            src={author.avatar}
                                            alt={author.name}
                                        />
                                    </Link>
                                    <div>
                                        <Link to={`/profile/${author.id}`} className="text-sm font-medium text-gray-900 hover:underline">
                                            {author.name}
                                        </Link>
                                        <p className="text-xs text-gray-500">
                                            {new Date(post.timestamp).toLocaleDateString()} at {new Date(post.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>

                                {post.images && post.images.length > 0 && (
                                    <div className="mb-4">
                                        <img
                                            src={post.images[0]}
                                            alt="Post content"
                                            className="rounded-lg w-full object-cover max-h-96"
                                        />
                                    </div>
                                )}

                                <div className="flex items-center justify-between border-t pt-4">
                                    <button
                                        onClick={() => toggleLike(post.id)}
                                        className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-brand-primary'}`}
                                    >
                                        <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                                        <span>{post.likes.length} Likes</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                                        className="flex items-center text-gray-500 hover:text-brand-primary space-x-2"
                                    >
                                        <MessageSquare className="h-5 w-5" />
                                        <span>{post.comments.length} Comments</span>
                                    </button>
                                    <button
                                        onClick={() => handleShare(post.id)}
                                        className={`flex items-center space-x-2 ${copiedPostId === post.id ? 'text-green-600' : 'text-gray-500 hover:text-brand-primary'}`}
                                    >
                                        <Share2 className="h-5 w-5" />
                                        <span>{copiedPostId === post.id ? 'Copied!' : 'Share'}</span>
                                    </button>
                                </div>

                                {/* Comments Section */}
                                {activeCommentPostId === post.id && (
                                    <div className="mt-4 border-t pt-4 space-y-4">
                                        {post.comments.map(comment => {
                                            const commentAuthor = getUser(comment.authorId);
                                            return (
                                                <div key={comment.id} className="flex space-x-3">
                                                    <img
                                                        className="h-8 w-8 rounded-full object-cover"
                                                        src={commentAuthor?.avatar}
                                                        alt={commentAuthor?.name}
                                                    />
                                                    <div className="bg-gray-50 rounded-lg p-3 flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{commentAuthor?.name}</p>
                                                        <p className="text-sm text-gray-700">{comment.content}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {currentUser && (
                                            <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="flex space-x-3">
                                                <img
                                                    className="h-8 w-8 rounded-full object-cover"
                                                    src={currentUser.avatar}
                                                    alt={currentUser.name}
                                                />
                                                <div className="flex-1 flex space-x-2">
                                                    <input
                                                        type="text"
                                                        value={commentContent}
                                                        onChange={(e) => setCommentContent(e.target.value)}
                                                        placeholder="Write a comment..."
                                                        className="flex-1 border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary text-sm"
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={!commentContent.trim()}
                                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-secondary disabled:opacity-50"
                                                    >
                                                        Post
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>


            {/* Debug Info - Temporary */}
            <div className="mt-8 p-4 bg-gray-100 rounded text-xs text-gray-500">
                <p>Debug Info:</p>
                <p>API Connected: {users.length > 0 ? 'Yes' : 'No/Loading'}</p>
                <p>Users: {users.length}</p>
                <p>Posts: {posts.length}</p>
                <p>Current User: {currentUser ? currentUser.name : 'Not logged in'}</p>
                <p>Following: {following.length}</p>
            </div>
        </div >
    );
};

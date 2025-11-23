import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Image as ImageIcon, Send } from 'lucide-react';

export const CreatePost = () => {
    const { currentUser, addPost } = useStore();
    const [newPostContent, setNewPostContent] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePostSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPostContent.trim() || selectedImage) {
            addPost(newPostContent, selectedImage ? [selectedImage] : []);
            setNewPostContent('');
            setSelectedImage(null);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="flex space-x-3">
                <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={currentUser.avatar}
                    alt={currentUser.name}
                />
                <form onSubmit={handlePostSubmit} className="flex-1">
                    <textarea
                        className="w-full border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary resize-none"
                        rows={3}
                        placeholder="What's on your mind?"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                    />
                    {selectedImage && (
                        <div className="mt-2 relative inline-block">
                            <img src={selectedImage} alt="Preview" className="h-32 w-auto rounded-md object-cover" />
                            <button
                                type="button"
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                            >
                                <span className="sr-only">Remove</span>
                                &times;
                            </button>
                        </div>
                    )}
                    <div className="mt-3 flex justify-between items-center">
                        <label className="inline-flex items-center text-gray-500 hover:text-brand-primary cursor-pointer">
                            <ImageIcon className="h-5 w-5 mr-2" />
                            <span className="text-sm">Photo/Video</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                        <button
                            type="submit"
                            disabled={!newPostContent.trim() && !selectedImage}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50"
                        >
                            <Send className="h-4 w-4 mr-2" />
                            Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

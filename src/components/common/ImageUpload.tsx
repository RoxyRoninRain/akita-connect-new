import { useState, useRef } from 'react';
import { Upload, X, Loader } from 'lucide-react';
import { supabase } from '../../supabaseClient';

interface ImageUploadProps {
    onUploadSuccess: (url: string) => void;
    uploadType: 'avatar' | 'post-image' | 'thread-image' | 'message-attachment' | 'akita-image';
    currentImage?: string;
    label?: string;
    className?: string;
}

export const ImageUpload = ({ onUploadSuccess, uploadType, currentImage, label, className = '' }: ImageUploadProps) => {
    const [preview, setPreview] = useState<string | null>(currentImage || null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be smaller than 5MB');
            return;
        }

        setError(null);
        setUploading(true);

        try {
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Get auth token from Supabase
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                throw new Error('Not authenticated');
            }

            // Upload to server - ensure /api is appended correctly
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const API_URL = API_BASE.endsWith('/api') ? API_BASE : `${API_BASE}/api`;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileName', file.name);
            formData.append('contentType', file.type);

            const response = await fetch(`${API_URL}/uploads/${uploadType}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();
            onUploadSuccess(data.url);
            setUploading(false);
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Failed to upload image');
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={className}>
            {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}

            <div className="flex items-center space-x-4">
                {preview ? (
                    <div className="relative">
                        <img
                            src={preview}
                            alt="Preview"
                            className={`object-cover rounded ${uploadType === 'avatar' ? 'h-24 w-24 rounded-full' : 'h-32 w-32'}`}
                        />
                        {!uploading && (
                            <button
                                onClick={handleRemove}
                                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                ) : (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-brand-primary transition-colors ${uploadType === 'avatar' ? 'h-24 w-24 rounded-full' : 'h-32 w-32'}`}
                    >
                        <Upload className="h-8 w-8 text-gray-400" />
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <div className="flex-1">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                        {uploading ? (
                            <span className="flex items-center">
                                <Loader className="animate-spin h-4 w-4 mr-2" />
                                Uploading...
                            </span>
                        ) : (
                            'Choose Image'
                        )}
                    </button>
                    <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB
                    </p>
                </div>
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};

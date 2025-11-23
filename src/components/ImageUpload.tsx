import { useState, useRef } from 'react';

interface ImageUploadProps {
    currentImage?: string;
    onUpload: (url: string) => void;
    className?: string;
    label?: string;
}

export const ImageUpload = ({ currentImage, onUpload, className = "", label = "Upload Image" }: ImageUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | undefined>(currentImage);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];

            // Create preview immediately
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);

            // Use FileReader to convert to base64 instead of Supabase storage
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                onUpload(base64String);
            };
            reader.readAsDataURL(file);
        } catch (error: any) {
            console.error('Error uploading image:', error.message);
            alert('Error uploading image: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={`flex flex-col items-center gap-4 ${className}`}>
            {preview ? (
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white text-sm font-medium"
                    >
                        Change
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
                >
                    {uploading ? 'Uploading...' : label}
                </button>
            )}

            <input
                type="file"
                id="single"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                ref={fileInputRef}
                className="hidden"
            />
        </div>
    );
};

import { useState } from 'react';
import { X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

interface PhotoGalleryProps {
    images: string[];
    onDelete?: (imageUrl: string) => void;
    editable?: boolean;
}

export const PhotoGallery = ({ images, onDelete, editable = false }: PhotoGalleryProps) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    const openLightbox = (index: number) => {
        setCurrentIndex(index);
        setLightboxOpen(true);
    };

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleDelete = (imageUrl: string) => {
        if (onDelete && confirm('Are you sure you want to delete this photo?')) {
            onDelete(imageUrl);
            if (lightboxOpen) {
                setLightboxOpen(false);
            }
        }
    };

    if (images.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No photos yet</p>
            </div>
        );
    }

    return (
        <>
            {/* Photo Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                    <div key={index} className="relative group aspect-square">
                        <img
                            src={image}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => openLightbox(index)}
                        />
                        {editable && onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(image);
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
                    <button
                        onClick={() => setLightboxOpen(false)}
                        className="absolute top-4 right-4 text-white hover:text-gray-300"
                    >
                        <X className="h-8 w-8" />
                    </button>

                    {images.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-4 text-white hover:text-gray-300"
                            >
                                <ChevronLeft className="h-12 w-12" />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-4 text-white hover:text-gray-300"
                            >
                                <ChevronRight className="h-12 w-12" />
                            </button>
                        </>
                    )}

                    <div className="max-w-4xl max-h-[90vh] p-4">
                        <img
                            src={images[currentIndex]}
                            alt={`Photo ${currentIndex + 1}`}
                            className="max-w-full max-h-full object-contain"
                        />
                        <div className="text-center text-white mt-4">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </div>

                    {editable && onDelete && (
                        <button
                            onClick={() => handleDelete(images[currentIndex])}
                            className="absolute bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center space-x-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete Photo</span>
                        </button>
                    )}
                </div>
            )}
        </>
    );
};

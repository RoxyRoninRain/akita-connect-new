import { X } from 'lucide-react';
import { useEffect } from 'react';

interface LightboxProps {
    isOpen: boolean;
    onClose: () => void;
    imageSrc: string;
    altText?: string;
}

export const Lightbox = ({ isOpen, onClose, imageSrc, altText }: LightboxProps) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={onClose}>
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2"
            >
                <X className="h-8 w-8" />
            </button>
            <div
                className="relative max-w-7xl max-h-[90vh] p-4"
                onClick={e => e.stopPropagation()}
            >
                <img
                    src={imageSrc}
                    alt={altText || 'Lightbox image'}
                    className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl"
                />
                {altText && (
                    <p className="text-white/80 text-center mt-4 text-lg font-medium">{altText}</p>
                )}
            </div>
        </div>
    );
};

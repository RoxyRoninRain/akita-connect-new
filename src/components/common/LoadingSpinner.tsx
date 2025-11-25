import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: number;
    className?: string;
    text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 24,
    className = '',
    text
}) => {
    return (
        <div className={`flex flex-col items-center justify-center p-4 ${className}`}>
            <Loader2
                className="animate-spin text-primary-600"
                size={size}
            />
            {text && (
                <p className="mt-2 text-sm text-gray-500 font-medium animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
};

export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
    <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size={40} text={text} />
    </div>
);

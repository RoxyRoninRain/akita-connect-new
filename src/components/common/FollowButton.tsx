import { useState } from 'react';
import { UserPlus, UserMinus } from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../../context/StoreContext';

interface FollowButtonProps {
    userId: string;
    initialIsFollowing?: boolean;
    onToggle?: (isFollowing: boolean) => void;
    className?: string;
}

export const FollowButton = ({ userId, initialIsFollowing = false, onToggle, className }: FollowButtonProps) => {
    const { currentUser } = useStore();
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [loading, setLoading] = useState(false);

    const handleFollowToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!currentUser || userId === currentUser.id) return;

        setLoading(true);
        try {
            if (isFollowing) {
                // Unfollow
                await fetch(`http://localhost:3000/api/follows/${userId}?followerId=${currentUser.id}`, {
                    method: 'DELETE'
                });
                setIsFollowing(false);
                onToggle?.(false);
            } else {
                // Follow
                await fetch(`http://localhost:3000/api/follows/${userId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ followerId: currentUser.id })
                });
                setIsFollowing(true);
                onToggle?.(true);
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser || userId === currentUser.id) return null;

    return (
        <button
            onClick={handleFollowToggle}
            disabled={loading}
            className={clsx(
                "inline-flex justify-center items-center space-x-2 px-4 py-2 border shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-colors",
                isFollowing
                    ? "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                    : "border-transparent text-white bg-brand-primary hover:bg-brand-secondary",
                className
            )}
        >
            {isFollowing ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            <span>{loading ? 'Loading...' : (isFollowing ? 'Unfollow' : 'Follow')}</span>
        </button>
    );
};

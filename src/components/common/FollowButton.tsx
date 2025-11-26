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

export const FollowButton = ({ userId, onToggle, className }: FollowButtonProps) => {
    const { currentUser, followUser, unfollowUser, following } = useStore();
    const isFollowing = following?.includes(userId);
    const [loading, setLoading] = useState(false);

    const handleFollowToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!currentUser || userId === currentUser.id) return;

        setLoading(true);
        try {
            if (isFollowing) {
                await unfollowUser(userId);
                onToggle?.(false);
            } else {
                await followUser(userId);
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

import { Award, Shield } from 'lucide-react';
import type { UserBadge, AkitaBadge } from '../types';

interface BadgeDisplayProps {
    badges?: (UserBadge | AkitaBadge)[];
    type: 'user' | 'akita';
}

export const BadgeDisplay = ({ badges, type }: BadgeDisplayProps) => {
    // Only show approved badges
    const approvedBadges = badges?.filter(badge => badge.status === 'approved') || [];

    if (approvedBadges.length === 0) {
        return null;
    }

    const Icon = type === 'user' ? Shield : Award;

    return (
        <div className="flex flex-wrap gap-2">
            {approvedBadges.map((badge) => {
                // Type guard to check if it's an AkitaBadge
                const dateEarnedText = 'akitaId' in badge && badge.dateEarned
                    ? ` - Earned: ${new Date(badge.dateEarned).toLocaleDateString()}`
                    : '';

                return (
                    <div
                        key={badge.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800 border border-yellow-200 shadow-sm"
                        title={`${badge.type}${dateEarnedText}`}
                    >
                        <Icon className="h-3 w-3 mr-1.5" />
                        {badge.type}
                    </div>
                );
            })}
        </div>
    );
};

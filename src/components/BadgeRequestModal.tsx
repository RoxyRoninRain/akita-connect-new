import { useState } from 'react';
import { X } from 'lucide-react';
import { ImageUpload } from './ImageUpload';
import type { UserBadgeType, AkitaBadgeType } from '../types';

interface BadgeRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'user' | 'akita';
    entityId: string; // userId or akitaId
    entityName?: string; // For display purposes
    onSubmit: (badgeType: string, proofDocument?: string, notes?: string, dateEarned?: string) => Promise<void>;
}

const USER_BADGE_TYPES: UserBadgeType[] = [
    'ACA Member',
    'Breeder of Merit',
    'Judge',
    'Heart Certified',
    'Rescue Volunteer',
    'Show Handler',
    'Therapy Dog Handler'
];

const AKITA_BADGE_TYPES: AkitaBadgeType[] = [
    'ROM',
    'BISS',
    'BIS',
    'Grand Champion',
    'Champion',
    'Therapy Dog',
    'CGC',
    'Service Dog'
];

export const BadgeRequestModal = ({
    isOpen,
    onClose,
    type,
    entityId,
    entityName,
    onSubmit
}: BadgeRequestModalProps) => {
    const [selectedBadge, setSelectedBadge] = useState('');
    const [customBadge, setCustomBadge] = useState('');
    const [proofDocument, setProofDocument] = useState('');
    const [notes, setNotes] = useState('');
    const [dateEarned, setDateEarned] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const badgeTypes = type === 'user' ? USER_BADGE_TYPES : AKITA_BADGE_TYPES;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const badgeType = selectedBadge === 'custom' ? customBadge : selectedBadge;
            await onSubmit(badgeType, proofDocument, notes, dateEarned);
            onClose();
            // Reset form
            setSelectedBadge('');
            setCustomBadge('');
            setProofDocument('');
            setNotes('');
            setDateEarned('');
        } catch (error) {
            console.error('Failed to submit badge request:', error);
            alert('Failed to submit badge request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Request Badge{entityName ? ` for ${entityName}` : ''}
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Badge Type
                                    </label>
                                    <select
                                        required
                                        value={selectedBadge}
                                        onChange={(e) => setSelectedBadge(e.target.value)}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                    >
                                        <option value="">Select a badge type</option>
                                        {badgeTypes.map((badge) => (
                                            <option key={badge} value={badge}>{badge}</option>
                                        ))}
                                        <option value="custom">Custom Badge</option>
                                    </select>
                                </div>

                                {selectedBadge === 'custom' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Custom Badge Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={customBadge}
                                            onChange={(e) => setCustomBadge(e.target.value)}
                                            placeholder="Enter custom badge name"
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                        />
                                    </div>
                                )}

                                {type === 'akita' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Date Earned (Optional)
                                        </label>
                                        <input
                                            type="date"
                                            value={dateEarned}
                                            onChange={(e) => setDateEarned(e.target.value)}
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Proof Document (Optional)
                                    </label>
                                    <ImageUpload
                                        currentImage={proofDocument}
                                        onUpload={setProofDocument}
                                        label="Upload Certificate/Proof"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Additional Notes (Optional)
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add any additional information..."
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                    />
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-6">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-primary text-base font-medium text-white hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary sm:text-sm disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                        <p className="mt-3 text-xs text-gray-500">
                            Your badge request will be reviewed by a moderator. You'll be notified once it's approved or if additional information is needed.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

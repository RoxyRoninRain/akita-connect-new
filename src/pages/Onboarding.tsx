import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import type { UserRole } from '../types';
import { Shield, Heart, Star } from 'lucide-react';

export const Onboarding = () => {
    const { currentUser } = useStore(); // In a real app, we'd update, not register again
    const navigate = useNavigate();
    const [role, setRole] = useState<UserRole | null>(null);
    const [details, setDetails] = useState({
        kennelName: '',
        experienceLevel: 'novice' as const,
        bio: ''
    });

    const handleComplete = () => {
        // In a real app, we would call an updateProfile function here
        // For this mock, we'll just navigate home
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Welcome, {currentUser?.name}!
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Tell us a bit about yourself to customize your experience.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {!role ? (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900 text-center mb-6">I am a...</h3>

                            <button
                                onClick={() => setRole('breeder')}
                                className="w-full flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-brand-primary hover:bg-brand-light transition-all group"
                            >
                                <Shield className="h-8 w-8 text-gray-400 group-hover:text-brand-primary mr-4" />
                                <div className="text-left">
                                    <p className="font-medium text-gray-900">Breeder</p>
                                    <p className="text-sm text-gray-500">I breed Akitas and want to manage my kennel.</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setRole('owner')}
                                className="w-full flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-brand-primary hover:bg-brand-light transition-all group"
                            >
                                <Heart className="h-8 w-8 text-gray-400 group-hover:text-brand-primary mr-4" />
                                <div className="text-left">
                                    <p className="font-medium text-gray-900">Owner</p>
                                    <p className="text-sm text-gray-500">I own an Akita and want to connect with others.</p>
                                </div>
                            </button>

                            <button
                                onClick={() => setRole('enthusiast')}
                                className="w-full flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-brand-primary hover:bg-brand-light transition-all group"
                            >
                                <Star className="h-8 w-8 text-gray-400 group-hover:text-brand-primary mr-4" />
                                <div className="text-left">
                                    <p className="font-medium text-gray-900">Enthusiast</p>
                                    <p className="text-sm text-gray-500">I love Akitas and want to learn more.</p>
                                </div>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {role === 'breeder' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Kennel Name</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                        value={details.kennelName}
                                        onChange={(e) => setDetails({ ...details, kennelName: e.target.value })}
                                    />
                                </div>
                            )}

                            {role === 'owner' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Experience Level</label>
                                    <select
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                        value={details.experienceLevel}
                                        onChange={(e) => setDetails({ ...details, experienceLevel: e.target.value as any })}
                                    >
                                        <option value="novice">Novice (First Akita)</option>
                                        <option value="intermediate">Intermediate (Had Akitas before)</option>
                                        <option value="expert">Expert (Long-time owner)</option>
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Bio</label>
                                <textarea
                                    rows={3}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                    value={details.bio}
                                    onChange={(e) => setDetails({ ...details, bio: e.target.value })}
                                />
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setRole(null)}
                                    className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleComplete}
                                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                                >
                                    Complete Profile
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

import { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Bell, Lock, Save } from 'lucide-react';

export const Settings = () => {
    const { currentUser, updateProfile } = useStore();
    const [settings, setSettings] = useState({
        notify_likes: true,
        notify_comments: true,
        notify_follows: true,
        show_email: false,
        show_phone: false
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (currentUser) {
            setSettings({
                notify_likes: currentUser.notify_likes ?? true,
                notify_comments: currentUser.notify_comments ?? true,
                notify_follows: currentUser.notify_follows ?? true,
                show_email: currentUser.show_email ?? false,
                show_phone: currentUser.show_phone ?? false
            });
        }
    }, [currentUser]);

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage('');
        try {
            // In a real app, we would call an API endpoint specific for settings
            // For now, we reuse updateProfile if it supports these fields, or we need to update the API
            // Assuming updateProfile calls PUT /api/users/:id or similar
            await updateProfile({ ...settings });
            setMessage('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings:', error);
            setMessage('Failed to save settings.');
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) return <div className="p-4">Please log in to view settings.</div>;

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            {message && (
                <div className={`p-3 mb-4 rounded-md ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message}
                </div>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                        <Bell className="h-5 w-5 mr-2 text-gray-400" />
                        Notification Settings
                    </h3>
                    <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="flex-grow flex flex-col">
                                <span className="text-sm font-medium text-gray-900">Likes</span>
                                <span className="text-sm text-gray-500">Notify me when someone likes my posts</span>
                            </span>
                            <button
                                onClick={() => handleToggle('notify_likes')}
                                type="button"
                                className={`${settings.notify_likes ? 'bg-brand-primary' : 'bg-gray-200'} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary`}
                            >
                                <span className={`${settings.notify_likes ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex-grow flex flex-col">
                                <span className="text-sm font-medium text-gray-900">Comments</span>
                                <span className="text-sm text-gray-500">Notify me when someone comments on my posts</span>
                            </span>
                            <button
                                onClick={() => handleToggle('notify_comments')}
                                type="button"
                                className={`${settings.notify_comments ? 'bg-brand-primary' : 'bg-gray-200'} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary`}
                            >
                                <span className={`${settings.notify_comments ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex-grow flex flex-col">
                                <span className="text-sm font-medium text-gray-900">New Followers</span>
                                <span className="text-sm text-gray-500">Notify me when someone follows me</span>
                            </span>
                            <button
                                onClick={() => handleToggle('notify_follows')}
                                type="button"
                                className={`${settings.notify_follows ? 'bg-brand-primary' : 'bg-gray-200'} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary`}
                            >
                                <span className={`${settings.notify_follows ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                        <Lock className="h-5 w-5 mr-2 text-gray-400" />
                        Privacy Settings
                    </h3>
                    <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="flex-grow flex flex-col">
                                <span className="text-sm font-medium text-gray-900">Show Email</span>
                                <span className="text-sm text-gray-500">Display my email address on my profile</span>
                            </span>
                            <button
                                onClick={() => handleToggle('show_email')}
                                type="button"
                                className={`${settings.show_email ? 'bg-brand-primary' : 'bg-gray-200'} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary`}
                            >
                                <span className={`${settings.show_email ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="flex-grow flex flex-col">
                                <span className="text-sm font-medium text-gray-900">Show Phone Number</span>
                                <span className="text-sm text-gray-500">Display my phone number on my profile</span>
                            </span>
                            <button
                                onClick={() => handleToggle('show_phone')}
                                type="button"
                                className={`${settings.show_phone ? 'bg-brand-primary' : 'bg-gray-200'} relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary`}
                            >
                                <span className={`${settings.show_phone ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50"
                >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

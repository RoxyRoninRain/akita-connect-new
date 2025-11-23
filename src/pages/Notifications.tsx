import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Bell, Trash2, Check } from 'lucide-react';
import clsx from 'clsx';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link: string;
    read: boolean;
    created_at: string;
}

export const Notifications = () => {
    const { currentUser } = useStore();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, [currentUser]);

    const fetchNotifications = async () => {
        if (!currentUser) return;

        try {
            const response = await fetch(`http://localhost:3000/api/notifications?userId=${currentUser.id}`);
            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await fetch(`http://localhost:3000/api/notifications/${id}/read`, {
                method: 'PUT'
            });
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (!currentUser) return;

        try {
            await fetch('http://localhost:3000/api/notifications/read-all', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id })
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (id: string) => {
        try {
            await fetch(`http://localhost:3000/api/notifications/${id}`, {
                method: 'DELETE'
            });
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'follow':
                return '👤';
            case 'like':
                return '❤️';
            case 'comment':
                return '💬';
            case 'message':
                return '📩';
            case 'rsvp':
                return '📅';
            case 'litter_approved':
                return '✅';
            default:
                return '🔔';
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) {
        return <div className="max-w-3xl mx-auto text-center py-12">Loading...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                        {unreadCount > 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="inline-flex items-center space-x-2 px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <Check className="h-4 w-4" />
                            <span>Mark all as read</span>
                        </button>
                    )}
                </div>

                <div className="divide-y divide-gray-200">
                    {notifications.length === 0 ? (
                        <div className="text-center py-12">
                            <Bell className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                            <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={clsx(
                                    'px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors',
                                    !notification.read && 'bg-brand-light/30'
                                )}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex items-start space-x-3">
                                    <span className="text-2xl flex-shrink-0">
                                        {getNotificationIcon(notification.type)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className={clsx(
                                                    'text-sm',
                                                    !notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                                                )}>
                                                    {notification.title}
                                                </p>
                                                {notification.message && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {notification.message}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(notification.created_at).toLocaleDateString()} at{' '}
                                                    {new Date(notification.created_at).toLocaleTimeString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notification.id);
                                                }}
                                                className="text-gray-400 hover:text-red-500 ml-4"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

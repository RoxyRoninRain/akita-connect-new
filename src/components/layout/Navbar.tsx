import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, MessageSquare, Menu, LogOut } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SearchResults } from '../SearchResults';

export const Navbar = () => {
    const { currentUser, logout } = useStore();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Poll for unread notifications
    useEffect(() => {
        if (!currentUser) return;

        const fetchUnreadCount = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/notifications/unread-count?userId=${currentUser.id}`);
                const data = await response.json();
                setUnreadCount(data.count);
            } catch (error) {
                console.error('Error fetching unread count:', error);
            }
        };

        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds

        return () => clearInterval(interval);
    }, [currentUser]);

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
                            <img src="/akita-logo.png" alt="Akita Connect Logo" className="h-12 w-12 rounded-full" />
                            <div>
                                <span className="text-2xl font-semibold text-brand-primary tracking-tight">Akita</span>
                                <span className="text-2xl font-light text-brand-secondary">Connect</span>
                            </div>
                        </Link>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link to="/" className="border-brand-primary text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Feed
                            </Link>
                            <Link to="/marketplace" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Marketplace
                            </Link>
                            <Link to="/community" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Community
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowSearchResults(true);
                                    }}
                                    onFocus={() => setShowSearchResults(true)}
                                    className="focus:ring-brand-primary focus:border-brand-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                                    placeholder="Search Akitas, Users..."
                                />
                                {showSearchResults && (
                                    <SearchResults
                                        query={searchQuery}
                                        onClose={() => {
                                            setShowSearchResults(false);
                                            setSearchQuery('');
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {currentUser ? (
                            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                                <button
                                    onClick={() => navigate('/notifications')}
                                    className="relative bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                                >
                                    <Bell className="h-6 w-6" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>
                                <button onClick={() => navigate('/messages')} className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                                    <MessageSquare className="h-6 w-6" />
                                </button>

                                {currentUser.role === 'moderator' && (
                                    <Link
                                        to="/moderator"
                                        className="px-3 py-1.5 text-sm font-medium text-brand-primary hover:text-brand-secondary bg-brand-light rounded-md"
                                    >
                                        Moderator
                                    </Link>
                                )}

                                <div className="ml-3 relative flex items-center space-x-2">
                                    <Link to="/profile">
                                        <img
                                            className="h-8 w-8 rounded-full object-cover border-2 border-brand-primary"
                                            src={currentUser.avatar}
                                            alt={currentUser.name}
                                        />
                                    </Link>
                                    <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700">
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
                                <Link to="/login" className="text-gray-500 hover:text-gray-900 font-medium">
                                    Log in
                                </Link>
                                <Link to="/signup" className="bg-brand-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-secondary transition-colors">
                                    Sign up
                                </Link>
                            </div>
                        )}

                        <div className="-mr-2 flex items-center sm:hidden">
                            <button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary">
                                <Menu className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

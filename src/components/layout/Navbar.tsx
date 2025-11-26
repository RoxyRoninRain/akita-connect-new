import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, MessageSquare, Menu, LogOut, X, Home, ShoppingBag, Users, Calendar, BookOpen, User } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SearchResults } from '../SearchResults';

export const Navbar = () => {
    const { currentUser, logout, unreadCount } = useStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getLinkClass = (path: string) => {
        const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
        return isActive
            ? "border-brand-primary text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium";
    };

    const MobileMenuItem = ({ to, icon: Icon, label, onClick }: any) => {
        const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
        return (
            <Link
                to={to}
                onClick={() => {
                    if (onClick) onClick();
                    setMobileMenuOpen(false);
                }}
                className={`flex items-center px-3 py-3 rounded-md text-sm font-medium ${isActive
                    ? 'bg-brand-light text-brand-primary'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
            >
                <Icon className="h-5 w-5 mr-3" />
                {label}
            </Link>
        );
    };

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                <div className="flex justify-between h-14 md:h-16">
                    {/* Left: Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
                            <img src="/akita-logo.png" alt="Akita Connect Logo" className="h-8 w-8 md:h-12 md:w-12 rounded-full" />
                            <div className="hidden min-[380px]:block">
                                <span className="text-lg md:text-2xl font-semibold text-brand-primary tracking-tight">Akita</span>
                                <span className="text-lg md:text-2xl font-light text-brand-secondary">Connect</span>
                            </div>
                        </Link>

                        {/* Desktop navigation - hidden on mobile */}
                        <div className="hidden md:ml-6 md:flex md:space-x-8">
                            <Link
                                to="/"
                                className={getLinkClass('/')}
                                onMouseEnter={() => import('../../pages/Home')}
                            >
                                Feed
                            </Link>
                            <Link
                                to="/marketplace"
                                className={getLinkClass('/marketplace')}
                                onMouseEnter={() => import('../../pages/Marketplace')}
                            >
                                Marketplace
                            </Link>
                            <Link
                                to="/hub"
                                className={getLinkClass('/hub')}
                                onMouseEnter={() => import('../../pages/CommunityHub')}
                            >
                                Community
                            </Link>
                            <Link
                                to="/directory"
                                className={getLinkClass('/directory')}
                                onMouseEnter={() => import('../../pages/Directory')}
                            >
                                Directory
                            </Link>
                            <Link
                                to="/events"
                                className={getLinkClass('/events')}
                                onMouseEnter={() => import('../../pages/Events')}
                            >
                                Events
                            </Link>
                        </div>
                    </div>

                    {/* Right: Search, Actions, Menu */}
                    <div className="flex items-center space-x-1 md:space-x-2">
                        {/* Desktop search - hidden on mobile */}
                        <div className="hidden md:block flex-shrink-0">
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

                        {/* Notification and Message buttons - visible on mobile and desktop */}
                        {currentUser && (
                            <>
                                <button
                                    onClick={() => navigate('/notifications')}
                                    className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100"
                                >
                                    <Bell className="h-6 w-6" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => navigate('/messages')}
                                    className="p-2 rounded-full text-gray-500 hover:bg-gray-100"
                                >
                                    <MessageSquare className="h-6 w-6" />
                                </button>
                            </>
                        )}

                        {/* Desktop-only user menu */}
                        {currentUser && (
                            <div className="hidden md:flex md:items-center md:space-x-3">
                                {currentUser.role === 'moderator' && (
                                    <Link
                                        to="/moderator"
                                        className="px-3 py-1.5 text-sm font-medium text-brand-primary hover:text-brand-secondary bg-brand-light rounded-md"
                                    >
                                        Moderator
                                    </Link>
                                )}

                                <Link to="/profile">
                                    <img
                                        className="h-8 w-8 rounded-full object-cover border-2 border-brand-primary"
                                        src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}&background=random`}
                                        alt={currentUser.name}
                                    />
                                </Link>
                                <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700">
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        )}

                        {/* Desktop-only login buttons */}
                        {!currentUser && (
                            <div className="hidden md:flex md:items-center space-x-4">
                                <Link to="/login" className="text-gray-500 hover:text-gray-900 font-medium">
                                    Log in
                                </Link>
                                <Link to="/signup" className="bg-brand-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-secondary transition-colors">
                                    Sign up
                                </Link>
                            </div>
                        )}

                        {/* Mobile hamburger button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu panel */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-white top-14 overflow-y-auto">
                    <div className="p-4 space-y-4">
                        {/* Mobile search */}
                        <div className="relative">
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
                                className="focus:ring-brand-primary focus:border-brand-primary block w-full pl-10 text-sm border-gray-300 rounded-md py-2 bg-gray-100"
                                placeholder="Search Akitas, Users..."
                            />
                            {showSearchResults && (
                                <div className="absolute top-full left-0 right-0 z-50 mt-1">
                                    <SearchResults
                                        query={searchQuery}
                                        onClose={() => {
                                            setShowSearchResults(false);
                                            setSearchQuery('');
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Navigation Links */}
                        <div className="space-y-1">
                            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Menu</h3>
                            <MobileMenuItem to="/" icon={Home} label="Feed" />
                            <MobileMenuItem to="/marketplace" icon={ShoppingBag} label="Marketplace" />
                            <MobileMenuItem to="/hub" icon={Users} label="Community Hub" />
                            <MobileMenuItem to="/directory" icon={BookOpen} label="Directory" />
                            <MobileMenuItem to="/events" icon={Calendar} label="Events" />
                        </div>

                        <div className="border-t border-gray-200 pt-4 space-y-1">
                            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Account</h3>
                            {currentUser ? (
                                <>
                                    <MobileMenuItem to="/profile" icon={User} label="My Profile" />
                                    {currentUser.role === 'moderator' && (
                                        <MobileMenuItem to="/moderator" icon={Users} label="Moderator Dashboard" />
                                    )}
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="flex w-full items-center px-3 py-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                    >
                                        <LogOut className="h-5 w-5 mr-3" />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <MobileMenuItem to="/login" icon={User} label="Log in" />
                                    <MobileMenuItem to="/signup" icon={User} label="Sign up" />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

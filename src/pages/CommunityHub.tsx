import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Users, MessageSquare, Calendar, ShoppingBag, ArrowRight, Activity, Star } from 'lucide-react';

export const CommunityHub = () => {
    const { users, threads, events, litters } = useStore();

    // Calculate stats
    const stats = [
        {
            label: 'Community Members',
            value: users.length,
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
            link: '/directory'
        },
        {
            label: 'Active Discussions',
            value: threads.length,
            icon: MessageSquare,
            color: 'text-green-500',
            bg: 'bg-green-50',
            link: '/community'
        },
        {
            label: 'Upcoming Events',
            value: events.filter(e => new Date(e.date) > new Date()).length,
            icon: Calendar,
            color: 'text-purple-500',
            bg: 'bg-purple-50',
            link: '/events'
        },
        {
            label: 'Available Litters',
            value: litters.filter(l => l.status === 'Available').length,
            icon: ShoppingBag,
            color: 'text-orange-500',
            bg: 'bg-orange-50',
            link: '/marketplace'
        }
    ];

    // Get recent activity
    const recentThreads = [...threads]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);

    const upcomingEvents = [...events]
        .filter(e => new Date(e.date) > new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3);

    const newMembers = [...users]
        .sort((a, b) => new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime())
        .slice(0, 4);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Community Hub</h1>
                <p className="mt-2 text-lg text-gray-600">Welcome to the heart of the Akita Connect community.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {stats.map((stat, index) => (
                    <Link
                        key={index}
                        to={stat.link}
                        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200 border border-gray-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-full ${stat.bg}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area - 2/3 width */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Quick Access Cards */}
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                            <Star className="h-5 w-5 mr-2 text-brand-primary" />
                            Explore
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link to="/community" className="group bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-all">
                                <MessageSquare className="h-8 w-8 mb-4 opacity-90" />
                                <h3 className="text-lg font-bold mb-1">Forums</h3>
                                <p className="text-brand-light text-sm mb-4 opacity-90">Join discussions, ask questions, and share your knowledge.</p>
                                <span className="inline-flex items-center text-sm font-medium group-hover:translate-x-1 transition-transform">
                                    Go to Forums <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                            </Link>

                            <Link to="/events" className="group bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                                <Calendar className="h-8 w-8 mb-4 text-brand-primary" />
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Events</h3>
                                <p className="text-gray-500 text-sm mb-4">Discover meetups, shows, and community gatherings.</p>
                                <span className="inline-flex items-center text-sm font-medium text-brand-primary group-hover:translate-x-1 transition-transform">
                                    View Events <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                            </Link>

                            <Link to="/directory" className="group bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                                <Users className="h-8 w-8 mb-4 text-brand-primary" />
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Directory</h3>
                                <p className="text-gray-500 text-sm mb-4">Find breeders, owners, and Akitas near you.</p>
                                <span className="inline-flex items-center text-sm font-medium text-brand-primary group-hover:translate-x-1 transition-transform">
                                    Search Directory <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                            </Link>

                            <Link to="/marketplace" className="group bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                                <ShoppingBag className="h-8 w-8 mb-4 text-brand-primary" />
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Marketplace</h3>
                                <p className="text-gray-500 text-sm mb-4">Browse available puppies and planned litters.</p>
                                <span className="inline-flex items-center text-sm font-medium text-brand-primary group-hover:translate-x-1 transition-transform">
                                    Visit Marketplace <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                            </Link>
                        </div>
                    </section>

                    {/* Recent Discussions */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                <MessageSquare className="h-5 w-5 mr-2 text-brand-primary" />
                                Recent Discussions
                            </h2>
                            <Link to="/community" className="text-sm font-medium text-brand-primary hover:text-brand-secondary">
                                View all
                            </Link>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                            {recentThreads.map(thread => (
                                <Link key={thread.id} to={`/thread/${thread.id}`} className="block p-4 hover:bg-gray-50 transition-colors">
                                    <h3 className="text-base font-semibold text-gray-900 mb-1">{thread.title}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-1">{thread.content}</p>
                                    <div className="mt-2 flex items-center text-xs text-gray-400">
                                        <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                                        <span className="mx-2">•</span>
                                        <span>{thread.replies.length} replies</span>
                                        <span className="mx-2">•</span>
                                        <span className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">{thread.category}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar - 1/3 width */}
                <div className="space-y-8">

                    {/* New Members */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Users className="h-5 w-5 mr-2 text-brand-primary" />
                            New Members
                        </h2>
                        <div className="space-y-4">
                            {newMembers.map(user => (
                                <Link key={user.id} to={`/profile/${user.id}`} className="flex items-center space-x-3 group">
                                    <img
                                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                        alt={user.name}
                                        className="h-10 w-10 rounded-full object-cover border border-gray-200 group-hover:border-brand-primary transition-colors"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 group-hover:text-brand-primary transition-colors">{user.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Upcoming Events Mini List */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center">
                                <Calendar className="h-5 w-5 mr-2 text-brand-primary" />
                                Events
                            </h2>
                            <Link to="/events" className="text-xs font-medium text-brand-primary hover:text-brand-secondary">
                                View all
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {upcomingEvents.length > 0 ? (
                                upcomingEvents.map(event => (
                                    <Link key={event.id} to={`/events/${event.id}`} className="block group">
                                        <div className="flex space-x-3">
                                            <div className="flex-shrink-0 w-12 text-center bg-gray-50 rounded-lg p-1 border border-gray-100 group-hover:border-brand-primary transition-colors">
                                                <span className="block text-xs font-bold text-gray-500 uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                                <span className="block text-lg font-bold text-brand-primary">{new Date(event.date).getDate()}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 group-hover:text-brand-primary transition-colors line-clamp-1">{event.title}</p>
                                                <p className="text-xs text-gray-500 line-clamp-1">{event.location}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No upcoming events.</p>
                            )}
                        </div>
                    </section>

                    {/* Activity Feed Teaser */}
                    <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-sm p-6 text-white">
                        <div className="flex items-center mb-4">
                            <Activity className="h-5 w-5 mr-2 text-brand-primary" />
                            <h2 className="text-lg font-bold">Community Activity</h2>
                        </div>
                        <p className="text-gray-300 text-sm mb-4">
                            Stay updated with the latest discussions, events, and marketplace listings.
                        </p>
                        <Link
                            to="/notifications"
                            className="block w-full text-center bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg py-2 text-sm font-medium transition-colors"
                        >
                            Check Notifications
                        </Link>
                    </section>

                </div>
            </div>
        </div>
    );
};

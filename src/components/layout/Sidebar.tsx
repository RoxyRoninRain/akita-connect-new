import { Link } from 'react-router-dom';
import { Trophy, Activity, Users, MessageCircle } from 'lucide-react';

import { useStore } from '../../context/StoreContext';

export const Sidebar = () => {
    const { akitas } = useStore();
    return (
        <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20 space-y-6">

                {/* Quick Links */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        Explore
                    </h3>
                    <nav className="space-y-2">
                        <Link to="/directory" className="flex items-center text-gray-700 hover:text-brand-primary group">
                            <Users className="h-5 w-5 mr-3 text-gray-400 group-hover:text-brand-primary" />
                            <span>Directory</span>
                        </Link>

                        <Link to="/community" className="flex items-center text-gray-700 hover:text-brand-primary group">
                            <MessageCircle className="h-5 w-5 mr-3 text-gray-400 group-hover:text-brand-primary" />
                            <span>Forums</span>
                        </Link>
                        <Link to="/events" className="flex items-center text-gray-700 hover:text-brand-primary group">
                            <Activity className="h-5 w-5 mr-3 text-gray-400 group-hover:text-brand-primary" />
                            <span>Events</span>
                        </Link>
                        <Link to="/notifications" className="flex items-center text-gray-700 hover:text-brand-primary group">
                            <div className="relative">
                                <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></div>
                                <Activity className="h-5 w-5 mr-3 text-gray-400 group-hover:text-brand-primary" />
                            </div>
                            <span>Notifications</span>
                        </Link>
                    </nav>
                </div>

                {/* Recent Champions Widget */}
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                            Recent Champions
                        </h3>
                        <Trophy className="h-4 w-4 text-yellow-500" />
                    </div>
                    <ul className="space-y-3">
                        {akitas
                            .filter(dog => dog.titles && dog.titles.length > 0)
                            .slice(0, 3)
                            .map(dog => (
                                <li key={dog.id}>
                                    <Link to={`/akitas/${dog.id}`} className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-md transition-colors">
                                        <img
                                            className="h-10 w-10 rounded-full object-cover"
                                            src={dog.images[0] || "https://images.unsplash.com/photo-1563460716037-460a3ad24dd9?auto=format&fit=crop&q=80&w=150"}
                                            alt={dog.callName}
                                        />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{dog.callName}</p>
                                            <p className="text-xs text-gray-500">{dog.titles[0]}</p>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        {akitas.filter(dog => dog.titles && dog.titles.length > 0).length === 0 && (
                            <li className="text-xs text-gray-500 text-center py-2">No champions listed yet.</li>
                        )}
                    </ul>
                </div>

                {/* Health Stats Widget */}
                <div className="bg-white rounded-lg shadow p-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        Health Database
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">OFA Records</span>
                            <span className="font-medium text-brand-secondary">1,240</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">VGL Profiles</span>
                            <span className="font-medium text-brand-secondary">856</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

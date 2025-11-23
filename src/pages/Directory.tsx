import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Directory = () => {
    const { users, akitas } = useStore();
    const [activeTab, setActiveTab] = useState<'users' | 'akitas'>('users');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.kennelName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const filteredAkitas = akitas.filter(dog => {
        return dog.registeredName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dog.callName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Directory</h1>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="focus:ring-brand-primary focus:border-brand-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                            placeholder={`Search ${activeTab}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {activeTab === 'users' && (
                        <div className="sm:w-48">
                            <select
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="all">All Roles</option>
                                <option value="breeder">Breeders</option>
                                <option value="owner">Owners</option>
                                <option value="enthusiast">Enthusiasts</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="mt-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`${activeTab === 'users'
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Users & Breeders
                        </button>
                        <button
                            onClick={() => setActiveTab('akitas')}
                            className={`${activeTab === 'akitas'
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Akitas
                        </button>
                    </nav>
                </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === 'users' ? (
                    filteredUsers.map(user => (
                        <Link key={user.id} to={`/profile/${user.id}`} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 flex items-center space-x-4">
                            <img className="h-16 w-16 rounded-full object-cover" src={user.avatar} alt={user.name} />
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">{user.kennelName || user.name}</h3>
                                <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                                {user.location && (
                                    <p className="text-xs text-gray-400 mt-1">{user.location}</p>
                                )}
                            </div>
                        </Link>
                    ))
                ) : (
                    filteredAkitas.map(dog => (
                        <Link key={dog.id} to={`/akitas/${dog.id}`} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden">
                            <div className="aspect-w-3 aspect-h-2">
                                <img src={dog.images[0]} alt={dog.callName} className="w-full h-48 object-cover" />
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-medium text-gray-900">{dog.callName}</h3>
                                <p className="text-sm text-gray-500 truncate">{dog.registeredName}</p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

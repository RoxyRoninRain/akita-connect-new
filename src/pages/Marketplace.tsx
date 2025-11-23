import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { MapPin, Calendar, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

export const Marketplace = () => {
    const { litters, users, akitas, currentUser } = useStore();
    const [expandedLitters, setExpandedLitters] = useState<Set<string>>(new Set());
    const [filters, setFilters] = useState({
        location: 'all',
        status: 'all'
    });

    const toggleLitter = (litterId: string) => {
        const newExpanded = new Set(expandedLitters);
        if (newExpanded.has(litterId)) {
            newExpanded.delete(litterId);
        } else {
            newExpanded.add(litterId);
        }
        setExpandedLitters(newExpanded);
    };

    // Filter for available/expecting litters that are approved (or show all for moderators)
    const activeLitters = litters.filter(l => {
        const isActive = l.status === 'Available' || l.status === 'Expecting' || l.status === 'Planned';
        const isApproved = l.approvalStatus === 'approved';
        const isModerator = currentUser?.role === 'moderator';
        return isActive && (isApproved || isModerator);
    });

    // Apply user-selected filters
    const filteredLitters = activeLitters.filter(litter => {
        const breeder = getBreeder(litter.breederId);

        // Location filter
        if (filters.location !== 'all') {
            const location = breeder?.location || litter.location || '';
            if (!location.toLowerCase().includes(filters.location.toLowerCase())) {
                return false;
            }
        }

        // Status filter
        if (filters.status !== 'all' && litter.status !== filters.status) {
            return false;
        }

        return true;
    });

    const getBreeder = (id: string) => users.find(u => u.id === id);
    const getDog = (id: string) => akitas.find(d => d.id === id);

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Puppy Marketplace</h1>
                    <p className="mt-1 text-sm text-gray-500">Find your next show prospect or companion.</p>
                </div>
                <div className="flex space-x-4">
                    <select
                        value={filters.location}
                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md"
                    >
                        <option value="all">All Locations</option>
                        <option value="west">West Coast</option>
                        <option value="east">East Coast</option>
                        <option value="midwest">Midwest</option>
                        <option value="south">South</option>
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md"
                    >
                        <option value="all">Any Status</option>
                        <option value="Available">Available Now</option>
                        <option value="Expecting">Expecting</option>
                        <option value="Planned">Planned</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredLitters.map(litter => {
                    const breeder = getBreeder(litter.breederId);
                    const sire = getDog(litter.sireId);
                    const dam = getDog(litter.damId);

                    return (
                        <>
                            <div key={litter.id} className="bg-white rounded-lg shadow overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
                                <div className="md:w-72 h-48 md:h-auto relative">
                                    <img
                                        src={litter.images[0] || "https://images.unsplash.com/photo-1591160690555-5debfba289f0?auto=format&fit=crop&q=80&w=600"}
                                        alt="Litter"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-0 left-0 m-2">
                                        <span className={clsx(
                                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                            litter.status === 'Available' ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                                        )}>
                                            {litter.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {sire?.callName} x {dam?.callName}
                                                </h3>
                                                <Link to={`/profile/${breeder?.id}`} className="text-sm text-brand-primary hover:underline flex items-center mt-1">
                                                    <Shield className="h-3 w-3 mr-1" />
                                                    {breeder?.kennelName || breeder?.name}
                                                </Link>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Due/Born</p>
                                                <p className="font-medium text-gray-900">{new Date(litter.dob).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <p className="mt-4 text-gray-600 line-clamp-2">{litter.description}</p>

                                        <div className="mt-4 flex items-center space-x-6 text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                                {breeder?.location || litter.location || 'Location N/A'}
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                                Ready: {new Date(new Date(litter.dob).getTime() + 8 * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {litter.puppies.slice(0, 4).map((pup, idx) => (
                                                <img
                                                    key={idx}
                                                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                                                    src={pup.images[0] || `https://ui-avatars.com/api/?name=P${idx}&background=random`}
                                                    alt=""
                                                />
                                            ))}
                                            {litter.puppies.length > 4 && (
                                                <span className="inline-flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 text-xs font-medium text-gray-500">
                                                    +{litter.puppies.length - 4}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => toggleLitter(litter.id)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                                        >
                                            {expandedLitters.has(litter.id) ? (
                                                <>Hide Details <ChevronUp className="ml-2 h-4 w-4" /></>
                                            ) : (
                                                <>View Details <ChevronDown className="ml-2 h-4 w-4" /></>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {expandedLitters.has(litter.id) && (
                                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 -mt-2 mb-6 rounded-b-lg">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Puppies in this Litter</h4>
                                    {litter.puppies.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {litter.puppies.map(puppy => (
                                                <div key={puppy.id} className="bg-white p-3 rounded border border-gray-200 flex items-center space-x-3">
                                                    <div className="h-12 w-12 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
                                                        {puppy.images && puppy.images.length > 0 ? (
                                                            <img src={puppy.images[0]} alt={puppy.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">Pup</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm text-gray-900">{puppy.name || "Unnamed"}</p>
                                                        <p className="text-xs text-gray-500 capitalize">{puppy.gender} • {puppy.color}</p>
                                                        <p className="text-xs text-brand-primary font-medium">{puppy.status}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (<p className="text-sm text-gray-500 italic">No puppies listed yet.</p>)}
                                </div>
                            )}
                        </>
                    );
                })}

                {filteredLitters.length === 0 && activeLitters.length > 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-500">No litters match your filter criteria. Try adjusting your filters.</p>
                    </div>
                )}

                {activeLitters.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-500">No litters currently available.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

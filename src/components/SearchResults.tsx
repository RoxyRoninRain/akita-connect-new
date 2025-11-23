import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, Dog, MessageSquare, X } from 'lucide-react';

interface SearchResultsProps {
    query: string;
    onClose: () => void;
}

interface SearchData {
    users: any[];
    akitas: any[];
    posts: any[];
}

export const SearchResults = ({ query, onClose }: SearchResultsProps) => {
    const [results, setResults] = useState<SearchData | null>(null);
    const [loading, setLoading] = useState(false);
    const resultsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchResults = async () => {
            if (query.length < 2) {
                setResults(null);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                setResults(data);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchResults, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    if (!query || query.length < 2) return null;

    const hasResults = results && (results.users.length > 0 || results.akitas.length > 0 || results.posts.length > 0);

    return (
        <div ref={resultsRef} className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto z-50">
            <div className="p-2">
                <div className="flex justify-between items-center px-2 py-1 mb-2">
                    <span className="text-sm font-medium text-gray-700">Search Results</span>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {loading && (
                    <div className="text-center py-8 text-gray-500">Searching...</div>
                )}

                {!loading && !hasResults && (
                    <div className="text-center py-8 text-gray-500">No results found</div>
                )}

                {!loading && results && (
                    <>
                        {/* Users */}
                        {results.users.length > 0 && (
                            <div className="mb-4">
                                <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Users</h3>
                                {results.users.map((user) => (
                                    <Link
                                        key={user.id}
                                        to={`/profile/${user.id}`}
                                        onClick={onClose}
                                        className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-md"
                                    >
                                        <User className="h-5 w-5 text-gray-400" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {user.kennel_name || user.name}
                                            </p>
                                            {user.location && (
                                                <p className="text-xs text-gray-500">{user.location}</p>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Akitas */}
                        {results.akitas.length > 0 && (
                            <div className="mb-4">
                                <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Akitas</h3>
                                {results.akitas.map((akita) => (
                                    <Link
                                        key={akita.id}
                                        to={`/akita/${akita.id}`}
                                        onClick={onClose}
                                        className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-md"
                                    >
                                        {akita.images && akita.images.length > 0 ? (
                                            <img src={akita.images[0]} alt={akita.call_name} className="h-10 w-10 rounded-full object-cover" />
                                        ) : (
                                            <Dog className="h-5 w-5 text-gray-400" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {akita.call_name}
                                            </p>
                                            <p className="text-xs text-gray-500">{akita.registered_name}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Posts */}
                        {results.posts.length > 0 && (
                            <div className="mb-4">
                                <h3 className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">Posts</h3>
                                {results.posts.map((post) => (
                                    <Link
                                        key={post.id}
                                        to={`/`}
                                        onClick={onClose}
                                        className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-md"
                                    >
                                        <MessageSquare className="h-5 w-5 text-gray-400" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900 truncate">{post.content}</p>
                                            <p className="text-xs text-gray-500">by {post.author_name}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

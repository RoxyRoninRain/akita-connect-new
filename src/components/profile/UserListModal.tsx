import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FollowButton } from '../common/FollowButton';
import { useStore } from '../../context/StoreContext';

interface UserListModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    endpoint: string;
}

interface UserListItem {
    id: string;
    name: string;
    kennel_name?: string;
    avatar: string;
    location?: string;
    follower_id?: string;
    following_id?: string;
}

export const UserListModal = ({ isOpen, onClose, title, endpoint }: UserListModalProps) => {
    const { currentUser } = useStore();
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await fetch(endpoint);
                const data = await response.json();

                interface ProfileResponse {
                    id: string;
                    name: string;
                    kennel_name?: string;
                    avatar: string;
                    location?: string;
                }

                interface FollowResponse {
                    profiles?: ProfileResponse;
                    profile?: ProfileResponse;
                }

                const transformedUsers = data.map((item: FollowResponse) => {
                    const profile = item.profiles || item.profile;
                    if (!profile) return null;
                    return {
                        ...profile,
                        id: profile.id
                    };
                }).filter((u: UserListItem | null): u is UserListItem => u !== null);

                setUsers(transformedUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen, endpoint]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                </div>
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="mt-2 max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="text-center py-8">Loading...</div>
                            ) : users.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">No users found.</div>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <li key={user.id} className="py-4 flex items-center justify-between">
                                            <div className="flex items-center">
                                                <Link to={`/profile/${user.id}`} onClick={onClose}>
                                                    <img className="h-10 w-10 rounded-full object-cover" src={user.avatar} alt={user.name} />
                                                </Link>
                                                <div className="ml-3">
                                                    <Link to={`/profile/${user.id}`} onClick={onClose} className="text-sm font-medium text-gray-900 hover:underline">
                                                        {user.kennel_name || user.name}
                                                    </Link>
                                                    <p className="text-xs text-gray-500">{user.location || 'No location'}</p>
                                                </div>
                                            </div>
                                            {currentUser && currentUser.id !== user.id && (
                                                <FollowButton
                                                    userId={user.id}
                                                />
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import type { UserRole } from '../types';
import { MapPin, Calendar, Globe, Shield, Award, ChevronDown, ChevronUp, X, Upload, Plus, Heart, MessageSquare, Share2, Instagram, Facebook, Twitter } from 'lucide-react';
import { Lightbox } from '../components/common/Lightbox';
import { CreatePost } from '../components/feed/CreatePost';
import { ImageUpload } from '../components/ImageUpload';
import { FollowButton } from '../components/common/FollowButton';
import { UserListModal } from '../components/profile/UserListModal';
import clsx from 'clsx';

export const Profile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser, users, akitas, litters, posts, updateUser, addAkita, addLitter, toggleLike, addComment } = useStore();
    const [activeTab, setActiveTab] = useState<'feed' | 'overview' | 'kennel' | 'litters' | 'gallery'>('feed');

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImage, setLightboxImage] = useState('');

    // Expanded litters state
    const [expandedLitters, setExpandedLitters] = useState<Set<string>>(new Set());

    // Edit Profile Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        role: 'enthusiast' as UserRole,
        kennelName: '',
        bio: '',
        location: '',
        website: '',
        avatar: '',
        yearsOfExperience: 0,
        socialLinks: {
            instagram: '',
            facebook: '',
            twitter: ''
        }
    });

    // Add Akita Modal State
    const [isAddAkitaModalOpen, setIsAddAkitaModalOpen] = useState(false);
    const [addAkitaForm, setAddAkitaForm] = useState({
        registeredName: '',
        callName: '',
        dob: '',
        gender: 'male' as 'male' | 'female',
        color: '',
        bio: '',
        images: [] as string[]
    });

    // Add Litter Modal State
    const [isAddLitterModalOpen, setIsAddLitterModalOpen] = useState(false);
    const [addLitterForm, setAddLitterForm] = useState({
        sireId: '',
        damId: '',
        dob: '',
        status: 'Available',
        price: 0,
        description: '',
        images: [] as string[]
    });

    // Feed Interaction State
    const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
    const [commentContent, setCommentContent] = useState('');
    const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
    const coverPhotoInputRef = useRef<HTMLInputElement>(null);

    // Following state
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    // User List Modal State
    const [userListModalOpen, setUserListModalOpen] = useState(false);
    const [userListModalType, setUserListModalType] = useState<'followers' | 'following'>('followers');

    // If no ID is provided, show current user's profile
    const profileId = id || currentUser?.id;
    const user = users.find(u => u.id === profileId);

    // Check if current user is following this profile
    useEffect(() => {
        if (!user) return;

        const checkFollowing = async () => {
            if (currentUser && user.id !== currentUser.id) {
                try {
                    const response = await fetch(`http://localhost:3000/api/follows/${user.id}/is-following?followerId=${currentUser.id}`);
                    const data = await response.json();
                    setIsFollowing(data.isFollowing);
                } catch (error) {
                    console.error('Error checking follow status:', error);
                }
            }
        };
        checkFollowing();
        setFollowersCount(user.followers_count || 0);
        setFollowingCount(user.following_count || 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, currentUser]);

    if (!user) {
        return <div className="text-center py-12">User not found</div>;
    }

    const userDogs = akitas.filter(dog => dog.ownerId === user.id);
    const userLitters = litters.filter(litter => litter.breederId === user.id);
    const userPosts = posts.filter(post => post.authorId === user.id);

    const openUserList = (type: 'followers' | 'following') => {
        setUserListModalType(type);
        setUserListModalOpen(true);
    };

    const isBreeder = user.role === 'breeder';
    const isOwnProfile = currentUser?.id === user.id;

    // Aggregate images for gallery: User's uploaded gallery + Dog images
    const galleryImages = [
        ...(user.gallery || []),
        ...userDogs.flatMap(dog => dog.images)
    ];

    const toggleLitter = (litterId: string) => {
        const newExpanded = new Set(expandedLitters);
        if (newExpanded.has(litterId)) {
            newExpanded.delete(litterId);
        } else {
            newExpanded.add(litterId);
        }
        setExpandedLitters(newExpanded);
    };

    const openLightbox = (image: string) => {
        setLightboxImage(image);
        setLightboxOpen(true);
    };

    const handleEditClick = () => {
        setEditForm({
            name: user.name,
            role: user.role,
            kennelName: user.kennelName || '',
            bio: user.bio || '',
            location: user.location || '',
            website: user.website || '',
            avatar: user.avatar || '',
            yearsOfExperience: user.yearsOfExperience || 0,
            socialLinks: {
                instagram: user.socialLinks?.instagram || '',
                facebook: user.socialLinks?.facebook || '',
                twitter: user.socialLinks?.twitter || ''
            }
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentUser) {
            updateUser(currentUser.id, editForm);
            setIsEditModalOpen(false);
        }
    };

    const handleAddAkitaSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentUser) {
            addAkita({
                ...addAkitaForm,
                ownerId: currentUser.id,
                titles: [],
                healthRecords: [],
                achievements: [],
                images: addAkitaForm.images
            });
            setIsAddAkitaModalOpen(false);
            setAddAkitaForm({
                registeredName: '',
                callName: '',
                dob: '',
                gender: 'male',
                color: '',
                bio: '',
                images: []
            });
        }
    };

    const handleAddLitterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentUser) {
            addLitter({
                ...addLitterForm,
                breederId: currentUser.id,
                puppies: [],
                approvalStatus: 'pending',
                location: user?.location || 'Unknown',
                status: addLitterForm.status as 'Available' | 'Expecting' | 'Reserved' | 'Sold'
            });
            setIsAddLitterModalOpen(false);
            setAddLitterForm({
                sireId: '',
                damId: '',
                dob: '',
                status: 'Available',
                price: 0,
                description: '',
                images: []
            });
        }
    };

    const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newImage = reader.result as string;
                const currentGallery = user.gallery || [];
                updateUser(user.id, { gallery: [newImage, ...currentGallery] });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCoverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('Cover photo upload triggered');
        const file = e.target.files?.[0];
        if (file) {
            console.log('File selected:', file.name);
            const reader = new FileReader();
            reader.onloadend = () => {
                const newCoverPhoto = reader.result as string;
                console.log('Updating user with cover photo');
                updateUser(user.id, { coverPhoto: newCoverPhoto });
            };
            reader.readAsDataURL(file);
        } else {
            console.log('No file selected');
        }
    };

    const handleCommentSubmit = (e: React.FormEvent, postId: string) => {
        e.preventDefault();
        if (commentContent.trim()) {
            addComment(postId, commentContent);
            setCommentContent('');
        }
    };

    const handleShare = async (postId: string) => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({ title: 'Akita Connect', text: 'Check out this post!', url });
                return;
            } catch (err) { if ((err as Error).name === 'AbortError') return; }
        }
        try {
            await navigator.clipboard.writeText(url);
            setCopiedPostId(postId);
            setTimeout(() => setCopiedPostId(null), 2000);
        } catch {
            alert('Failed to copy link.');
        }
    };

    const getUser = (id: string) => users.find(u => u.id === id);

    return (
        <div className="max-w-5xl mx-auto">
            <Lightbox
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                imageSrc={lightboxImage}
            />

            <UserListModal
                isOpen={userListModalOpen}
                onClose={() => setUserListModalOpen(false)}
                title={userListModalType === 'followers' ? 'Followers' : 'Following'}
                endpoint={`/api/follows/${user.id}/${userListModalType}`}
            />

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsEditModalOpen(false)}></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Profile</h3>
                                    <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                                <form onSubmit={handleEditSubmit}>
                                    <div className="space-y-4">
                                        <div className="flex justify-center">
                                            <ImageUpload
                                                currentImage={editForm.avatar}
                                                onUpload={(url) => setEditForm({ ...editForm, avatar: url })}
                                                label="Upload Avatar"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Name</label>
                                            <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Profile Type</label>
                                            <select
                                                value={editForm.role}
                                                onChange={(e) => setEditForm({ ...editForm, role: e.target.value as UserRole })}
                                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                            >
                                                <option value="enthusiast">Enthusiast - I love Akitas and want to learn more</option>
                                                <option value="owner">Owner - I own an Akita</option>
                                                <option value="breeder">Breeder - I breed Akitas</option>
                                                <option value="moderator">Moderator</option>
                                            </select>
                                            <p className="mt-1 text-xs text-gray-500">Change your profile type as your role evolves</p>
                                        </div>
                                        {editForm.role === 'breeder' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Kennel Name</label>
                                                <input type="text" value={editForm.kennelName} onChange={(e) => setEditForm({ ...editForm, kennelName: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Bio</label>
                                            <textarea rows={3} value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Location</label>
                                            <input type="text" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Website</label>
                                            <input type="text" value={editForm.website} onChange={(e) => setEditForm({ ...editForm, website: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                                            <input type="number" value={editForm.yearsOfExperience} onChange={(e) => setEditForm({ ...editForm, yearsOfExperience: parseInt(e.target.value) || 0 })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Instagram</label>
                                                <input type="text" placeholder="@username" value={editForm.socialLinks.instagram} onChange={(e) => setEditForm({ ...editForm, socialLinks: { ...editForm.socialLinks, instagram: e.target.value } })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Facebook</label>
                                                <input type="text" placeholder="username" value={editForm.socialLinks.facebook} onChange={(e) => setEditForm({ ...editForm, socialLinks: { ...editForm.socialLinks, facebook: e.target.value } })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Twitter</label>
                                                <input type="text" placeholder="@username" value={editForm.socialLinks.twitter} onChange={(e) => setEditForm({ ...editForm, socialLinks: { ...editForm.socialLinks, twitter: e.target.value } })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:mt-6">
                                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-primary text-base font-medium text-white hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary sm:text-sm">
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Akita Modal */}
            {isAddAkitaModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsAddAkitaModalOpen(false)}></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Akita</h3>
                                    <button onClick={() => setIsAddAkitaModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                                <form onSubmit={handleAddAkitaSubmit}>
                                    <div className="space-y-4">
                                        <div className="flex justify-center">
                                            <ImageUpload
                                                onUpload={(url) => setAddAkitaForm({ ...addAkitaForm, images: [url] })}
                                                label="Upload Photo"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Call Name</label>
                                            <input type="text" required value={addAkitaForm.callName} onChange={(e) => setAddAkitaForm({ ...addAkitaForm, callName: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Registered Name</label>
                                            <input type="text" required value={addAkitaForm.registeredName} onChange={(e) => setAddAkitaForm({ ...addAkitaForm, registeredName: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                                <input type="date" required value={addAkitaForm.dob} onChange={(e) => setAddAkitaForm({ ...addAkitaForm, dob: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Gender</label>
                                                <select value={addAkitaForm.gender} onChange={(e) => setAddAkitaForm({ ...addAkitaForm, gender: e.target.value as 'male' | 'female' })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Color</label>
                                            <input type="text" required value={addAkitaForm.color} onChange={(e) => setAddAkitaForm({ ...addAkitaForm, color: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Bio</label>
                                            <textarea rows={3} value={addAkitaForm.bio} onChange={(e) => setAddAkitaForm({ ...addAkitaForm, bio: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:mt-6">
                                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-primary text-base font-medium text-white hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary sm:text-sm">
                                            Add Akita
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Litter Modal */}
            {isAddLitterModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsAddLitterModalOpen(false)}></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">Add New Litter</h3>
                                    <button onClick={() => setIsAddLitterModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                                <form onSubmit={handleAddLitterSubmit}>
                                    <div className="space-y-4">
                                        <div className="flex justify-center">
                                            <ImageUpload
                                                onUpload={(url) => setAddLitterForm({ ...addLitterForm, images: [url] })}
                                                label="Upload Photo"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Sire</label>
                                                <select required value={addLitterForm.sireId} onChange={(e) => setAddLitterForm({ ...addLitterForm, sireId: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                                                    <option value="">Select Sire</option>
                                                    {userDogs.filter(d => d.gender === 'male').map(d => (
                                                        <option key={d.id} value={d.id}>{d.callName}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Dam</label>
                                                <select required value={addLitterForm.damId} onChange={(e) => setAddLitterForm({ ...addLitterForm, damId: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                                                    <option value="">Select Dam</option>
                                                    {userDogs.filter(d => d.gender === 'female').map(d => (
                                                        <option key={d.id} value={d.id}>{d.callName}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Whelp Date</label>
                                            <input type="date" required value={addLitterForm.dob} onChange={(e) => setAddLitterForm({ ...addLitterForm, dob: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Status</label>
                                            <select value={addLitterForm.status} onChange={(e) => setAddLitterForm({ ...addLitterForm, status: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                                                <option value="Available">Available</option>
                                                <option value="Expecting">Expecting</option>
                                                <option value="Reserved">Reserved</option>
                                                <option value="Sold">Sold</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Price</label>
                                            <input type="number" value={addLitterForm.price} onChange={(e) => setAddLitterForm({ ...addLitterForm, price: parseInt(e.target.value) || 0 })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Description</label>
                                            <textarea rows={3} value={addLitterForm.description} onChange={(e) => setAddLitterForm({ ...addLitterForm, description: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:mt-6">
                                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-primary text-base font-medium text-white hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary sm:text-sm">
                                            Add Litter
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                <div className="h-48 relative bg-brand-primary/10 overflow-hidden">
                    {user.coverPhoto ? (
                        <img src={user.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-brand-secondary opacity-75"></div>
                    )}
                    {isOwnProfile && (
                        <>
                            <button
                                onClick={() => coverPhotoInputRef.current?.click()}
                                className="absolute bottom-4 right-4 z-10 cursor-pointer bg-brand-primary hover:bg-brand-secondary text-white px-4 py-2 rounded-md shadow-lg text-sm font-medium inline-flex items-center space-x-2 transition-colors"
                            >
                                <Upload className="h-4 w-4" />
                                <span>{user.coverPhoto ? 'Change Cover' : 'Upload Cover'}</span>
                            </button>
                            <input
                                ref={coverPhotoInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleCoverPhotoUpload}
                            />
                        </>
                    )}
                </div>
                <div className="relative px-4 sm:px-6 lg:px-8 pb-6">
                    <div className="-mt-16 flex items-end space-x-5">
                        <div className="relative">
                            <img className="h-32 w-32 rounded-full ring-4 ring-white bg-white object-cover" src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt={user.name} />
                            {isBreeder && (
                                <span className="absolute bottom-0 right-0 block h-8 w-8 rounded-full bg-brand-secondary text-white flex items-center justify-center ring-2 ring-white" title="Breeder">
                                    <Shield className="h-5 w-5" />
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 pt-16">
                            <h1 className="text-2xl font-bold text-gray-900 truncate">{user.kennelName || user.name}</h1>
                            <p className="text-sm text-gray-500">{user.role === 'breeder' ? `Breeder • ${user.name}` : 'Akita Owner'}</p>
                            <div className="flex items-center space-x-6 mt-2">
                                <button onClick={() => openUserList('followers')} className="text-sm hover:text-brand-primary transition-colors">
                                    <span className="font-semibold text-gray-900">{followersCount}</span>
                                    <span className="text-gray-500"> Followers</span>
                                </button>
                                <button onClick={() => openUserList('following')} className="text-sm hover:text-brand-primary transition-colors">
                                    <span className="font-semibold text-gray-900">{followingCount}</span>
                                    <span className="text-gray-500"> Following</span>
                                </button>
                            </div>
                        </div>
                        <div className="mt-6 flex flex-col justify-stretch space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 ml-4">
                            {isOwnProfile ? (
                                <button onClick={handleEditClick} className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                                    Edit Profile
                                </button>
                            ) : (
                                <>
                                    <FollowButton
                                        userId={user.id}
                                        initialIsFollowing={isFollowing}
                                        onToggle={(newIsFollowing) => {
                                            setIsFollowing(newIsFollowing);
                                            setFollowersCount(prev => newIsFollowing ? prev + 1 : Math.max(0, prev - 1));
                                        }}
                                    />
                                    <button onClick={() => navigate('/messages')} className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                                        Message
                                    </button>
                                    <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Profile link copied to clipboard!'); }} className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                                        Share
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-t border-gray-200">
                    <nav className="-mb-px flex px-8 space-x-8" aria-label="Tabs">
                        {(['feed', 'overview', 'kennel', 'litters', 'gallery'] as const).map((tab) => {
                            if (tab === 'litters' && !isBreeder) return null;
                            return (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={clsx(
                                        activeTab === tab ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                                        'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize'
                                    )}
                                >
                                    {tab}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Content */}
            < div className="space-y-6" >
                {activeTab === 'feed' && (
                    <div className="max-w-3xl mx-auto">
                        {isOwnProfile && <CreatePost />}
                        <div className="space-y-6">
                            {userPosts.length > 0 ? (
                                userPosts.map(post => {
                                    const author = getUser(post.authorId);
                                    if (!author) return null;
                                    const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
                                    return (
                                        <div key={post.id} className="bg-white rounded-lg shadow">
                                            <div className="p-4">
                                                <div className="flex items-center space-x-3 mb-4">
                                                    <Link to={`/profile/${author.id}`}>
                                                        <img className="h-10 w-10 rounded-full object-cover" src={author.avatar || `https://ui-avatars.com/api/?name=${author.name}&background=random`} alt={author.name} />
                                                    </Link>
                                                    <div>
                                                        <Link to={`/profile/${author.id}`} className="text-sm font-medium text-gray-900 hover:underline">{author.name}</Link>
                                                        <p className="text-xs text-gray-500">{new Date(post.timestamp).toLocaleDateString()} at {new Date(post.timestamp).toLocaleTimeString()}</p>
                                                    </div>
                                                </div>
                                                <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.content}</p>
                                                {post.images && post.images.length > 0 && (
                                                    <div className="mb-4">
                                                        <img src={post.images[0]} alt="Post content" className="rounded-lg w-full object-cover max-h-96" />
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between border-t pt-4">
                                                    <button onClick={() => toggleLike(post.id)} className={`flex items-center space-x-2 ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-brand-primary'}`}>
                                                        <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                                                        <span>{post.likes.length} Likes</span>
                                                    </button>
                                                    <button onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)} className="flex items-center text-gray-500 hover:text-brand-primary space-x-2">
                                                        <MessageSquare className="h-5 w-5" />
                                                        <span>{post.comments.length} Comments</span>
                                                    </button>
                                                    <button onClick={() => handleShare(post.id)} className={`flex items-center space-x-2 ${copiedPostId === post.id ? 'text-green-600' : 'text-gray-500 hover:text-brand-primary'}`}>
                                                        <Share2 className="h-5 w-5" />
                                                        <span>{copiedPostId === post.id ? 'Copied!' : 'Share'}</span>
                                                    </button>
                                                </div>
                                                {activeCommentPostId === post.id && (
                                                    <div className="mt-4 border-t pt-4 space-y-4">
                                                        {post.comments.map(comment => {
                                                            const commentAuthor = getUser(comment.authorId);
                                                            return (
                                                                <div key={comment.id} className="flex space-x-3">
                                                                    <img className="h-8 w-8 rounded-full object-cover" src={commentAuthor?.avatar || `https://ui-avatars.com/api/?name=${commentAuthor?.name}&background=random`} alt={commentAuthor?.name} />
                                                                    <div className="bg-gray-50 rounded-lg p-3 flex-1">
                                                                        <p className="text-sm font-medium text-gray-900">{commentAuthor?.name}</p>
                                                                        <p className="text-sm text-gray-700">{comment.content}</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                        {currentUser && (
                                                            <form onSubmit={(e) => handleCommentSubmit(e, post.id)} className="flex space-x-3">
                                                                <img className="h-8 w-8 rounded-full object-cover" src={currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}&background=random`} alt={currentUser.name} />
                                                                <div className="flex-1 flex space-x-2">
                                                                    <input type="text" value={commentContent} onChange={(e) => setCommentContent(e.target.value)} placeholder="Write a comment..." className="flex-1 border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary text-sm" />
                                                                    <button type="submit" disabled={!commentContent.trim()} className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-secondary disabled:opacity-50">Post</button>
                                                                </div>
                                                            </form>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">No posts yet.</div>
                            )}
                        </div>
                    </div>
                )}

                {
                    activeTab === 'overview' && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">About</h3>
                            <div className="prose max-w-none text-gray-500 mb-6">
                                <p>{user.bio || "No bio provided yet."}</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {user.location && (
                                    <div className="flex items-center text-gray-500">
                                        <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                                        {user.location}
                                    </div>
                                )}
                                <div className="flex items-center text-gray-500">
                                    <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                                    Joined {new Date(user.joinedDate).toLocaleDateString()}
                                </div>
                                {user.website && (
                                    <div className="flex items-center text-gray-500">
                                        <Globe className="h-5 w-5 mr-2 text-gray-400" />
                                        <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
                                            {user.website.replace(/^https?:\/\//, '')}
                                        </a>
                                    </div>
                                )}
                                {user.yearsOfExperience && (
                                    <div className="flex items-center text-gray-500">
                                        <Award className="h-5 w-5 mr-2 text-gray-400" />
                                        {user.yearsOfExperience} Years Experience
                                    </div>
                                )}
                            </div>
                            {user.socialLinks && (
                                <div className="mt-6 border-t pt-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">Social Media</h4>
                                    <div className="flex space-x-4">
                                        {user.socialLinks.instagram && (
                                            <a href={`https://instagram.com/${user.socialLinks.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600">
                                                <Instagram className="h-6 w-6" />
                                            </a>
                                        )}
                                        {user.socialLinks.facebook && (
                                            <a href={`https://facebook.com/${user.socialLinks.facebook}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600">
                                                <Facebook className="h-6 w-6" />
                                            </a>
                                        )}
                                        {user.socialLinks.twitter && (
                                            <a href={`https://twitter.com/${user.socialLinks.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400">
                                                <Twitter className="h-6 w-6" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                }

                {
                    activeTab === 'kennel' && (
                        <div>
                            {isOwnProfile && (
                                <div className="mb-6 bg-white p-4 rounded-lg shadow flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">My Kennel</h3>
                                    <button onClick={() => setIsAddAkitaModalOpen(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-secondary">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Akita
                                    </button>
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {userDogs.map(dog => (
                                    <Link key={dog.id} to={`/akitas/${dog.id}`} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
                                        <div className="aspect-w-3 aspect-h-2">
                                            <img src={dog.images[0] || "/default-dog.png"} alt={dog.callName} className="w-full h-48 object-cover" />
                                        </div>
                                        <div className="p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900">{dog.callName}</h3>
                                                    <p className="text-sm text-gray-500 truncate">{dog.registeredName}</p>
                                                </div>
                                                {dog.titles.length > 0 && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        <Award className="h-3 w-3 mr-1" />
                                                        {dog.titles[0]}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-2 flex items-center text-sm text-gray-500">
                                                <span className="capitalize">{dog.gender}</span>
                                                <span className="mx-2">•</span>
                                                <span>{new Date().getFullYear() - new Date(dog.dob).getFullYear()} years</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                {userDogs.length === 0 && (
                                    <div className="col-span-full text-center py-12 text-gray-500">
                                        No dogs listed yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                }

                {
                    activeTab === 'litters' && (
                        <div className="space-y-6">
                            {isOwnProfile && isBreeder && (
                                <div className="mb-6 bg-white p-4 rounded-lg shadow flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">My Litters</h3>
                                    <button onClick={() => setIsAddLitterModalOpen(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-secondary">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Litter
                                    </button>
                                </div>
                            )}
                            {userLitters.map(litter => (
                                <div key={litter.id} className="bg-white rounded-lg shadow overflow-hidden">
                                    <div className="flex flex-col sm:flex-row">
                                        <div className="sm:w-48 h-48 sm:h-auto relative">
                                            <img src={litter.images[0] || "https://images.unsplash.com/photo-1591160690555-5debfba289f0?auto=format&fit=crop&q=80&w=400"} alt="Litter" className="w-full h-full object-cover" />
                                            <div className="absolute top-0 left-0 m-2">
                                                <span className={clsx("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", litter.status === 'Available' ? "bg-green-100 text-green-800" : litter.status === 'Expecting' ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800")}>
                                                    {litter.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="p-6 flex-1">
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Whelp Date: {new Date(litter.dob).toLocaleDateString()}</h3>
                                            <p className="text-gray-600 mb-4">{litter.description}</p>
                                            <div className="flex space-x-4">
                                                <button onClick={() => toggleLitter(litter.id)} className="text-brand-primary font-medium hover:text-brand-secondary flex items-center">
                                                    {expandedLitters.has(litter.id) ? (<>Hide Puppies <ChevronUp className="ml-1 h-4 w-4" /></>) : (<>View Puppies ({litter.puppies.length}) <ChevronDown className="ml-1 h-4 w-4" /></>)}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {expandedLitters.has(litter.id) && (
                                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                            {litter.puppies.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                                    {litter.puppies.map(puppy => (
                                                        <div key={puppy.id} className="bg-white p-3 rounded border border-gray-200 flex items-center space-x-3">
                                                            <div className="h-12 w-12 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
                                                                <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">Pup</div>
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
                                </div>
                            ))}
                            {userLitters.length === 0 && <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow">No litters listed.</div>}
                        </div>
                    )
                }

                {
                    activeTab === 'gallery' && (
                        <div>
                            {isOwnProfile && (
                                <div className="mb-6 bg-white p-4 rounded-lg shadow flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">My Gallery</h3>
                                    <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-secondary cursor-pointer">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Photo
                                        <input type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} />
                                    </label>
                                </div>
                            )}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {galleryImages.map((image, index) => (
                                    <div key={index} className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" onClick={() => openLightbox(image)}>
                                        <img src={image} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                {galleryImages.length === 0 && <div className="col-span-full text-center py-12 text-gray-500">No images available.</div>}
                            </div>
                        </div>
                    )
                }
            </div >
        </div >
    );
};

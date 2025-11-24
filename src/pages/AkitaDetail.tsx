import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Edit, Share2, Plus, Upload, Trash2, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { akitaApi, healthApi } from '../api/client';
import { Lightbox } from '../components/common/Lightbox';
import { PedigreeTree } from '../components/PedigreeTree';
import { HealthRecordForm } from '../components/HealthRecordForm';
import { ImageUpload } from '../components/ImageUpload';
import { PhotoGallery } from '../components/PhotoGallery';
import clsx from 'clsx';

export const AkitaDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { akitas, users, currentUser, updateAkita, addAkita } = useStore();
    const [activeTab, setActiveTab] = useState<'about' | 'pedigree' | 'health' | 'gallery'>('about');

    // Pedigree state
    const [pedigreeData, setPedigreeData] = useState<any>(null);
    const [loadingPedigree, setLoadingPedigree] = useState(false);

    // Health Record state
    const [healthFormOpen, setHealthFormOpen] = useState(false);
    const [healthFormMode, setHealthFormMode] = useState<'add' | 'edit'>('add');
    const [editingHealthRecord, setEditingHealthRecord] = useState<any>(null);

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImage, setLightboxImage] = useState('');

    // Edit Modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        callName: '',
        registeredName: '',
        bio: '',
        dob: '',
        gender: 'male' as 'male' | 'female',
        color: '',
        images: [] as string[]
    });

    // Add Ancestor Modal state
    const [isAddAncestorModalOpen, setIsAddAncestorModalOpen] = useState(false);
    const [ancestorType, setAncestorType] = useState<'sire' | 'dam'>('sire');
    const [ancestorForm, setAncestorForm] = useState({
        registeredName: '',
        callName: '',
        registrationNumber: '',
        gender: 'male' as 'male' | 'female',
        titles: '',
        color: '',
        dob: ''
    });

    const dog = akitas.find((d: any) => d.id === id);
    const owner = users.find((u: any) => u.id === dog?.ownerId);

    if (!dog) {
        return <div className="text-center py-12">Akita not found</div>;
    }

    // Fetch pedigree data when pedigree tab is active
    useEffect(() => {
        if (activeTab === 'pedigree' && !pedigreeData && dog?.id) {
            setLoadingPedigree(true);
            akitaApi.getPedigree(dog.id)
                .then((data: any) => setPedigreeData(data))
                .catch((err: any) => console.error('Failed to load pedigree:', err))
                .finally(() => setLoadingPedigree(false));
        }
    }, [activeTab, dog?.id, pedigreeData]);

    const openLightbox = (image: string) => {
        setLightboxImage(image);
        setLightboxOpen(true);
    };

    const handleEditClick = () => {
        setEditForm({
            callName: dog.callName,
            registeredName: dog.registeredName,
            bio: dog.bio || '',
            dob: dog.dob,
            gender: dog.gender,
            color: dog.color,
            images: dog.images || []
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateAkita(dog.id, editForm);
        setIsEditModalOpen(false);
    };

    const handleAddAncestorClick = (type: 'sire' | 'dam') => {
        setAncestorType(type);
        setAncestorForm({
            registeredName: '',
            callName: '',
            registrationNumber: '',
            gender: type === 'sire' ? 'male' : 'female',
            titles: '',
            color: '',
            dob: ''
        });
        setIsAddAncestorModalOpen(true);
    };

    const handleAncestorSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Create new Akita for ancestor
        const newAncestorData = {
            registeredName: ancestorForm.registeredName,
            callName: ancestorForm.callName,
            registrationNumber: ancestorForm.registrationNumber,
            gender: ancestorForm.gender,
            color: ancestorForm.color,
            dob: ancestorForm.dob,
            ownerId: dog.ownerId, // Same owner
            titles: ancestorForm.titles ? ancestorForm.titles.split(',').map((t: string) => t.trim()) : [],
            achievements: [],
            healthRecords: [],
            images: []
        };

        try {
            // Add ancestor to store and get the created object with real ID
            const createdAncestor = await addAkita(newAncestorData);

            if (createdAncestor) {
                if (ancestorType === 'sire') {
                    updateAkita(dog.id, { sireId: createdAncestor.id });
                } else {
                    updateAkita(dog.id, { damId: createdAncestor.id });
                }
            }

            setIsAddAncestorModalOpen(false);
        } catch (error) {
            console.error("Failed to add ancestor:", error);
            alert("Failed to add ancestor. Please try again.");
        }
    };

    const handlePedigreeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateAkita(dog.id, { pedigreeImage: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeletePhoto = (imageUrl: string) => {
        const updatedImages = dog.images.filter((img: string) => img !== imageUrl);
        updateAkita(dog.id, { images: updatedImages });
    };

    const handleAddHealthRecord = () => {
        setHealthFormMode('add');
        setEditingHealthRecord(null);
        setHealthFormOpen(true);
    };

    const handleEditHealthRecord = (record: any) => {
        setHealthFormMode('edit');
        setEditingHealthRecord(record);
        setHealthFormOpen(true);
    };

    const handleHealthRecordSubmit = async (recordData: any) => {
        try {
            if (healthFormMode === 'add') {
                await healthApi.addRecord(dog.id, recordData);
            } else if (editingHealthRecord) {
                await healthApi.updateRecord(dog.id, editingHealthRecord.id, recordData);
            }
            // Refresh akita data
            const updated = await akitaApi.getById(dog.id);
            updateAkita(dog.id, updated);
            setHealthFormOpen(false);
        } catch (error) {
            console.error('Failed to save health record:', error);
            alert('Failed to save health record');
        }
    };

    const handleDeleteHealthRecord = async (recordId: string) => {
        if (!confirm('Are you sure you want to delete this health record?')) return;
        try {
            await healthApi.deleteRecord(dog.id, recordId);
            // Refresh akita data
            const updated = await akitaApi.getById(dog.id);
            updateAkita(dog.id, updated);
        } catch (error) {
            console.error('Failed to delete health record:', error);
            alert('Failed to delete health record');
        }
    };



    return (
        <div className="max-w-5xl mx-auto">
            <Lightbox
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                imageSrc={lightboxImage}
            />

            {/* Edit Akita Modal */}
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
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Akita</h3>
                                    <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                                <form onSubmit={handleEditSubmit}>
                                    <div className="space-y-4">
                                        <div className="flex justify-center">
                                            <ImageUpload
                                                currentImage={editForm.images[0]}
                                                onUpload={(url) => setEditForm({ ...editForm, images: [url, ...editForm.images] })}
                                                label="Update Profile Photo"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Call Name</label>
                                            <input type="text" required value={editForm.callName} onChange={(e) => setEditForm({ ...editForm, callName: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Registered Name</label>
                                            <input type="text" required value={editForm.registeredName} onChange={(e) => setEditForm({ ...editForm, registeredName: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                                <input type="date" required value={editForm.dob} onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Gender</label>
                                                <select value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as 'male' | 'female' })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Color</label>
                                            <input type="text" required value={editForm.color} onChange={(e) => setEditForm({ ...editForm, color: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Bio</label>
                                            <textarea rows={3} value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
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

            {/* Add Ancestor Modal */}
            {isAddAncestorModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsAddAncestorModalOpen(false)}></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                                        Add {ancestorType === 'sire' ? 'Sire' : 'Dam'}
                                    </h3>
                                    <button onClick={() => setIsAddAncestorModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>
                                <form onSubmit={handleAncestorSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Registered Name *</label>
                                            <input type="text" required value={ancestorForm.registeredName} onChange={(e) => setAncestorForm({ ...ancestorForm, registeredName: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Call Name *</label>
                                            <input type="text" required value={ancestorForm.callName} onChange={(e) => setAncestorForm({ ...ancestorForm, callName: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                                            <input type="text" placeholder="e.g., AKC WS12345" value={ancestorForm.registrationNumber} onChange={(e) => setAncestorForm({ ...ancestorForm, registrationNumber: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                                <input type="date" value={ancestorForm.dob} onChange={(e) => setAncestorForm({ ...ancestorForm, dob: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Color</label>
                                                <input type="text" value={ancestorForm.color} onChange={(e) => setAncestorForm({ ...ancestorForm, color: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Titles (comma-separated)</label>
                                            <input type="text" placeholder="CH, GCH, etc." value={ancestorForm.titles} onChange={(e) => setAncestorForm({ ...ancestorForm, titles: e.target.value })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
                                        </div>
                                    </div>
                                    <div className="mt-5 sm:mt-6">
                                        <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-primary text-base font-medium text-white hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary sm:text-sm">
                                            Add {ancestorType === 'sire' ? 'Sire' : 'Dam'}
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
                <div className="h-64 relative">
                    <img
                        src={dog.images[0] || "https://images.unsplash.com/photo-1563460716037-460a3ad24dd9?auto=format&fit=crop&q=80&w=1200"}
                        alt={dog.registeredName}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => dog.images[0] && openLightbox(dog.images[0])}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                        <div className="flex items-center space-x-2 mb-2">
                            {dog.titles.map((title: string) => (
                                <span key={title} className="bg-yellow-500/80 px-2 py-0.5 rounded text-xs font-bold backdrop-blur-sm">
                                    {title}
                                </span>
                            ))}
                        </div>
                        <h1 className="text-3xl font-bold">{dog.registeredName}</h1>
                        <p className="text-lg opacity-90">"{dog.callName}"</p>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Link to={`/profile/${owner?.id}`} className="flex items-center space-x-2 group">
                            <img src={owner?.avatar} alt={owner?.name} className="h-8 w-8 rounded-full" />
                            <span className="text-sm font-medium text-gray-700 group-hover:text-brand-primary">
                                Owned by {owner?.name}
                            </span>
                        </Link>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                alert('Link copied to clipboard!');
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </button>
                        {currentUser?.id === dog.ownerId && (
                            <button
                                onClick={handleEditClick}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-t border-gray-200">
                    <nav className="-mb-px flex px-8 space-x-8">
                        {['about', 'pedigree', 'health', 'gallery'].map((tab: string) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={clsx(
                                    activeTab === tab
                                        ? 'border-brand-primary text-brand-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                                    'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize'
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
                {activeTab === 'about' && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Bio</h3>
                                <p className="text-gray-600 whitespace-pre-wrap">{dog.bio}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Details</h3>
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{new Date(dog.dob).toLocaleDateString()}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Gender</dt>
                                        <dd className="mt-1 text-sm text-gray-900 capitalize">{dog.gender}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Color</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{dog.color}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Achievements</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {dog.achievements.length > 0 ? dog.achievements.join(', ') : 'None listed'}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'pedigree' && (
                    <div className="space-y-6">
                        {/* Pedigree Actions */}
                        {currentUser?.id === dog.ownerId && (
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => handleAddAncestorClick('sire')}
                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Sire
                                </button>
                                <button
                                    onClick={() => handleAddAncestorClick('dam')}
                                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Dam
                                </button>
                            </div>
                        )}

                        {/* Pedigree Image Upload */}
                        {currentUser?.id === dog.ownerId && (
                            <div className="bg-white shadow rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium text-gray-900">Pedigree Certificate</h3>
                                    <label className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload Image
                                        <input type="file" accept="image/*" className="hidden" onChange={handlePedigreeImageUpload} />
                                    </label>
                                </div>
                                {dog.pedigreeImage && (
                                    <div className="mt-4">
                                        <img
                                            src={dog.pedigreeImage}
                                            alt="Pedigree Certificate"
                                            className="max-w-full h-auto rounded-lg cursor-pointer border border-gray-200"
                                            onClick={() => openLightbox(dog.pedigreeImage!)}
                                        />
                                        <p className="text-xs text-gray-500 mt-2">Click image to view full size. Interactive pedigree tree below.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Interactive Pedigree Tree */}
                        <div className="bg-white shadow rounded-lg p-6">
                            {loadingPedigree ? (
                                <div className="text-center py-12 text-gray-500">
                                    Loading pedigree...
                                </div>
                            ) : pedigreeData ? (
                                <PedigreeTree akita={pedigreeData} />
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    No pedigree data available.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'health' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-medium text-gray-900">Health Records</h3>
                                <a href="https://www.ofa.org/" target="_blank" rel="noopener noreferrer" className="text-sm text-brand-primary hover:underline">
                                    Visit OFA Website
                                </a>
                            </div>
                            {currentUser?.id === dog.ownerId && (
                                <button onClick={handleAddHealthRecord} className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Health Record
                                </button>
                            )}
                        </div>

                        {/* Health Record Form Modal */}
                        <HealthRecordForm
                            isOpen={healthFormOpen}
                            onClose={() => setHealthFormOpen(false)}
                            onSubmit={handleHealthRecordSubmit}
                            initialData={editingHealthRecord}
                            mode={healthFormMode}
                        />
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Test
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Result
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Certificate
                                        </th>
                                        {currentUser?.id === dog.ownerId && (
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {dog.healthRecords.map((record: any, idx: number) => (
                                        <tr key={idx}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {record.type}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={clsx(
                                                    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                                                    record.result.includes('Excellent') || record.result.includes('Normal') || record.result.includes('Clear')
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                )}>
                                                    {record.result}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(record.date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {record.certificateImage ? (
                                                    <a href={record.certificateImage} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:text-brand-secondary hover:underline">
                                                        View
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 cursor-not-allowed" title="No certificate uploaded">No file</span>
                                                )}
                                            </td>
                                            {currentUser?.id === dog.ownerId && (
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => handleEditHealthRecord(record)}
                                                        className="text-brand-primary hover:text-brand-secondary mr-4"
                                                    >
                                                        <Edit className="h-4 w-4 inline" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteHealthRecord(record.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 className="h-4 w-4 inline" />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {dog.healthRecords.length === 0 && (
                                        <tr>
                                            <td colSpan={currentUser?.id === dog.ownerId ? 5 : 4} className="px-6 py-4 text-center text-sm text-gray-500">
                                                No health records available.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'gallery' && (
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Photo Gallery</h3>
                            {currentUser?.id === dog.ownerId && (
                                <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-secondary cursor-pointer">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Photos
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            files.forEach(file => {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    const newImages = [...(dog.images || []), reader.result as string];
                                                    updateAkita(dog.id, { images: newImages });
                                                };
                                                reader.readAsDataURL(file);
                                            });
                                        }}
                                    />
                                </label>
                            )}
                        </div>
                        <PhotoGallery
                            images={dog.images || []}
                            onDelete={currentUser?.id === dog.ownerId ? handleDeletePhoto : undefined}
                            editable={currentUser?.id === dog.ownerId}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

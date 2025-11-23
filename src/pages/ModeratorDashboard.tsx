import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { CheckCircle, XCircle, Plus, Trash2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ModeratorDashboard = () => {
    const { litters, akitas, users, currentUser, approveLitter, categories, addCategory, removeCategory } = useStore();
    const [rejectionReason, setRejectionReason] = useState('');
    const [selectedLitterId, setSelectedLitterId] = useState<string | null>(null);
    const [newCategory, setNewCategory] = useState('');

    if (!currentUser || currentUser.role !== 'moderator') {
        return (
            <div className="max-w-5xl mx-auto text-center py-12">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
                <p className="text-gray-600 mt-2">You must be a moderator to access this page.</p>
            </div>
        );
    }

    const pendingLitters = litters.filter(l => l.approvalStatus === 'pending');
    const approvedLitters = litters.filter(l => l.approvalStatus === 'approved');
    const rejectedLitters = litters.filter(l => l.approvalStatus === 'rejected');

    const handleReject = (litterId: string) => {
        if (rejectionReason.trim()) {
            approveLitter(litterId, false, rejectionReason);
            setSelectedLitterId(null);
            setRejectionReason('');
        }
    };

    const handleAddCategory = () => {
        if (newCategory.trim()) {
            addCategory(newCategory.trim());
            setNewCategory('');
        }
    };

    const getSire = (id: string) => akitas.find(a => a.id === id);
    const getDam = (id: string) => akitas.find(a => a.id === id);
    const getBreeder = (id: string) => users.find(u => u.id === id);

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Moderator Dashboard</h1>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-yellow-800">Pending Approval</p>
                            <p className="text-3xl font-bold text-yellow-900">{pendingLitters.length}</p>
                        </div>
                        <AlertCircle className="h-12 w-12 text-yellow-500" />
                    </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-800">Approved</p>
                            <p className="text-3xl font-bold text-green-900">{approvedLitters.length}</p>
                        </div>
                        <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-800">Rejected</p>
                            <p className="text-3xl font-bold text-red-900">{rejectedLitters.length}</p>
                        </div>
                        <XCircle className="h-12 w-12 text-red-500" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Litters - Takes 2 columns */}
                <div className="lg:col-span-2">
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Pending Litters</h2>
                        </div>
                        <div className="p-6">
                            {pendingLitters.length > 0 ? (
                                <div className="space-y-4">
                                    {pendingLitters.map(litter => {
                                        const sire = getSire(litter.sireId);
                                        const dam = getDam(litter.damId);
                                        const breeder = getBreeder(litter.breederId);
                                        return (
                                            <div key={litter.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex space-x-4">
                                                    {litter.images[0] && (
                                                        <img src={litter.images[0]} alt="Litter" className="w-24 h-24 object-cover rounded" />
                                                    )}
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between">
                                                            <div>
                                                                <p className="text-sm text-gray-500">Breeder: {breeder?.name}</p>
                                                                <p className="font-medium text-gray-900 mt-1">
                                                                    {sire?.callName} x {dam?.callName}
                                                                </p>
                                                                <p className="text-sm text-gray-600 mt-1">{litter.description}</p>
                                                                <p className="text-sm text-gray-500 mt-1">Whelp Date: {new Date(litter.dob).toLocaleDateString()}</p>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 flex space-x-2">
                                                            <button
                                                                onClick={() => approveLitter(litter.id, true)}
                                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedLitterId(litter.id)}
                                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                                                            >
                                                                <XCircle className="h-4 w-4 mr-1" />
                                                                Reject
                                                            </button>
                                                            <Link
                                                                to={`/marketplace`}
                                                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                            >
                                                                View Details
                                                            </Link>
                                                        </div>
                                                        {selectedLitterId === litter.id && (
                                                            <div className="mt-3">
                                                                <textarea
                                                                    value={rejectionReason}
                                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                                    placeholder="Reason for rejection..."
                                                                    className="w-full border-gray-300 rounded-md shadow-sm text-sm"
                                                                    rows={2}
                                                                />
                                                                <div className="mt-2 flex space-x-2">
                                                                    <button
                                                                        onClick={() => handleReject(litter.id)}
                                                                        disabled={!rejectionReason.trim()}
                                                                        className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                                                                    >
                                                                        Confirm Rejection
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedLitterId(null);
                                                                            setRejectionReason('');
                                                                        }}
                                                                        className="px-3 py-1.5 text-sm bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-8">No pending litters</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Forum Categories Management */}
                <div className="lg:col-span-1">
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Forum Categories</h2>
                        </div>
                        <div className="p-6">
                            <div className="mb-4">
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                        placeholder="New category..."
                                        className="flex-1 border-gray-300 rounded-md shadow-sm text-sm"
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                                    />
                                    <button
                                        onClick={handleAddCategory}
                                        disabled={!newCategory.trim()}
                                        className="px-3 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary disabled:opacity-50"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {categories.map(category => (
                                    <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <span className="text-sm text-gray-900">{category}</span>
                                        <button
                                            onClick={() => removeCategory(category)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

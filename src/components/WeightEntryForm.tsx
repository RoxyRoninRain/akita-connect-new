import { useState } from 'react';
import { X } from 'lucide-react';

interface WeightEntryFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { puppyId: string; date: string; weight: number }) => void;
    puppies: Array<{ id: string; name: string }>;
}

export const WeightEntryForm = ({ isOpen, onClose, onSubmit, puppies }: WeightEntryFormProps) => {
    const [formData, setFormData] = useState({
        puppyId: puppies.length > 0 ? puppies[0].id : '',
        date: new Date().toISOString().split('T')[0],
        weight: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.puppyId && formData.date && formData.weight) {
            onSubmit({
                puppyId: formData.puppyId,
                date: formData.date,
                weight: parseFloat(formData.weight)
            });
            setFormData({
                puppyId: puppies.length > 0 ? puppies[0].id : '',
                date: new Date().toISOString().split('T')[0],
                weight: ''
            });
            onClose();
        }
    };

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
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Log Puppy Weight</h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {/* Puppy Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Puppy *</label>
                                    <select
                                        value={formData.puppyId}
                                        onChange={(e) => setFormData({ ...formData, puppyId: e.target.value })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                        required
                                    >
                                        {puppies.map(puppy => (
                                            <option key={puppy.id} value={puppy.id}>
                                                {puppy.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date *</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                        required
                                    />
                                </div>

                                {/* Weight */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Weight (lbs) *</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={formData.weight}
                                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                        placeholder="e.g., 2.5"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                        required
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Enter weight in pounds
                                    </p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="mt-6">
                                <button
                                    type="submit"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-primary text-base font-medium text-white hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary sm:text-sm"
                                >
                                    Log Weight
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

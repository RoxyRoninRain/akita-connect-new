import { useState } from 'react';
import { X } from 'lucide-react';
import { ImageUpload } from './ImageUpload';

interface HealthRecordFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (record: HealthRecordFormData) => void;
    initialData?: HealthRecordFormData;
    mode: 'add' | 'edit';
}

export interface HealthRecordFormData {
    type: 'OFA Hips' | 'OFA Elbows' | 'OFA Eyes' | 'Thyroid' | 'VGL' | 'Other';
    result: string;
    date: string;
    certificateImage?: string;
}

export const HealthRecordForm = ({ isOpen, onClose, onSubmit, initialData, mode }: HealthRecordFormProps) => {
    const [formData, setFormData] = useState<HealthRecordFormData>(
        initialData || {
            type: 'OFA Hips',
            result: '',
            date: new Date().toISOString().split('T')[0],
            certificateImage: ''
        }
    );

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    const handleImageUpload = (url: string) => {
        setFormData({ ...formData, certificateImage: url });
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
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                {mode === 'add' ? 'Add Health Record' : 'Edit Health Record'}
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {/* Test Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Test Type *</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                        required
                                    >
                                        <option value="OFA Hips">OFA Hips</option>
                                        <option value="OFA Elbows">OFA Elbows</option>
                                        <option value="OFA Eyes">OFA Eyes</option>
                                        <option value="Thyroid">Thyroid</option>
                                        <option value="VGL">VGL (Genetic)</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                {/* Result */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Result *</label>
                                    <input
                                        type="text"
                                        value={formData.result}
                                        onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                                        placeholder="e.g., Excellent, Normal, Clear"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                        required
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Examples: Excellent, Good, Fair, Normal, Clear, Carrier, Affected
                                    </p>
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Test Date *</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                                        required
                                    />
                                </div>

                                {/* Certificate Image */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Certificate Image (Optional)
                                    </label>
                                    <ImageUpload
                                        onUpload={handleImageUpload}
                                        currentImage={formData.certificateImage}
                                    />
                                    {formData.certificateImage && (
                                        <div className="mt-2">
                                            <img
                                                src={formData.certificateImage}
                                                alt="Certificate preview"
                                                className="max-w-full h-32 rounded border border-gray-200"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="mt-6">
                                <button
                                    type="submit"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-primary text-base font-medium text-white hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary sm:text-sm"
                                >
                                    {mode === 'add' ? 'Add Health Record' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

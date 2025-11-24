/**
 * Integration patch for Pedigree Tree in AkitaDetail.tsx
 * 
 * Manual steps to integrate:
 * 1. At top of file, after existing imports, add:
 */

import { useState, useEffect } from 'react';  // Update existing useState import
import { PedigreeTree } from '../components/PedigreeTree';
import { akitaApi } from '../api/client';

/**
 * 2. After the activeTab state declaration, add:
 */

// Pedigree state
const [pedigreeData, setPedigreeData] = useState<any>(null);
const [loadingPedigree, setLoadingPedigree] = useState(false);

/**
 * 3. After the dog/owner lookups and before openLightbox, add:
 */

// Fetch pedigree data when pedigree tab is active
useEffect(() => {
    if (activeTab === 'pedigree' && !pedigreeData && dog?.id) {
        setLoadingPedigree(true);
        akitaApi.getPedigree(dog.id)
            .then(data => setPedigreeData(data))
            .catch(err => console.error('Failed to load pedigree:', err))
            .finally(() => setLoadingPedigree(false));
    }
}, [activeTab, dog?.id, pedigreeData]);

/**
 * 4. In the pedigree tab content (around line 417-486), replace the entire
 *    pedigree tree section with:
 */

{
    activeTab === 'pedigree' && (
        <div className="space-y-6">
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
    )
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

interface PedigreeAkita {
    id: string;
    registered_name: string;
    call_name: string;
    gender: 'male' | 'female';
    titles?: string[];
    sire?: PedigreeAkita | null;
    dam?: PedigreeAkita | null;
}

interface PedigreeTreeProps {
    akita: PedigreeAkita;
}

export const PedigreeTree = ({ akita }: PedigreeTreeProps) => {
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([akita.id]));

    const toggleNode = (id: string) => {
        setExpandedNodes((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const AkitaNode = ({ dog, generation = 0 }: { dog: PedigreeAkita; generation?: number }) => {
        const hasParents = dog.sire || dog.dam;
        const isExpanded = expandedNodes.has(dog.id);

        return (
            <div className="flex items-start gap-4">
                {/* Current Dog Card */}
                <div className="min-w-[280px]">
                    <div
                        className={clsx(
                            'rounded-lg border-2 p-4 transition-all hover:shadow-lg',
                            dog.gender === 'male'
                                ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950'
                                : 'border-pink-300 bg-pink-50 dark:border-pink-700 dark:bg-pink-950'
                        )}
                    >
                        {/* Gender Badge */}
                        <div className="mb-2 flex items-center justify-between">
                            <span
                                className={clsx(
                                    'text-xs font-semibold px-2 py-1 rounded',
                                    dog.gender === 'male'
                                        ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                                        : 'bg-pink-200 text-pink-800 dark:bg-pink-800 dark:text-pink-200'
                                )}
                            >
                                {dog.gender === 'male' ? '♂ Sire' : '♀ Dam'}
                            </span>
                            {hasParents && (
                                <button
                                    onClick={() => toggleNode(dog.id)}
                                    className="text-sm text-primary-600 hover:underline dark:text-primary-400"
                                >
                                    {isExpanded ? '− Collapse' : '+ Expand'}
                                </button>
                            )}
                        </div>

                        {/* Dog Info */}
                        <Link
                            to={`/akitas/${dog.id}`}
                            className="block hover:text-primary-600 dark:hover:text-primary-400"
                        >
                            <h4 className="font-bold text-base mb-1">{dog.call_name}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-300 italic">
                                {dog.registered_name}
                            </p>
                        </Link>

                        {/* Titles */}
                        {dog.titles && dog.titles.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                                {dog.titles.slice(0, 3).map((title, idx) => (
                                    <span
                                        key={idx}
                                        className="text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-200"
                                    >
                                        {title}
                                    </span>
                                ))}
                                {dog.titles.length > 3 && (
                                    <span className="text-xs text-gray-500">+{dog.titles.length - 3}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Parents (if expanded) */}
                {hasParents && isExpanded && (
                    <div className="flex flex-col gap-4">
                        {dog.sire && <AkitaNode dog={dog.sire} generation={generation + 1} />}
                        {dog.dam && <AkitaNode dog={dog.dam} generation={generation + 1} />}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="inline-block min-w-full">
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                    🐾 Pedigree Tree
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Click "+ Expand" to view ancestors. Navigate to any dog by clicking their name.
                </p>
                <AkitaNode dog={akita} />
            </div>
        </div>
    );
};

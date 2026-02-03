
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { ReferencePurpose } from '../types';
import { ChevronDownIcon } from './icons';

// Supports grouped options or flat options
export interface PurposeOption {
    label?: string; // Group label
    options?: { value: ReferencePurpose; label: string }[];
    value?: ReferencePurpose; // Flat option
}

interface PurposeSelectorProps {
    value: ReferencePurpose;
    onChange: (value: ReferencePurpose) => void;
    options: PurposeOption[];
    disabled?: boolean;
}

const PurposeSelector: React.FC<PurposeSelectorProps> = ({ value, onChange, options, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Flatten options to find the selected label
    const findLabel = () => {
        for (const grp of options) {
            if (grp.options) {
                const found = grp.options.find(o => o.value === value);
                if (found) return found.label;
            } else if (grp.value === value) {
                return grp.label; // Should be handled if mixed flat/grouped, though type suggests strict structure
            }
        }
        return '选择...';
    }

    const selectedLabel = findLabel();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const handleSelect = (newValue: ReferencePurpose) => {
        onChange(newValue);
        setIsOpen(false);
    };

    const isBaseModel = value === 'baseModel';

    const buttonBaseClasses = `w-full text-xs rounded-md p-2 transition-all outline-none flex items-center justify-between focus:ring-1 focus:ring-[var(--brand-accent-color)]/50 disabled:opacity-50 disabled:cursor-not-allowed`;

    let stateClasses = '';
    if (isBaseModel) {
        stateClasses = 'bg-white border-2 border-[var(--brand-accent-color)] text-gray-800 font-semibold';
    } else if (isOpen) {
        stateClasses = 'bg-gray-100/80 border border-[var(--brand-accent-color)] text-gray-800 shadow-inner ring-2 ring-green-500/30';
    } else {
        stateClasses = 'bg-gray-100/80 border border-transparent hover:border-gray-300';
    }

    return (
        <div ref={wrapperRef} className="relative w-full">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled}
                className={`${buttonBaseClasses} ${stateClasses}`}
            >
                <span className="truncate pr-2">{selectedLabel}</span>
                <ChevronDownIcon className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div
                    className="absolute z-10 mt-1 w-full bg-gray-800 rounded-lg shadow-2xl p-2 animate-fade-in max-h-80 overflow-y-auto"
                    style={{ top: '100%', marginTop: '0.25rem' }}
                >
                    <ul className="flex flex-col gap-1">
                        {options.map((grp, idx) => (
                            <React.Fragment key={idx}>
                                {grp.label && (
                                    <li className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1 mt-1">
                                        {grp.label}
                                    </li>
                                )}
                                {grp.options?.map(opt => (
                                    <li key={opt.value}>
                                        <button
                                            type="button"
                                            onClick={() => handleSelect(opt.value)}
                                            className={`w-full text-left p-2 rounded-md text-xs font-medium transition-colors
                                                ${value === opt.value
                                                    ? 'bg-[var(--brand-accent-color)] text-black'
                                                    : 'text-gray-200 hover:bg-gray-700'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    </li>
                                ))}
                            </React.Fragment>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default PurposeSelector;

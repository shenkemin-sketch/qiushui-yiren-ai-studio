
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface AspectRatioPanelProps {
    selectedRatio: string;
    onRatioChange: (ratio: string) => void;
    disabled: boolean;
}

const aspectRatios = [
    { name: '自动', value: 'auto' },
    { name: '1:1', value: '1:1' },
    { name: '16:9', value: '16:9' },
    { name: '9:16', value: '9:16' },
    { name: '4:3', value: '4:3' },
    { name: '3:4', value: '3:4' },
];

const AspectRatioPanel: React.FC<AspectRatioPanelProps> = ({ selectedRatio, onRatioChange, disabled }) => {
    return (
        <div className="w-full flex flex-col gap-2 pt-6 border-t border-gray-200/80">
            <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-gray-700 tracking-wider">输出比例</h3>
                <span className="text-[11px] text-gray-400">画幅</span>
            </div>
            <div className="grid grid-cols-6 gap-1">
                {aspectRatios.map(({ name, value }) => (
                    <button
                        key={value}
                        onClick={() => onRatioChange(value)}
                        disabled={disabled}
                        className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${selectedRatio === value
                                ? 'bg-[var(--brand-accent-color)] !text-white shadow-sm'
                                : 'bg-gray-100/80 hover:bg-gray-200/80 text-gray-700'
                            }`}
                    >
                        {name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AspectRatioPanel;

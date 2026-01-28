
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
        <div className="w-full flex flex-col gap-4 pt-8 border-t border-gray-200/80">
            <div className="flex flex-col items-center text-center">
                <h3 className="text-sm font-bold text-gray-700 tracking-wider">输出比例</h3>
                <p className="text-xs text-gray-500 mt-1">设定作品画幅</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {aspectRatios.map(({ name, value }) => (
                    <button
                        key={value}
                        onClick={() => onRatioChange(value)}
                        disabled={disabled}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                            selectedRatio === value
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

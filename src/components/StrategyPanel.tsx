
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface StrategyPanelProps {
    stylePrompt: string;
    onStylePromptChange: (prompt: string) => void;
    aspectRatio: string;
    setAspectRatio: (ratio: string) => void;
    // Reserved for future use if needed, but making optional to avoid lint errors if passed
    currentModule?: any;
    modelStats?: any;
    setModelStats?: any;
    disabled: boolean;
}

const StrategyPanel: React.FC<StrategyPanelProps> = ({ stylePrompt, onStylePromptChange, aspectRatio, setAspectRatio, disabled }) => {
    return (
        <div className="w-full flex flex-col gap-6 pt-6 border-t border-gray-200/80">
            {/* Aspect Ratio Selector */}
            <div className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-wider text-gray-500 font-bold">画幅比例 (Aspect Ratio)</span>
                <div className="grid grid-cols-3 gap-2">
                    {['3:4', '9:16', '1:1'].map((ratio) => (
                        <button
                            key={ratio}
                            onClick={() => setAspectRatio(ratio)}
                            disabled={disabled}
                            className={`py-2 text-xs font-medium rounded border transition-all ${aspectRatio === ratio
                                    ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                }`}
                        >
                            {ratio}
                        </button>
                    ))}
                </div>
            </div>

            {/* Style Prompt */}
            <div className="w-full flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-gray-700 tracking-wider">波段风格</h3>
                    <span className="text-[11px] text-gray-400">选填</span>
                </div>
                <textarea
                    value={stylePrompt}
                    onChange={(e) => onStylePromptChange(e.target.value)}
                    disabled={disabled}
                    rows={2}
                    placeholder="描述风格调性（如：法式浪漫、韩系千金、清冷禁欲）..."
                    className="w-full text-xs bg-gray-100/80 border-transparent rounded-md p-2 focus:ring-1 focus:ring-[var(--brand-accent-color)]/50 focus:bg-white focus:border-[var(--brand-accent-color)] transition-all outline-none resize-y"
                />
                <p className="text-[11px] text-gray-400 leading-relaxed">
                    留空则使用默认风格生成套图
                </p>
            </div>
        </div>
    );
};

export default StrategyPanel;

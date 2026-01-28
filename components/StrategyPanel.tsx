
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface StrategyPanelProps {
    stylePrompt: string;
    onStylePromptChange: (prompt: string) => void;
    disabled: boolean;
}

const StrategyPanel: React.FC<StrategyPanelProps> = ({ stylePrompt, onStylePromptChange, disabled }) => {
    return (
        <div className="w-full flex flex-col gap-2 pt-6 border-t border-gray-200/80">
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
    );
};

export default StrategyPanel;

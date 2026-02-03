/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { ChevronRightIcon } from './icons';
import { getDefaultImageSystemPrompt, DEFAULT_STRATEGY_PROMPT } from '../services/geminiService';

interface PromptEditorPanelProps {
    imageSystemPrompt: string;
    onImageSystemPromptChange: (prompt: string) => void;
    strategyPrompt: string;
    onStrategyPromptChange: (prompt: string) => void;
    disabled: boolean;
    aspectRatio: string;
}

const PromptEditorPanel: React.FC<PromptEditorPanelProps> = ({
    imageSystemPrompt,
    onImageSystemPromptChange,
    strategyPrompt,
    onStrategyPromptChange,
    disabled,
    aspectRatio,
}) => {

    const handleResetImagePrompt = () => {
        onImageSystemPromptChange(getDefaultImageSystemPrompt(aspectRatio));
    };

    const handleResetStrategyPrompt = () => {
        onStrategyPromptChange(DEFAULT_STRATEGY_PROMPT);
    };

    return (
        <div className="w-full flex flex-col gap-4 pt-8 border-t border-gray-200/80">
            <details className="group" open>
                <summary className="flex w-full items-center justify-center cursor-pointer list-none relative group">
                    <div className="text-center">
                        <h3 className="text-sm font-bold text-gray-700 tracking-wider">高级提示词设置</h3>
                        <p className="text-xs text-gray-500 mt-1">查看并自定义 AI 指令</p>
                    </div>
                    <span className="absolute right-0 transition-transform duration-300 group-open:rotate-90 text-gray-400 group-hover:text-gray-700">
                        <ChevronRightIcon className="w-5 h-5" />
                    </span>
                </summary>

                <div className="mt-6 flex flex-col gap-6 animate-fade-in">
                    {/* Image Generation Prompt */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-gray-600">图像生成系统提示词</label>
                            <button
                                onClick={handleResetImagePrompt}
                                disabled={disabled}
                                className="text-xs font-medium text-gray-500 hover:text-gray-800 disabled:opacity-50"
                            >
                                恢复默认
                            </button>
                        </div>
                        <textarea
                            value={imageSystemPrompt}
                            onChange={(e) => onImageSystemPromptChange(e.target.value)}
                            disabled={disabled}
                            rows={10}
                            className="w-full text-xs bg-gray-100/80 border-transparent rounded-md p-2 focus:ring-1 focus:ring-[var(--brand-accent-color)]/50 focus:bg-white focus:border-[var(--brand-accent-color)] transition-all outline-none"
                        />
                    </div>

                    {/* Strategy Generation Prompt */}
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-semibold text-gray-600">策略构思提示词</label>
                            <button
                                onClick={handleResetStrategyPrompt}
                                disabled={disabled}
                                className="text-xs font-medium text-gray-500 hover:text-gray-800 disabled:opacity-50"
                            >
                                恢复默认
                            </button>
                        </div>
                        <textarea
                            value={strategyPrompt}
                            onChange={(e) => onStrategyPromptChange(e.target.value)}
                            disabled={disabled}
                            rows={10}
                            className="w-full text-xs bg-gray-100/80 border-transparent rounded-md p-2 focus:ring-1 focus:ring-[var(--brand-accent-color)]/50 focus:bg-white focus:border-[var(--brand-accent-color)] transition-all outline-none"
                        />
                    </div>
                </div>
            </details>
        </div>
    );
};

export default PromptEditorPanel;
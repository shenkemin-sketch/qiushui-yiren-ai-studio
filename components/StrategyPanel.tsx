
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { generateStrategySuggestions, type StrategySuggestion } from '../services/geminiService';
import { type ReferenceObject } from './AddProductModal';
import { LightbulbIcon } from './icons';
import Spinner from './Spinner';
import { WorkflowModule } from '../types';

interface StrategyPanelProps {
    referenceObjects: ReferenceObject[];
    onApplyStrategy: (prompt: string) => void;
    isLoading: boolean; // Is the main generation running
    suggestions: StrategySuggestion[];
    onSuggestionsChange: (suggestions: StrategySuggestion[]) => void;
    module: WorkflowModule;
}

const HighlightedPrompt: React.FC<{ text: string }> = ({ text }) => {
    const regex = /(\[.*?:\s*'.*?'\]|\[主图模特\]|\[Main Product\])/g;
    const parts = text.split(regex);

    return (
        <div className="w-full text-xs text-gray-600 leading-relaxed bg-black/5 p-2 rounded-md border border-transparent cursor-text">
            {parts.map((part, index) => {
                if (part && (part.startsWith('[') && part.endsWith(']'))) {
                    return (
                        <strong key={index} className="font-semibold text-gray-900 bg-yellow-200/60 rounded-[3px] px-0.5 py-0.5">
                            {part}
                        </strong>
                    );
                }
                return <span key={index}>{part.split('\n').map((line, i, arr) => (
                    <React.Fragment key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                    </React.Fragment>
                ))}</span>;
            })}
        </div>
    );
};

const StrategyPanel: React.FC<StrategyPanelProps> = ({ referenceObjects, onApplyStrategy, isLoading, suggestions, onSuggestionsChange, module }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [auxiliaryPrompt, setAuxiliaryPrompt] = useState('');

    useEffect(() => {
        onSuggestionsChange([]);
    }, [referenceObjects]);

    const handlePromptChange = (index: number, newPrompt: string) => {
        const newSuggestions = [...suggestions];
        newSuggestions[index] = { ...newSuggestions[index], prompt: newPrompt };
        onSuggestionsChange(newSuggestions);
    };

    const handleFetchSuggestions = async () => {
        const baseModel = referenceObjects.find(r => r.purpose === 'baseModel');
        if (!baseModel) {
            setError("请先上传核心主体");
            return;
        }

        setIsGenerating(true);
        setError(null);
        onSuggestionsChange([]);

        try {
            const result = await generateStrategySuggestions(baseModel.file, referenceObjects, auxiliaryPrompt, module);
            onSuggestionsChange(result);
        } catch (e: any) {
            setError(e.message || "获取策略时发生未知错误。");
        } finally {
            setIsGenerating(false);
        }
    };

    const hasBaseModel = referenceObjects.some(r => r.purpose === 'baseModel');

    return (
        <div className="w-full flex flex-col gap-4 pt-8 border-t border-gray-200/80">
            <div className="flex flex-col items-center text-center">
                <h3 className="text-sm font-bold text-gray-700 tracking-wider">灵感提案 (Proposals)</h3>
                <p className="text-xs text-gray-500 mt-1">
                    AI 摄影师为您构思 3 组方案
                </p>
            </div>

            <div className="w-full flex flex-col gap-2">
                <textarea
                    value={auxiliaryPrompt}
                    onChange={(e) => setAuxiliaryPrompt(e.target.value)}
                    disabled={isGenerating || isLoading}
                    rows={3}
                    placeholder="选填：补充风格要求 (如：法式浪漫、多巴胺、清冷感)..."
                    className="w-full text-xs bg-gray-100/80 border-transparent rounded-md p-2 focus:ring-1 focus:ring-[var(--brand-accent-color)]/50 focus:bg-white focus:border-[var(--brand-accent-color)] transition-all outline-none resize-y"
                />
            </div>

            <button
                onClick={handleFetchSuggestions}
                disabled={isGenerating || isLoading || !hasBaseModel}
                className="btn btn-primary w-full !bg-white !text-gray-700 border border-gray-200 hover:!bg-gray-50 hover:!border-gray-300 flex items-center justify-center gap-2"
            >
                {isGenerating ? (
                    <>
                        <Spinner className="!h-5 !w-5" /> 构思中...
                    </>
                ) : (
                    <>
                        <LightbulbIcon className="w-5 h-5" /> 获取灵感方案
                    </>
                )}
            </button>

            {error && <p className="text-red-600 text-xs text-center animate-fade-in">{error}</p>}

            {suggestions.length > 0 && (
                <div className="flex flex-col gap-3 mt-2 animate-fade-in">
                    <div className="flex justify-end -mb-1">
                        <button
                            onClick={() => onSuggestionsChange([])}
                            disabled={isLoading || isGenerating}
                            className="text-xs font-medium text-gray-500 hover:text-gray-800 disabled:opacity-50 transition-colors"
                        >
                            清除提案
                        </button>
                    </div>

                    {suggestions.map((suggestion, index) => (
                        <div key={index} className="bg-white/80 p-4 rounded-lg border border-gray-200/80 shadow-sm flex flex-col gap-3">
                            <h4 className="font-semibold text-sm text-gray-800">{suggestion.title}</h4>

                            {editingIndex === index ? (
                                <textarea
                                    value={suggestion.prompt}
                                    onChange={(e) => handlePromptChange(index, e.target.value)}
                                    onBlur={() => setEditingIndex(null)}
                                    autoFocus
                                    onFocus={(e) => e.currentTarget.select()}
                                    disabled={isLoading || isGenerating}
                                    rows={10}
                                    className="w-full text-xs text-gray-600 leading-relaxed bg-white p-2 rounded-md border border-transparent hover:border-black/10 focus:bg-white focus:ring-1 focus:ring-[var(--brand-accent-color)]/50 focus:border-[var(--brand-accent-color)] transition-all outline-none"
                                />
                            ) : (
                                <div onClick={() => setEditingIndex(index)}>
                                    <HighlightedPrompt text={suggestion.prompt} />
                                </div>
                            )}

                            <button
                                onClick={() => onApplyStrategy(suggestion.prompt)}
                                disabled={isLoading || isGenerating}
                                className="text-xs font-bold text-[var(--brand-accent-hover-color)] self-start mt-1 hover:underline disabled:opacity-50"
                            >
                                使用此方案 (Use)
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StrategyPanel;

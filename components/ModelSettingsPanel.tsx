
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { AI_MODELS } from '../types';
import { DiamondIcon } from './icons';

interface ModelSettingsPanelProps {
    exhaustedModels: Set<string>;
}

const ModelSettingsPanel: React.FC<ModelSettingsPanelProps> = ({ exhaustedModels }) => {
    return (
        <div className="w-full flex flex-col gap-4 pt-4 border-t border-gray-200/80">
            <div className="flex flex-col items-center text-center">
                <h3 className="text-sm font-bold text-gray-700 tracking-wider">生图模型 (Engine)</h3>
                <p className="text-xs text-gray-500 mt-1">Powered by Gemini 3.0 Pro</p>
            </div>

            <div className="flex flex-col gap-2">
                {/* Pro Model Info Card */}
                <div
                    className={`relative w-full p-3 rounded-lg border text-left transition-all bg-orange-50 border-orange-200 ring-1 ring-orange-300 cursor-default shadow-sm`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-full bg-orange-100 text-orange-600`}>
                                <DiamondIcon className="w-4 h-4" />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-gray-800 flex items-center gap-2">
                                    Nano Banana Pro
                                    <span className="bg-orange-100 text-orange-700 text-[11px] px-1.5 rounded-full border border-orange-200">2K 画质</span>
                                </div>
                                <div className="text-[11px] text-gray-500 mt-0.5">影棚级光影 · 真实细节 · 2048px</div>
                            </div>
                        </div>
                        <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
                    </div>
                    {exhaustedModels.has(AI_MODELS.PRO) && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] rounded-lg flex items-center justify-center border border-red-200 z-10">
                            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded shadow-sm flex items-center gap-1 border border-red-100">
                                ⚠️ 配额已用完
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <p className="text-[11px] text-gray-400 text-center leading-tight px-2">
                已自动启用最强模型，支持 2K 高清直出。
            </p>
        </div>
    );
};

export default ModelSettingsPanel;


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { UploadIcon, ArrowRightIcon, DiamondIcon } from './icons';
import { WorkflowModule } from '../types';
import ModelLibrary, { LibraryModel } from './ModelLibrary';

interface StartScreenProps {
    onModeSelect: (module: WorkflowModule, files: FileList | null) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onModeSelect }) => {
    const [showLibrary, setShowLibrary] = useState(false);

    const handleFileChange = (module: WorkflowModule, e: React.ChangeEvent<HTMLInputElement>) => {
        onModeSelect(module, e.target.files);
    };

    const handleEnterModule = (module: WorkflowModule) => {
        // Enter with no files, triggering empty state in editor
        onModeSelect(module, null);
    };

    const handleDrop = (module: WorkflowModule, e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onModeSelect(module, e.dataTransfer.files);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // Helper: Convert Base64 from LibraryModel back to File for the Editor
    const dataURLtoFile = (dataurl: string, filename: string): File => {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)![1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    };

    const handleModelSelect = (model: LibraryModel) => {
        const file = dataURLtoFile(model.dataUrl, `${model.name}.png`);
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);

        // Default to Lookbook mode when selecting from Library
        onModeSelect('lookbook', dataTransfer.files);
        setShowLibrary(false);
    };

    const Card = ({
        module,
        title,
        engTitle,
        subtitle,
        desc,
        index
    }: {
        module: WorkflowModule,
        title: string,
        engTitle: string,
        subtitle: string,
        desc: string,
        index: string
    }) => (
        <div
            className="group relative bg-white h-[280px] md:h-[320px] border border-gray-100/50 hover:border-[var(--brand-accent-color)] transition-all duration-700 flex flex-col justify-between p-6 md:p-8 cursor-pointer shadow-sm hover:shadow-2xl overflow-hidden"
            onDrop={(e) => handleDrop(module, e)}
            onDragOver={handleDragOver}
            onClick={() => handleEnterModule(module)}
        >
            {/* Background Index Number - Editorial Style */}
            <div className="absolute -top-6 -right-2 font-serif text-[120px] leading-none text-gray-50 group-hover:text-[var(--brand-accent-color)]/5 transition-colors duration-700 pointer-events-none select-none z-0">
                {index}
            </div>

            {/* Top: Header */}
            <div className="relative z-10 flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-[0.3em] text-gray-400 group-hover:text-[var(--brand-accent-color)] transition-colors">{subtitle}</span>
                <h3 className="text-2xl md:text-3xl font-serif font-medium text-gray-900 leading-tight group-hover:tracking-wide transition-all duration-500">{engTitle}</h3>
                <h4 className="text-base md:text-lg font-serif italic text-gray-500 mt-1">{title}</h4>
            </div>

            <div className="relative z-10 mt-auto mb-4">
                <div className="w-6 h-px bg-gray-300 mb-3 group-hover:w-12 group-hover:bg-[var(--brand-accent-color)] transition-all duration-500"></div>
                <p className="text-xs text-gray-500 font-light leading-relaxed max-w-[95%] tracking-wide line-clamp-2">
                    {desc}
                </p>
            </div>

            <div className="relative z-10 pt-4 border-t border-gray-100 flex justify-between items-center group-hover:border-gray-200 transition-colors">
                {/* Enter Button */}
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] font-semibold text-gray-900 group-hover:text-[var(--brand-accent-color)] transition-colors">
                    <span>开始创作</span>
                    <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-2 transition-transform duration-300" />
                </div>

                {/* Quick Upload */}
                <label
                    className="flex items-center gap-2 p-2 -mr-2 text-gray-300 hover:text-[var(--brand-accent-color)] cursor-pointer transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    title="快速上传"
                >
                    <UploadIcon className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(module, e)} />
                </label>
            </div>

            {/* Hover Overlay Effect (Subtle) */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--brand-accent-color)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        </div>
    );

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center p-4 md:p-8 bg-[#FDFDFD] overflow-hidden relative font-sans">



            {showLibrary && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-8 animate-fade-in">
                    <div className="w-full max-w-6xl h-[85vh] bg-white shadow-2xl relative rounded-sm overflow-hidden border border-gray-200">
                        <ModelLibrary
                            onSelectModel={handleModelSelect}
                            onCancel={() => setShowLibrary(false)}
                        />
                    </div>
                </div>
            )}

            <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-6 animate-fade-in">

                <div className="flex flex-col items-center text-center gap-2 mb-4">
                    <h2 className="text-3xl md:text-5xl font-serif font-thin text-gray-900 tracking-tight leading-none">
                        Chiu Shui
                    </h2>
                    <div className="flex items-center gap-4 mt-1">
                        <div className="h-px w-12 bg-gray-300"></div>
                        <h3 className="text-xs text-gray-500 font-light tracking-widest">
                            AI 摄影中台
                        </h3>
                        <div className="h-px w-12 bg-gray-300"></div>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 px-2 max-w-[1200px] mx-auto w-full">
                    <Card
                        module="lookbook"
                        title="棚拍 / 款片"
                        engTitle="Model Lookbook"
                        subtitle="Collection 01"
                        desc="生成模特穿着的电商主图与社媒穿搭图。一套图覆盖多平台，让服装在不同场景下展现最佳状态。"
                        index="01"
                    />
                    <Card
                        module="campaign"
                        title="形象大片"
                        engTitle="Brand Campaign"
                        subtitle="Collection 02"
                        desc="生成电影感品牌视觉大片。用于季度主题、海报封面或品牌故事，塑造高级感与调性。"
                        index="02"
                    />
                    <Card
                        module="still_life"
                        title="静物特写"
                        engTitle="Still Life"
                        subtitle="Collection 03"
                        desc="生成产品平铺与工艺细节图。将面料质感、设计工艺完美呈现，赢得用户信任。"
                        index="03"
                    />
                </div>

                <footer className="mt-6 text-center flex flex-col items-center gap-3">
                    <button
                        onClick={() => setShowLibrary(true)}
                        className="group flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-gray-400 transition-all duration-300 text-[11px] uppercase tracking-[0.15em] font-medium text-gray-600 hover:text-gray-900 rounded-full"
                    >
                        <DiamondIcon className="w-3 h-3 text-gray-400 group-hover:text-[var(--brand-accent-color)]" />
                        <span>模特资产库</span>
                    </button>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-gray-300">
                        由 Google Gemini 3.0 Pro 提供支持
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default StartScreen;


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useState, useEffect } from 'react';
import { UploadIcon, XCircleIcon, XIcon } from './icons';
import { compressImage } from '../services/geminiService';

export interface LibraryModel {
    id: string;
    name: string;
    dataUrl: string; // Base64 stored locally
    createdAt: number;
}

interface ModelLibraryProps {
    onSelectModel: (model: LibraryModel) => void;
    onUpload?: (file: File) => void;
    onCancel: () => void;
}

export const STORAGE_KEY = 'autumn_water_library_models_v1';

const ModelLibrary: React.FC<ModelLibraryProps> = ({ onSelectModel, onUpload, onCancel }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [models, setModels] = useState<LibraryModel[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load models from local storage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setModels(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Failed to load models", e);
        }
    }, []);

    // Save models to local storage whenever they change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(models));
    }, [models]);

    const handleFileProcess = async (file: File) => {
        // Increased limit to 30MB as we now compress on the client side
        if (file.size > 30 * 1024 * 1024) {
            alert("图片过大，请上传 30MB 以内的图片 (Image too large)");
            return;
        }

        setIsLoading(true);
        try {
            // Compress image before storing to save LocalStorage space
            const compressedDataUrl = await compressImage(file, 1024, 0.8);

            const newModel: LibraryModel = {
                id: Date.now().toString(),
                name: file.name.replace(/\.[^/.]+$/, "").substring(0, 12),
                dataUrl: compressedDataUrl,
                createdAt: Date.now()
            };
            setModels(prev => [...prev, newModel]);
            if (onUpload) {
                onUpload(file);
            }
        } catch (e) {
            console.error("Image processing failed", e);
            alert("图片处理失败，请重试。");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileProcess(e.target.files[0]);
        }
        if (e.target.value) e.target.value = '';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileProcess(e.dataTransfer.files[0]);
        }
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent card selection
        if (window.confirm("确定要删除这张模特卡吗？(Delete this model?)")) {
            setModels(prev => prev.filter(m => m.id !== id));
        }
    };

    const handleCardClick = (model: LibraryModel) => {
        onSelectModel(model);
    };

    return (
        <div className="absolute inset-0 bg-white z-50 flex flex-col animate-fade-in w-full h-full rounded-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0 bg-white relative z-50">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">公共素材库 / MODEL LIBRARY</h3>
                    <p className="text-[11px] text-gray-400 mt-1">管理企业自有模特资产 (Manage Corporate Assets)</p>
                </div>

                <button
                    type="button"
                    onClick={onCancel}
                    className="text-gray-400 hover:text-black transition-colors p-2 rounded-full hover:bg-gray-100 cursor-pointer active:scale-95 z-50"
                    aria-label="Close"
                >
                    <XIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Grid Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center">
                        <div className="text-xs font-medium text-[var(--brand-accent-color)] animate-pulse">处理中 (Processing)...</div>
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">

                    {/* 1. Add New Slot */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative aspect-[3/4] border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-3 group rounded-lg
                        ${isDragging
                                ? 'border-[var(--brand-accent-color)] bg-teal-50'
                                : 'border-gray-300 hover:border-[var(--brand-accent-color)] hover:bg-white bg-transparent'
                            }`}
                    >
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-[var(--brand-accent-color)] group-hover:text-white text-gray-400">
                            <UploadIcon className="w-5 h-5" />
                        </div>
                        <div className="text-center">
                            <span className="block text-xs font-bold uppercase tracking-widest text-gray-600 group-hover:text-[var(--brand-accent-color)]">添加模特</span>
                            <span className="block text-[11px] text-gray-400 mt-1">支持拖拽上传</span>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                    </button>

                    {/* 2. Uploaded Models */}
                    {models.map((model) => (
                        <div
                            key={model.id}
                            onClick={() => handleCardClick(model)}
                            className="group relative aspect-[3/4] bg-white rounded-lg overflow-hidden cursor-pointer transition-all duration-200 shadow-sm hover:shadow-lg border border-gray-200 hover:border-[var(--brand-accent-color)]"
                        >
                            {/* Image */}
                            <img src={model.dataUrl} alt={model.name} className="w-full h-full object-cover" />

                            {/* Info Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                            {/* Info Text */}
                            <div className="absolute bottom-0 left-0 w-full p-3 text-white">
                                <span className="block text-xs font-bold truncate">{model.name}</span>
                                <span className="block text-[11px] opacity-80 uppercase tracking-wide">点击选择</span>
                            </div>

                            {/* Delete Button (Fixed Z-index and StopProp) */}
                            <button
                                onClick={(e) => handleDelete(e, model.id)}
                                className="absolute top-2 right-2 bg-black/20 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all z-20"
                                title="删除"
                            >
                                <XCircleIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ModelLibrary;

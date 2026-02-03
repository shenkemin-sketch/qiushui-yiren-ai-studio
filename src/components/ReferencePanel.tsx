
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { UploadIcon, UserIcon, ArrowRightIcon, XIcon, ChevronDownIcon } from './icons';
import PurposeSelector, { PurposeOption } from './PurposeSelector';
import { WorkflowModule, ModelStats, ReferenceObject, ReferencePurpose, GLOBAL_PURPOSES } from '../types';
import { STORAGE_KEY, LibraryModel } from './ModelLibrary';
import { compressImage } from '../services/geminiService';


interface ReferencePanelProps {
    referenceObjects: ReferenceObject[];
    onReferenceObjectsChange: (objects: ReferenceObject[]) => void;
    isLoading: boolean;
    module: WorkflowModule;
    modelStats: ModelStats;
    onModelStatsChange: (stats: ModelStats) => void;
}

// Utility to Convert Base64 to File (Duplicated for component independence)
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

const withDragAndDrop = <P extends object>(
    WrappedComponent: React.ComponentType<P>
): React.FC<P & { onFileChange: (file: File) => void; disabled?: boolean; aspectRatioClass?: string }> => {
    return ({ onFileChange, disabled, aspectRatioClass, ...props }) => {
        const [isDraggingOver, setIsDraggingOver] = useState(false);

        const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isOver: boolean) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled) setIsDraggingOver(isOver);
        };

        const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDraggingOver(false);
            if (!disabled && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                onFileChange(e.dataTransfer.files[0]);
            }
        };

        return (
            <div
                className={`relative transition-all duration-300 ${isDraggingOver ? 'ring-1 ring-[var(--brand-accent-color)] bg-teal-50/20' : ''}`}
                onDragOver={(e) => handleDragEvents(e, true)}
                onDragEnter={(e) => handleDragEvents(e, true)}
                onDragLeave={(e) => handleDragEvents(e, false)}
                onDrop={handleDrop}
            >
                <WrappedComponent {...(props as P)} onFileChange={onFileChange} disabled={disabled} aspectRatioClass={aspectRatioClass} />
            </div>
        );
    };
};

const getPurposeOptions = (module: WorkflowModule): PurposeOption[] => {
    const commonClothing = { value: 'clothing_garment' as const, label: '服装 (Garment)' };
    const commonAccessory = { value: 'accessory_general' as const, label: '配饰 (Accessory)' };
    const commonDetail = { value: 'modification_detail' as const, label: '局部修改 (Edit)' };

    if (module === 'still_life') {
        return [
            {
                label: 'Step 1: Product',
                options: [{ value: 'baseModel', label: '商品主体 (Product)' }]
            },
            {
                label: 'Step 2: Scene & Light',
                options: [
                    { value: 'craft_flat_lay', label: '平铺 (Flat Lay)' },
                    { value: 'craft_macro_texture', label: '微距 (Macro)' },
                    { value: 'craft_origin_scene', label: '产地 (Origin)' },
                    { value: 'brand_artistic_vibe', label: '氛围 (Vibe)' },
                ]
            },
            { label: 'General', options: [commonDetail] }
        ];
    }

    const subjectOptions = [
        { value: 'baseModel' as const, label: '模特 (Model)' },
        commonClothing,
        commonAccessory
    ];

    let sceneOptions: { value: ReferencePurpose; label: string }[] = [];

    if (module === 'lookbook') {
        sceneOptions = [
            { value: 'studio_background_color', label: '纯色背景 (Color BG)' },
            { value: 'studio_lighting_clean', label: '电商布光 (Clean Light)' },
            { value: 'lifestyle_scene_street', label: '街拍 (Street)' },
            { value: 'lifestyle_scene_cafe', label: '探店 (Cafe)' },
        ];
    } else if (module === 'campaign') {
        sceneOptions = [
            { value: 'brand_scene_luxury', label: '奢华置景 (Luxury)' },
            { value: 'brand_artistic_vibe', label: '艺术空间 (Art)' },
            { value: 'brand_lighting_cinematic', label: '电影感 (Cinematic)' },
            { value: 'style_makeup_hair', label: '高定妆造 (High-end)' },
        ];
    }

    return [
        {
            label: 'Step 1: Model & Wear',
            options: subjectOptions
        },
        {
            label: 'Step 2: Scene & Vibe',
            options: sceneOptions
        },
        { label: 'General', options: [commonDetail] }
    ];
};

const ReferenceImageSlotComponent: React.FC<{
    object: ReferenceObject | undefined;
    onFileChange: (file: File) => void;
    onUpdate: (updatedObject: Partial<ReferenceObject>) => void;
    onRemove: () => void;
    isLoading: boolean;
    module: WorkflowModule;
    modelStats?: ModelStats;
    onModelStatsChange?: (stats: ModelStats) => void;
    aspectRatioClass?: string;
    placeholderContent?: React.ReactNode;
}> = ({ object, onFileChange, onUpdate, onRemove, isLoading, module, modelStats, onModelStatsChange, aspectRatioClass = "aspect-[4/5]", placeholderContent }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
    const [currentBox, setCurrentBox] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
    const [isHovering, setIsHovering] = useState(false);
    const [showBodyStats, setShowBodyStats] = useState(false);

    const isGlobalPurpose = object ? GLOBAL_PURPOSES.includes(object.purpose) : false;
    const canDraw = !isLoading && !isGlobalPurpose;

    useEffect(() => {
        if (object?.file) {
            const url = URL.createObjectURL(object.file);
            setImageUrl(url);
            setCurrentBox(object.boundingBox || null);
            return () => URL.revokeObjectURL(url);
        }
        setImageUrl(null);
    }, [object?.file, object?.boundingBox]);

    // Mask generation logic omitted for brevity, assumes same as before
    const generateMaskFromBoundingBox = useCallback(async (box: { x: number; y: number; width: number; height: number }) => {
        if (!object?.file) return;
        const image = new Image();
        const objectUrl = URL.createObjectURL(object.file);
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.filter = 'blur(12px)';
            ctx.fillStyle = 'white';
            ctx.fillRect(box.x * canvas.width, box.y * canvas.height, box.width * canvas.width, box.height * canvas.height);
            ctx.filter = 'none';
            const maskDataUrl = canvas.toDataURL('image/png');
            onUpdate({ boundingBox: box, mask: maskDataUrl });
            URL.revokeObjectURL(objectUrl);
        };
        image.src = objectUrl;
    }, [object?.file, onUpdate]);

    const getRelativeCoords = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!canDraw) return;
        setIsDrawing(true);
        setStartPoint(getRelativeCoords(e));
        setCurrentBox(null);
    };
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawing || !startPoint || !canDraw) return;
        const currentPoint = getRelativeCoords(e);
        const newBox = {
            x: Math.min(startPoint.x, currentPoint.x),
            y: Math.min(startPoint.y, currentPoint.y),
            width: Math.abs(startPoint.x - currentPoint.x),
            height: Math.abs(startPoint.y - currentPoint.y),
        };
        setCurrentBox(newBox);
    };
    const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawing || !startPoint || !canDraw) return;
        const endPoint = getRelativeCoords(e);
        setIsDrawing(false);
        const isClick = Math.abs(endPoint.x - startPoint.x) < 0.01 && Math.abs(endPoint.y - startPoint.y) < 0.01;
        if (isClick) {
            if (object?.boundingBox) handleClearSelection();
            setStartPoint(null);
            return;
        }
        const finalBox = {
            x: Math.min(startPoint.x, endPoint.x),
            y: Math.min(startPoint.y, endPoint.y),
            width: Math.abs(startPoint.x - endPoint.x),
            height: Math.abs(startPoint.y - endPoint.y),
        };
        if (finalBox.width > 0.01 && finalBox.height > 0.01) generateMaskFromBoundingBox(finalBox);
        else setCurrentBox(object?.boundingBox || null);
        setStartPoint(null);
    };
    const handleClearSelection = () => {
        onUpdate({ boundingBox: undefined, mask: undefined });
        setCurrentBox(null);
    };
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileChange(e.target.files[0]);
        }
    };

    if (!object) {
        return (
            <div className="w-full h-full">
                <button
                    onClick={() => inputRef.current?.click()}
                    disabled={isLoading}
                    className={`relative w-full ${aspectRatioClass} border-2 border-dashed border-gray-300 hover:border-[var(--brand-accent-color)] hover:bg-teal-50/10 bg-transparent flex flex-col items-center justify-center text-gray-400 hover:text-[var(--brand-accent-color)] transition-colors disabled:cursor-not-allowed group rounded-lg`}
                >
                    {placeholderContent ? placeholderContent : (
                        <>
                            <div className="border border-gray-300 group-hover:border-[var(--brand-accent-color)] rounded-full p-2 mb-2 transition-colors">
                                <UploadIcon className="h-4 w-4" />
                            </div>
                            <span className="text-[11px] uppercase tracking-widest font-medium">添加素材</span>
                        </>
                    )}
                    <input type="file" ref={inputRef} className="hidden" accept="image/*" onChange={handleFileSelect} disabled={isLoading} />
                </button>
            </div>
        );
    }

    const isBaseModel = object?.purpose === 'baseModel';
    const showBodyStatsPanel = module !== 'still_life' && isBaseModel && modelStats && onModelStatsChange;

    return (
        <div className="flex flex-col gap-3">
            <div className={`relative w-full ${aspectRatioClass} bg-white border group overflow-hidden transition-all duration-300 ${isBaseModel ? 'border-[var(--brand-accent-color)]' : 'border-gray-200 hover:border-gray-300'}`}>
                {isBaseModel && (
                    <div className="absolute top-0 left-0 z-10 bg-[var(--brand-accent-color)] text-white text-[11px] font-bold px-2 py-1 tracking-widest uppercase pointer-events-none">
                        {module === 'still_life' ? '商品' : '模特'}
                    </div>
                )}
                <div
                    ref={imageContainerRef}
                    className={`relative w-full h-full ${!canDraw ? 'cursor-default' : 'cursor-brand-crosshair'}`}
                    onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseEnter={() => setIsHovering(true)} onMouseLeave={(e) => { setIsHovering(false); if (isDrawing) handleMouseUp(e) }}
                >
                    <img src={imageUrl!} alt="Reference" className="w-full h-full object-cover pointer-events-none select-none p-0" />
                    {canDraw && !currentBox && isBaseModel && (
                        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="bg-white/90 border border-gray-200 text-[var(--brand-accent-color)] text-[11px] px-3 py-1 uppercase tracking-wider shadow-sm">
                                涂抹修改 (Draw)
                            </div>
                        </div>
                    )}
                    {currentBox && !isGlobalPurpose && (
                        <div className="absolute bg-white/20 pointer-events-none" style={{ boxShadow: '0 0 0 1px white', left: `${currentBox.x * 100}%`, top: `${currentBox.y * 100}%`, width: `${currentBox.width * 100}%`, height: `${currentBox.height * 100}%` }} />
                    )}
                    <button onClick={(e) => { e.stopPropagation(); onRemove(); }} disabled={isLoading} className="absolute top-0 right-0 bg-white border-l border-b border-gray-200 p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-50 transition-colors z-20 disabled:opacity-50 opacity-0 group-hover:opacity-100" aria-label="Remove">
                        <XIcon className="h-3 w-3" />
                    </button>
                    {currentBox && (
                        <button onClick={(e) => { e.stopPropagation(); handleClearSelection(); }} className="absolute bottom-2 right-2 bg-white border border-black text-black text-[11px] px-2 py-1 uppercase tracking-wider hover:bg-gray-100 z-20">清除选区</button>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <PurposeSelector value={object.purpose} onChange={(newPurpose) => onUpdate({ purpose: newPurpose })} options={getPurposeOptions(module)} disabled={isLoading} />
                {showBodyStatsPanel && (
                    <div className="bg-teal-50/30 border border-gray-200 p-3 flex flex-col gap-3">
                        <button onClick={() => setShowBodyStats(!showBodyStats)} className="flex items-center justify-between w-full text-left">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-accent-color)]">模特参数 (身份锁定)</span>
                            <ChevronDownIcon className={`w-3 h-3 text-[var(--brand-accent-color)] transition-transform ${showBodyStats ? 'rotate-180' : ''}`} />
                        </button>
                        {showBodyStats && (
                            <div className="flex flex-col gap-2 animate-fade-in pt-2 border-t border-[var(--brand-accent-color)]/20">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col"><label className="text-[11px] uppercase text-gray-500 mb-1">年龄 (Age)</label><input type="text" className="input-styled w-full" value={modelStats.age} onChange={(e) => onModelStatsChange({ ...modelStats, age: e.target.value })} placeholder="如：24" /></div>
                                    <div className="flex flex-col"><label className="text-[11px] uppercase text-gray-500 mb-1">体型 (Type)</label><select className="select-styled w-full" value={modelStats.bodyType} onChange={(e) => onModelStatsChange({ ...modelStats, bodyType: e.target.value as any })}><option value="unchanged">保持原样 (Unchanged)</option><option value="average">标准 (Standard)</option><option value="slim">苗条 (Slim)</option><option value="athletic">运动 (Athletic)</option><option value="plus-size">大码 (Plus Size)</option></select></div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col"><label className="text-[11px] uppercase text-gray-500 mb-1">身高 (Height)</label><input type="text" className="input-styled w-full" value={modelStats.height} onChange={(e) => onModelStatsChange({ ...modelStats, height: e.target.value })} placeholder="如：175cm" /></div>
                                    <div className="flex flex-col"><label className="text-[11px] uppercase text-gray-500 mb-1">体重 (Weight)</label><input type="text" className="input-styled w-full" value={modelStats.weight} onChange={(e) => onModelStatsChange({ ...modelStats, weight: e.target.value })} placeholder="如：55kg" /></div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                <div className="relative">
                    <input type="text" value={object.description} onChange={(e) => onUpdate({ description: e.target.value })} placeholder={isBaseModel ? '添加描述 (如：红裙子)...' : '描述素材...'} className="w-full text-xs bg-transparent border-b border-gray-200 py-2 focus:border-[var(--brand-accent-color)] transition-colors outline-none placeholder:text-gray-300 font-serif italic" disabled={isLoading || (isBaseModel && !object.boundingBox)} />
                </div>
            </div>
        </div>
    );
};
const ReferenceImageSlot = withDragAndDrop(ReferenceImageSlotComponent);

const ReferencePanel: React.FC<ReferencePanelProps> = ({ referenceObjects, onReferenceObjectsChange, isLoading, module, modelStats, onModelStatsChange }) => {
    const MAX_REFS = 7;
    const [libraryModels, setLibraryModels] = useState<LibraryModel[]>([]);

    // 1. Load models from local storage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setLibraryModels(JSON.parse(stored));
            }
        } catch (e) { console.error(e); }
    }, []);

    // 2. Helper to Save new upload to Library automatically
    const saveToLibrary = async (file: File) => {
        try {
            const compressedDataUrl = await compressImage(file, 1024, 0.8);
            const newModel: LibraryModel = {
                id: Date.now().toString(),
                name: file.name.replace(/\.[^/.]+$/, "").substring(0, 12),
                dataUrl: compressedDataUrl,
                createdAt: Date.now()
            };
            const updatedModels = [...libraryModels, newModel];
            setLibraryModels(updatedModels);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedModels));
        } catch (e) {
            console.error("Auto-save to library failed", e);
        }
    };

    const handleFileAdd = (file: File) => {
        if (referenceObjects.length < MAX_REFS) {
            const defaultPurpose = module === 'still_life' ? 'craft_flat_lay' : 'clothing_garment';
            onReferenceObjectsChange([
                ...referenceObjects,
                { file, description: '', id: Date.now().toString(), purpose: defaultPurpose as ReferencePurpose }
            ]);
        }
    };

    // Called when clicking a model from the mini-library in Step 1
    const handleLibraryModelSelect = (model: LibraryModel) => {
        const file = dataURLtoFile(model.dataUrl, model.name);
        onReferenceObjectsChange([
            ...referenceObjects,
            { file, description: model.name, id: Date.now().toString(), purpose: 'baseModel' }
        ]);
    };

    // Called when uploading a NEW model in Step 1
    const handleBaseModelUpload = (file: File) => {
        // Save to library first
        saveToLibrary(file);

        // Then set as current
        onReferenceObjectsChange([
            ...referenceObjects,
            { file, description: file.name, id: Date.now().toString(), purpose: 'baseModel' }
        ]);
    };

    const handleUpdate = (index: number, updatedObject: Partial<ReferenceObject>) => {
        const newObjects = [...referenceObjects];
        const oldObject = newObjects[index];
        newObjects[index] = { ...oldObject, ...updatedObject };

        if (updatedObject.purpose === 'baseModel' && oldObject.purpose !== 'baseModel') {
            newObjects.forEach((obj, i) => {
                if (i !== index && obj.purpose === 'baseModel') {
                    obj.purpose = module === 'still_life' ? 'craft_flat_lay' : 'clothing_garment';
                    obj.boundingBox = undefined;
                    obj.mask = undefined;
                }
            });
            newObjects[index].boundingBox = undefined;
            newObjects[index].mask = undefined;
        }

        if (updatedObject.purpose && GLOBAL_PURPOSES.includes(updatedObject.purpose)) {
            newObjects[index].boundingBox = undefined;
            newObjects[index].mask = undefined;
        }

        onReferenceObjectsChange(newObjects);
    };

    const handleRemove = (index: number) => {
        const removedObject = referenceObjects[index];
        const newObjects = [...referenceObjects];
        newObjects.splice(index, 1);

        if (removedObject.purpose === 'baseModel' && newObjects.length > 0) {
            newObjects[0].purpose = 'baseModel';
            newObjects[0].boundingBox = undefined;
            newObjects[0].mask = undefined;
        }

        onReferenceObjectsChange(newObjects);
    };

    const baseModelIndex = referenceObjects.findIndex(r => r.purpose === 'baseModel');
    const baseModel = baseModelIndex !== -1 ? referenceObjects[baseModelIndex] : null;

    const getSectionTitles = () => {
        if (module === 'still_life') {
            return { step2: '第二步：场景道具 (Step 2: Scene & Props)' };
        }
        return { step2: '第二步：服装拍摄物料 (Step 2: Garment Assets)' };
    };
    const titles = getSectionTitles();

    return (
        <div className="w-full flex flex-col gap-6 relative">

            {/* SECTION 1: MODEL / MAIN PRODUCT */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                    <UserIcon className="w-5 h-5 text-[var(--brand-accent-color)]" />
                    <h3 className="text-sm font-bold text-gray-900">
                        {module === 'still_life' ? '静物拍摄主体' : '企业试衣模特'}
                    </h3>
                </div>

                {!baseModel && (
                    <p className="text-[11px] text-gray-500 leading-relaxed -mt-2 mb-2">
                        {module === 'still_life'
                            ? '上传静物/商品图片。AI 将保留商品细节，仅进行场景合成。'
                            : '选择企业自有模特 (9:16) 或上传新模特。'}
                    </p>
                )}

                <div className="w-full">
                    {baseModel ? (
                        <ReferenceImageSlot
                            object={baseModel}
                            onFileChange={(file) => {
                                handleUpdate(baseModelIndex, { file });
                            }}
                            onUpdate={(update) => handleUpdate(baseModelIndex, update)}
                            onRemove={() => handleRemove(baseModelIndex)}
                            isLoading={isLoading}
                            module={module}
                            modelStats={modelStats}
                            onModelStatsChange={onModelStatsChange}
                            aspectRatioClass="aspect-square"
                        />
                    ) : (
                        // EMPTY STATE: Show Library Grid if models exist, else show Upload Slot
                        module !== 'still_life' && libraryModels.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                                {/* Upload New Card */}
                                <ReferenceImageSlot
                                    object={undefined}
                                    onFileChange={(file) => handleBaseModelUpload(file)}
                                    onUpdate={() => { }}
                                    onRemove={() => { }}
                                    isLoading={isLoading}
                                    module={module}
                                    aspectRatioClass="aspect-square"
                                    placeholderContent={
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <div className="p-2 rounded-full bg-gray-50 border border-gray-200 group-hover:bg-[var(--brand-accent-color)] group-hover:text-white transition-colors">
                                                <UploadIcon className="w-4 h-4 text-gray-400 group-hover:text-white" />
                                            </div>
                                            <span className="text-[11px] font-bold text-gray-500 mt-2">上传新模特</span>
                                        </div>
                                    }
                                />
                                {/* Existing Library Models */}
                                {libraryModels.map(model => (
                                    <div
                                        key={model.id}
                                        onClick={() => handleLibraryModelSelect(model)}
                                        className="relative aspect-[3/4] bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-[var(--brand-accent-color)] group"
                                    >
                                        <img src={model.dataUrl} className="w-full h-full object-cover" alt={model.name} />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        <div className="absolute bottom-0 left-0 w-full p-1 bg-gradient-to-t from-black/50 to-transparent">
                                            <span className="text-[11px] text-white truncate block">{model.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Default Big Upload Slot (No library or Still Life)
                            <ReferenceImageSlot
                                object={undefined}
                                onFileChange={(file) => handleBaseModelUpload(file)}
                                onUpdate={() => { }}
                                onRemove={() => { }}
                                isLoading={isLoading}
                                module={module}
                                aspectRatioClass="aspect-square"
                                placeholderContent={
                                    <div className="flex flex-col items-center justify-center gap-2 text-center w-full h-full">
                                        <div className="p-3 rounded-full bg-white border border-gray-200 group-hover:scale-110 transition-transform shadow-sm">
                                            <ArrowRightIcon className="w-4 h-4 text-gray-400 group-hover:text-[var(--brand-accent-color)] -rotate-90" />
                                        </div>
                                        <div className="mt-2">
                                            <span className="block text-xs font-bold text-gray-700">添加模特</span>
                                            <span className="block text-[11px] text-gray-400 mt-1">支持拖拽 / 自动入库</span>
                                        </div>
                                    </div>
                                }
                            />
                        )
                    )}
                </div>
            </div>

            {/* SECTION 2: GARMENTS / ASSETS */}
            <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                    <span className="text-[var(--brand-accent-color)]">02</span>
                    {titles.step2}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    {referenceObjects.map((object, index) => {
                        if (object.purpose === 'baseModel') return null;
                        return (
                            <ReferenceImageSlot
                                key={object.id}
                                object={object}
                                onFileChange={(file) => handleUpdate(index, { file })}
                                onUpdate={(update) => handleUpdate(index, update)}
                                onRemove={() => handleRemove(index)}
                                isLoading={isLoading}
                                module={module}
                                modelStats={undefined}
                                onModelStatsChange={undefined}
                                aspectRatioClass="aspect-square"
                            />
                        );
                    })}
                    {/* Add New Slot */}
                    {referenceObjects.length < MAX_REFS && (
                        <ReferenceImageSlot
                            key="add-new"
                            object={undefined}
                            onFileChange={handleFileAdd}
                            onUpdate={() => { }}
                            onRemove={() => { }}
                            isLoading={isLoading}
                            module={module}
                            aspectRatioClass="aspect-square"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default ReferencePanel;

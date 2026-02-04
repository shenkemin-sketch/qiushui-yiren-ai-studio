
import React, { useState, useEffect } from 'react';
import { WorkflowModule, ShotDefinition, ShotResult, ModelStats, ShotCategory, ProductCategory, ShotEnvironment, ShotPack } from '../types';
import { getLookbookShots, getStillLifeShots, CAMPAIGN_SHOTS } from '../data/shotDefinitions';
import { UploadIcon, XCircleIcon, PlusIcon } from './icons';

interface ProductionPanelProps {
    module: WorkflowModule;
    baseModel: File | null;
    modelStats: ModelStats;
    results: Record<string, ShotResult>; // Map shotId -> Result
    isGenerating: boolean;
    onSelectionChange: (selectedIds: string[]) => void;
    onGenerate: (selectedIds: string[]) => void;
    onRetryShot: (shotId: string) => void;
    onDownload: (shotId: string) => void;
    onDownloadAll: () => void;
    // New prop for local reference binding
    onUpdateShotReference: (shotId: string, file: File | null) => void;
    shotReferences: Record<string, File>; // Map shotId -> Local Reference File
}

const CATEGORIES: { value: ProductCategory; label: string }[] = [
    { value: 'dress', label: '连衣裙 (Dress)' },
    { value: 'top', label: '上装 (Top)' },
    { value: 'pants', label: '下装/裤 (Pants)' },
    { value: 'skirt', label: '半身裙 (Skirt)' },
    { value: 'shorts', label: '短裤/短裙 (Shorts)' },
    { value: 'coat', label: '外套 (Coat)' },
    { value: 'matching_set', label: '套装 (Set)' },
];

const ProductionPanel: React.FC<ProductionPanelProps> = ({
    module,
    results,
    isGenerating,
    onSelectionChange,
    onGenerate,
    onRetryShot,
    onDownload,
    onUpdateShotReference,
    shotReferences
}) => {
    const [shots, setShots] = useState<ShotDefinition[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [productCategory, setProductCategory] = useState<ProductCategory>('dress');
    const [shotEnvironment, setShotEnvironment] = useState<ShotEnvironment>('indoor');
    const [shotPacks, setShotPacks] = useState<Set<ShotPack>>(new Set(['standard']));
    const [customShots, setCustomShots] = useState<ShotDefinition[]>([]);

    // Load definitions on module or category change
    useEffect(() => {
        if (module === 'lookbook') {
            const defs = getLookbookShots(productCategory, Array.from(shotPacks), shotEnvironment);
            setShots(defs);
            // Auto Select All for S-Grade workflow workflow efficiency
            setSelectedIds(new Set(defs.map(s => s.id)));
        } else if (module === 'campaign') {
            setShots([...CAMPAIGN_SHOTS, ...customShots]);
            // Default select all 4 core shots
            setSelectedIds(new Set(CAMPAIGN_SHOTS.map(s => s.id)));
        } else if (module === 'still_life') {
            // New Phase 4: Category-Specific Still Life
            const defs = getStillLifeShots(productCategory);
            setShots([...defs, ...customShots]);
            setSelectedIds(new Set(defs.map(s => s.id)));
        }
    }, [module, productCategory, shotPacks, shotEnvironment, customShots.length]); // Re-run when dependencies change


    useEffect(() => {
        onSelectionChange(Array.from(selectedIds));
    }, [selectedIds]);

    const toggleSelection = (id: string) => {
        if (isGenerating) return;
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const handleSelectAll = (select: boolean) => {
        if (isGenerating) return;
        if (select) setSelectedIds(new Set(shots.map(s => s.id)));
        else setSelectedIds(new Set());
    };

    const handleAddCustomShot = () => {
        const newId = `campaign_custom_${Date.now()}`;
        const newShot: ShotDefinition = {
            id: newId,
            name: `Custom Shot ${customShots.length + 1}`,
            category: 'creative',
            aspectRatio: '3:4',
            description: 'Custom added shot.',
            promptTemplate: '[SHOT: CUSTOM] Artistic composition.'
        };
        setCustomShots([...customShots, newShot]);
        // Also auto-select it
        setSelectedIds(prev => new Set(prev).add(newId));
    };

    // Drag and Drop for Local References
    const handleCardDrop = (e: React.DragEvent, shotId: string) => {
        e.preventDefault();
        e.stopPropagation();

        // This accepts files dragged from desktop or (future) sidebar if implemented via DnD API
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            onUpdateShotReference(shotId, file);
        }
    };

    const handleCardDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // Grouping
    const groupedShots = shots.reduce((acc, shot) => {
        const cat = shot.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(shot);
        return acc;
    }, {} as Record<ShotCategory, ShotDefinition[]>);

    const categoriesList = [
        { key: 'basic', label: 'S 级标准镜头' },
        { key: 'creative', label: 'S 级创意镜头' },
        { key: 'supplement', label: '唯品会增补' },
        { key: 'standard', label: '标准静物' }
    ];

    return (
        <div className="flex flex-col h-full bg-gray-50/50">
            {/* Toolbar */}
            <div className="min-h-20 py-4 border-b border-gray-200 bg-white px-4 md:px-8 flex flex-col md:flex-row md:items-center justify-between shadow-sm z-10 gap-4 md:gap-0">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 flex-1">
                    <h2 className="text-xl font-serif font-medium text-gray-900 leading-none shrink-0">
                        {module === 'lookbook' && '棚拍生产线'}
                        {module === 'campaign' && '大片生产线'}
                        {module === 'still_life' && '静物生产线'}
                    </h2>

                    <div className="flex flex-wrap items-center gap-4">
                        {/* Show Category Selector for BOTH Lookbook and Still Life */}
                        {(module === 'lookbook' || module === 'still_life') && (
                            <div className="flex items-center gap-2">
                                <select
                                    value={productCategory}
                                    onChange={(e) => setProductCategory(e.target.value as ProductCategory)}
                                    className="bg-gray-100 border-none text-xs font-bold uppercase rounded px-2 py-1.5 text-gray-900 cursor-pointer hover:bg-gray-200 outline-none transition-colors"
                                >
                                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                        )}

                        {/* New S-Grade Controls */}
                        {module === 'lookbook' && (
                            <>
                                <div className="h-4 w-px bg-gray-200 hidden md:block"></div>

                                {/* Environment Selector */}
                                <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                                    <button
                                        onClick={() => setShotEnvironment('indoor')}
                                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${shotEnvironment === 'indoor' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        内景棚拍
                                    </button>
                                    <button
                                        onClick={() => setShotEnvironment('outdoor')}
                                        className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${shotEnvironment === 'outdoor' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        外景街拍
                                    </button>
                                </div>

                                {/* VIP Pack Toggle */}
                                <label className="flex items-center gap-2 cursor-pointer group ml-2">
                                    <input
                                        type="checkbox"
                                        className="checkbox-accent w-4 h-4 rounded border-gray-300 text-[var(--brand-accent-color)] focus:ring-[var(--brand-accent-color)]"
                                        checked={shotPacks.has('vip')}
                                        onChange={(e) => {
                                            const next = new Set(shotPacks);
                                            if (e.target.checked) next.add('vip');
                                            else next.delete('vip');
                                            setShotPacks(next);
                                        }}
                                    />
                                    <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-900 transition-colors select-none uppercase tracking-wider">唯品会增补 (+3)</span>
                                </label>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        <button onClick={() => handleSelectAll(true)} className="text-[11px] font-bold text-gray-400 hover:text-gray-900">全选</button>
                        <span className="text-gray-300">/</span>
                        <button onClick={() => handleSelectAll(false)} className="text-[11px] font-bold text-gray-400 hover:text-gray-900">全不选</button>
                    </div>

                    <div className="h-8 w-px bg-gray-200 mx-2"></div>

                    {isGenerating ? (
                        <div className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-full cursor-wait opacity-90">
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span className="text-xs font-bold tracking-widest">正在生成 {selectedIds.size} 张...</span>
                        </div>
                    ) : (
                        <button
                            onClick={() => onGenerate(Array.from(selectedIds))}
                            disabled={selectedIds.size === 0}
                            className="bg-gray-900 hover:bg-[var(--brand-accent-color)] text-white px-6 py-3 rounded-full text-xs font-bold tracking-widest transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <span>开始生成</span>
                            <span className="bg-white/20 px-1.5 py-0.5 rounded text-[11px]">{selectedIds.size}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-[1600px] mx-auto space-y-12">
                    {/* Campaign: Add Shot Button at top or bottom? Let's put a special section if Campaign */}
                    {module === 'campaign' && (
                        <div className="flex justify-end">
                            <button onClick={handleAddCustomShot} className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all">
                                <PlusIcon className="w-4 h-4" />
                                添加自定义镜头
                            </button>
                        </div>
                    )}

                    {categoriesList.map(cat => {
                        const catShots = groupedShots[cat.key as ShotCategory];
                        if (!catShots || catShots.length === 0) return null;

                        return (
                            <section key={cat.key} className="animate-fade-in-up">
                                <div className="flex items-center gap-4 mb-6">
                                    <h3 className="text-lg font-serif italic text-gray-400">{cat.label}</h3>
                                    <div className="h-px bg-gray-200 flex-1"></div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                    {catShots.map(shot => {
                                        const result = results[shot.id] || { shotId: shot.id, status: 'idle', selected: false };
                                        const isSelected = selectedIds.has(shot.id);
                                        const isDone = result.status === 'success' && result.imageUrl;
                                        const isBusy = result.status === 'generating';
                                        const localRef = shotReferences[shot.id];

                                        return (
                                            <div
                                                key={shot.id}
                                                className={`
                                                    relative group bg-white border transition-all duration-300 rounded-lg overflow-hidden flex flex-col
                                                    ${isSelected ? 'border-gray-900 ring-1 ring-gray-900 shadow-xl scale-[1.01]' : 'border-gray-100 shadow-sm opacity-80 hover:opacity-100'}
                                                    ${isBusy ? 'ring-2 ring-indigo-500/20' : ''}
                                                `}
                                                onClick={() => toggleSelection(shot.id)}
                                                onDrop={(e) => handleCardDrop(e, shot.id)}
                                                onDragOver={handleCardDragOver}
                                            >
                                                {/* Image Area */}
                                                <div className="aspect-[3/4] bg-gray-50 relative overflow-hidden">
                                                    {isDone ? (
                                                        <img src={result.imageUrl} alt={shot.name} className="w-full h-full object-cover animate-fade-in" />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                                                            {/* Empty State / Prompt Info */}
                                                            <span className="text-3xl font-serif text-gray-200 mb-2">{shot.id.split('_').pop()?.substring(0, 1).toUpperCase()}</span>
                                                            <p className="text-[11px] text-gray-400 uppercase tracking-widest">{shot.aspectRatio}</p>

                                                            {/* Drop Zone Hint */}
                                                            {!isBusy && (
                                                                <div className="mt-8 pt-8 border-t border-dashed border-gray-200 w-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-2">
                                                                    <UploadIcon className="w-4 h-4 text-gray-300" />
                                                                    <span className="text-[11px] text-gray-400">拖入参考图</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Busy Overlay */}
                                                    {isBusy && (
                                                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
                                                            <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                                                        </div>
                                                    )}

                                                    {/* Local Reference Indicator/Preview */}
                                                    {localRef && !isDone && (
                                                        <div className="absolute bottom-2 right-2 w-12 h-16 bg-white border border-gray-200 shadow-md p-0.5 rounded z-10 rotate-3 group-hover:rotate-0 transition-transform">
                                                            <img src={URL.createObjectURL(localRef)} className="w-full h-full object-cover rounded-[2px]" />
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); onUpdateShotReference(shot.id, null as any); }}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:scale-110"
                                                            >
                                                                <XCircleIcon className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Footer Info */}
                                                <div className="p-4 bg-white border-t border-gray-100 flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide">{shot.name}</h4>
                                                            {isSelected && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                                                        </div>
                                                        <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3">{shot.description}</p>

                                                        {localRef && (
                                                            <div className="mt-2 flex items-center gap-1 text-[11px] text-[var(--brand-accent-color)] font-medium bg-orange-50 px-2 py-1 rounded w-fit">
                                                                <span>★ 已绑定参考</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Result Actions */}
                                                    {isDone && (
                                                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); onDownload(shot.id); }}
                                                                className="flex-1 py-1.5 text-[11px] font-bold border border-gray-200 rounded hover:bg-gray-50"
                                                            >
                                                                保存
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); onRetryShot(shot.id); }}
                                                                className="flex-1 py-1.5 text-[11px] font-bold border border-gray-200 rounded hover:bg-gray-50"
                                                            >
                                                                重试
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProductionPanel;


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


// Fix: import useState and useEffect from React to resolve reference errors.
import React, { useState, useEffect } from 'react';
import { generateEditedImage } from './services/geminiService';
import Header from './components/Header';
import ReferencePanel, { type ReferenceObject } from './components/AddProductModal';
import { LoadingOverlay } from './components/LoadingOverlay';
import { EditorToolbar } from './components/EditorToolbar';
import InvitationScreen from './components/InvitationScreen';
import StartScreen from './components/StartScreen';
import StrategyPanel from './components/StrategyPanel';
import AspectRatioPanel from './components/AspectRatioPanel';

import ResultRefiner from './components/ResultRefiner';
import EditorCanvas from './components/EditorCanvas';
import ProductionPanel from './components/ProductionPanel';
import { WorkflowModule, ModelStats, DEFAULT_MODEL_STATS, ShotResult, ShotDefinition } from './types';
import { CAMPAIGN_SHOTS, STILL_LIFE_CREATIVE_SHOTS, STILL_LIFE_TOPS_SHOTS, STILL_LIFE_BOTTOMS_SHOTS, STILL_LIFE_DRESSES_SHOTS, getLookbookShots } from './data/shotDefinitions';

// 辅助函数：将 data URL 字符串转换为 File 对象
const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    if (arr.length < 2) throw new Error("无效的数据 URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) {
        throw new Error("无法从数据 URL 解析 MIME 类型");
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

const preprocessImageForAspectRatio = async (
    file: File,
    aspectRatio: string
): Promise<{ imageFile: File; maskFile: File }> => {
    const [width, height] = aspectRatio.split(':').map(Number);
    if (!width || !height) throw new Error("无效的宽高比格式");
    const targetRatio = width / height;

    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = reject;
        image.src = objectUrl;
    });

    const { naturalWidth: w, naturalHeight: h } = image;
    const originalRatio = w / h;

    let canvasWidth = w, canvasHeight = h;
    let dx = 0, dy = 0;

    if (Math.abs(originalRatio - targetRatio) > 0.01) {
        if (originalRatio > targetRatio) {
            canvasWidth = w;
            canvasHeight = w / targetRatio;
            dy = (canvasHeight - h) / 2;
        } else {
            canvasHeight = h;
            canvasWidth = h * targetRatio;
            dx = (canvasWidth - w) / 2;
        }
    }

    const imageCanvas = document.createElement('canvas');
    imageCanvas.width = canvasWidth;
    imageCanvas.height = canvasHeight;
    const imageCtx = imageCanvas.getContext('2d');
    if (!imageCtx) throw new Error("无法获取图像画布上下文");
    imageCtx.drawImage(image, dx, dy, w, h);

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvasWidth;
    maskCanvas.height = canvasHeight;
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) throw new Error("无法获取蒙版画布上下文");
    maskCtx.fillStyle = 'white';
    maskCtx.fillRect(0, 0, canvasWidth, canvasHeight);
    maskCtx.fillStyle = 'black';
    maskCtx.fillRect(dx, dy, w, h);

    URL.revokeObjectURL(objectUrl);

    const imageFile = dataURLtoFile(imageCanvas.toDataURL('image/png'), 'preprocessed_image.png');
    const maskFile = dataURLtoFile(maskCanvas.toDataURL('image/png'), 'outpainting_mask.png');

    return { imageFile, maskFile };
};



type AppState = 'invitation' | 'start' | 'editor' | 'generating';

interface HistoryState {
    image: string;
    references: ReferenceObject[];
}

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('invitation');
    const [currentModule, setCurrentModule] = useState<WorkflowModule>('lookbook');
    const [referenceObjects, setReferenceObjects] = useState<ReferenceObject[]>([]);
    const [modelStats, setModelStats] = useState<ModelStats>(DEFAULT_MODEL_STATS);

    const [error, setError] = useState<string | null>(null);
    const [stylePrompt, setStylePrompt] = useState('');
    const [outputAspectRatio, setOutputAspectRatio] = useState<string>('auto');
    const [exhaustedModels, setExhaustedModels] = useState<Set<string>>(new Set());

    const [history, setHistory] = useState<HistoryState[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [isRefining, setIsRefining] = useState(false);

    // Batch Production State
    const [shotResults, setShotResults] = useState<Record<string, ShotResult>>({});
    const [shotReferences, setShotReferences] = useState<Record<string, File>>({}); // Map shotId -> File
    const [isBatchGenerating, setIsBatchGenerating] = useState(false);

    // Helper: Get Shot Definition - Needs to search dynamically now
    const getShotDefinition = (module: WorkflowModule, id: string): ShotDefinition | undefined => {
        let all: ShotDefinition[] = [];
        if (module === 'lookbook') {
            // Search in all categories to find the ID
            const categories: any[] = ['dress', 'top', 'pants', 'skirt', 'coat', 'matching_set'];
            // This is inefficient but functional for small lists. 
            // In a real app, maybe pass current category or use flat map.
            // But since getLookbookShots() returns 15 shots specific to a category, 
            // valid IDs might depend on user's current category choice.
            // HOWEVER: 'handleBatchGenerate' receives IDs. 
            // If the user switched categories, the ID might not exist in the *current* category view.
            // Strategy: Search ALL possible shots to be safe.
            all = categories.flatMap(c => getLookbookShots(c));
            // Remove duplicates (commons are repeated)
            const map = new Map();
            all.forEach(s => map.set(s.id, s));
            all = Array.from(map.values());
        }
        else if (module === 'campaign') all = CAMPAIGN_SHOTS; // And Custom shots? Custom shots are local to ProductionPanel.. this is tricky.
        else if (module === 'still_life') all = [...STILL_LIFE_CREATIVE_SHOTS, ...STILL_LIFE_TOPS_SHOTS, ...STILL_LIFE_BOTTOMS_SHOTS, ...STILL_LIFE_DRESSES_SHOTS];

        return all.find(s => s.id === id);
    };

    useEffect(() => {
        const hasAccess = localStorage.getItem('betaAccessGranted') === 'true';
        if (hasAccess) {
            setAppState('start');
        }
    }, []);

    const handleAccessGranted = () => {
        setAppState('start');
    };

    const handleModeSelect = (module: WorkflowModule, files: FileList | null) => {
        setCurrentModule(module);

        // Scenario 1: User uploaded a file from start screen
        if (files && files[0]) {
            const file = files[0];
            const newRef: ReferenceObject = {
                file,
                description: '',
                id: Date.now().toString(),
                purpose: 'baseModel',
            };
            setReferenceObjects([newRef]);

            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                setGeneratedImageUrl(imageUrl);
                const newHistoryState: HistoryState = { image: imageUrl, references: [newRef] };
                setHistory([newHistoryState]);
                setHistoryIndex(0);
            };
            reader.readAsDataURL(file);
            setAppState('editor');
        }
        // Scenario 2: User clicked "Enter" without a file
        else {
            setReferenceObjects([]);
            setGeneratedImageUrl(null);
            setHistory([]);
            setHistoryIndex(-1);
            setAppState('editor');
        }
    };

    const handleQuotaExhausted = (model: string) => {
        setExhaustedModels(prev => {
            const next = new Set(prev);
            next.add(model);
            return next;
        });
    };

    const handleGenerate = async (prompt?: string) => {
        const baseModelRef = referenceObjects.find(r => r.purpose === 'baseModel');

        if (!baseModelRef) {
            setError("请先指定一张主图 (Main Subject)。");
            return;
        }

        setAppState('generating');
        setError(null);

        try {
            const needsInpainting = !!baseModelRef.mask;
            const needsSpecificRatio = outputAspectRatio && outputAspectRatio !== 'auto';
            let finalResultUrl: string;

            if (needsInpainting && needsSpecificRatio) {
                // Step 1: Inpainting
                const inpaintingResultUrl = await generateEditedImage(
                    baseModelRef.file,
                    referenceObjects,
                    prompt,
                    'auto',
                    undefined,
                    undefined,
                    currentModule,
                    modelStats,
                    false,
                    handleQuotaExhausted
                );

                // Step 2: Outpainting for Ratio
                const intermediateFile = dataURLtoFile(inpaintingResultUrl, 'inpainted_image.png');
                const { imageFile, maskFile } = await preprocessImageForAspectRatio(
                    intermediateFile,
                    outputAspectRatio
                );

                const outpaintingRefs = referenceObjects.map(ref =>
                    ref.purpose === 'baseModel'
                        ? { ...ref, file: intermediateFile, mask: undefined, description: '' }
                        : ref
                );

                finalResultUrl = await generateEditedImage(
                    imageFile,
                    outpaintingRefs,
                    prompt,
                    outputAspectRatio,
                    maskFile,
                    undefined,
                    currentModule,
                    modelStats,
                    false,
                    handleQuotaExhausted
                );

            } else if (needsSpecificRatio && !needsInpainting) {
                // Outpainting Only
                const { imageFile, maskFile } = await preprocessImageForAspectRatio(
                    baseModelRef.file,
                    outputAspectRatio
                );

                finalResultUrl = await generateEditedImage(
                    imageFile,
                    referenceObjects,
                    prompt,
                    outputAspectRatio,
                    maskFile,
                    undefined,
                    currentModule,
                    modelStats,
                    false,
                    handleQuotaExhausted
                );
            } else {
                // Standard
                finalResultUrl = await generateEditedImage(
                    baseModelRef.file,
                    referenceObjects,
                    prompt,
                    'auto',
                    undefined,
                    undefined,
                    currentModule,
                    modelStats,
                    false,
                    handleQuotaExhausted
                );
            }

            updateHistory(finalResultUrl);
            setGeneratedImageUrl(finalResultUrl);

        } catch (e: any) {
            console.error("生成失败:", e);
            setError(e.message || '生成图片时发生未知错误。');
        } finally {
            setAppState('editor');
        }
    };

    const handleBatchGenerate = async (selectedIds: string[]) => {
        const baseModelRef = referenceObjects.find(r => r.purpose === 'baseModel');
        if (!baseModelRef) {
            setError("请先上传主图 (Main Model/Product)");
            return;
        }

        setIsBatchGenerating(true);
        setError(null);

        // Initialize status for selected shots
        const initialupdates: Record<string, ShotResult> = {};
        selectedIds.forEach(id => {
            initialupdates[id] = { shotId: id, status: 'generating', selected: true };
        });
        setShotResults(prev => ({ ...prev, ...initialupdates }));

        // Sequential Generation Loop
        for (const id of selectedIds) {
            const shotDef = getShotDefinition(currentModule, id);
            if (!shotDef) continue;

            // Check if cancelled (simple check if user switched module or something, but basic for now)

            try {
                // Use Shot Definition Prompt + User Constraints
                const finalPrompt = shotDef.promptTemplate;

                // Construct References: Global Base + (Local Ref OR Global Refs)
                // If a local reference exists for this shot, it overrides the global "style/vibe" refs.
                // The Base Model always stays.
                const localRefFile = shotReferences[id];
                let currentShotRefs = [...referenceObjects]; // Default to all global

                if (localRefFile) {
                    // Create a temporary reference object for the local file
                    const localRefObj: ReferenceObject = {
                        id: `local_${id}`,
                        file: localRefFile,
                        purpose: 'style_makeup_hair', // Treat as strong guiding reference
                        description: 'Shot Specific Reference'
                    };
                    // Keep Base Model, Remove other "Style/Scene" refs, Add Local Ref
                    const baseRef = referenceObjects.find(r => r.purpose === 'baseModel');
                    const productRef = referenceObjects.find(r => r.purpose === 'clothing_garment');

                    const essentialRefs = [];
                    if (baseRef) essentialRefs.push(baseRef);
                    if (productRef) essentialRefs.push(productRef);

                    currentShotRefs = [...essentialRefs, localRefObj];
                }

                const url = await generateEditedImage(
                    baseModelRef.file,
                    currentShotRefs,
                    finalPrompt,
                    shotDef.aspectRatio,
                    undefined, // No outpainting mask auto-generated here yet
                    undefined,
                    currentModule,
                    modelStats,
                    false,
                    handleQuotaExhausted
                );

                setShotResults(prev => ({
                    ...prev,
                    [id]: { shotId: id, status: 'success', imageUrl: url, selected: true }
                }));

            } catch (e: any) {
                console.error(`Shot ${id} failed:`, e);
                setShotResults(prev => ({
                    ...prev,
                    [id]: { shotId: id, status: 'error', selected: true }
                }));
            }
        }
        setIsBatchGenerating(false);
    };

    const handleRetryShot = (id: string) => {
        handleBatchGenerate([id]);
    };

    const handleDownloadShot = (id: string) => {
        const result = shotResults[id];
        if (result?.imageUrl) {
            const link = document.createElement('a');
            link.href = result.imageUrl;
            link.download = `autumn-water-${currentModule}-${id}-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


    const handleRefinementApply = async (mask: File, prompt: string) => {
        if (!generatedImageUrl) return;
        setIsRefining(false);
        setAppState('generating');
        setError(null);

        try {
            const baseFile = dataURLtoFile(generatedImageUrl, "current_image.png");

            const resultUrl = await generateEditedImage(
                baseFile,
                [], // No references needed for refinement usually
                prompt,
                undefined,
                mask,
                undefined,
                currentModule,
                undefined,
                true, // isRefinement flag
                handleQuotaExhausted
            );

            updateHistory(resultUrl);
            setGeneratedImageUrl(resultUrl);

        } catch (e: any) {
            setError(e.message || '局部修改失败。');
        } finally {
            setAppState('editor');
        }
    };

    const updateHistory = (imageUrl: string) => {
        const newHistoryState: HistoryState = { image: imageUrl, references: [...referenceObjects] };
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newHistoryState);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setGeneratedImageUrl(history[newIndex].image);
            setReferenceObjects(history[newIndex].references);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setGeneratedImageUrl(history[newIndex].image);
            setReferenceObjects(history[newIndex].references);
        }
    };

    const handleNewCreation = () => {
        setAppState('start');
        setReferenceObjects([]);
        setError(null);
        setHistory([]);
        setHistoryIndex(-1);
        setGeneratedImageUrl(null);
        setStylePrompt('');
        setOutputAspectRatio('auto');
    };

    const handleDownload = () => {
        if (generatedImageUrl) {
            const link = document.createElement('a');
            link.href = generatedImageUrl;
            link.download = `autumn-water-${currentModule}-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const isLoading = appState === 'generating';

    const renderContent = () => {
        switch (appState) {
            case 'invitation':
                return <InvitationScreen onAccessGranted={handleAccessGranted} />;
            case 'start':
                return <StartScreen onModeSelect={handleModeSelect} />;
            case 'editor':
            case 'generating':
                return (
                    <div className="w-full h-full flex flex-col lg:flex-row items-stretch bg-[var(--bg-secondary)]">
                        {/* Sidebar: Refined Surface */}
                        <aside className="w-full lg:w-[400px] xl:w-[420px] lg:flex-shrink-0 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] p-8 flex flex-col gap-8 overflow-y-auto z-10 shadow-[var(--shadow-soft)]">
                            <ReferencePanel
                                referenceObjects={referenceObjects}
                                onReferenceObjectsChange={setReferenceObjects}
                                isLoading={isLoading}
                                module={currentModule}
                                modelStats={modelStats}
                                onModelStatsChange={setModelStats}
                            />
                            <AspectRatioPanel
                                selectedRatio={outputAspectRatio}
                                onRatioChange={setOutputAspectRatio}
                                disabled={isLoading}
                            />
                            <StrategyPanel
                                stylePrompt={stylePrompt}
                                onStylePromptChange={setStylePrompt}
                                disabled={isLoading}
                            />


                            <div className="mt-auto pt-8 flex flex-col gap-4">
                                {error && <p className="text-[var(--brand-accent)] text-[10px] uppercase tracking-wide border-l-2 border-[var(--brand-accent)] pl-2">{error}</p>}
                                <button
                                    onClick={() => handleGenerate()}
                                    disabled={isLoading || referenceObjects.length < 1}
                                    className="btn btn-primary w-full h-12 flex justify-center items-center gap-2 group text-sm tracking-widest uppercase shadow-md hover:shadow-xl transition-all"
                                >
                                    {isLoading ? '生成中...' : '开始生成套图'}
                                    {!isLoading && <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">→</span>}
                                </button>
                            </div>
                        </aside>

                        {/* Main Canvas Area */}
                        <main className="flex-1 flex flex-col items-center justify-center relative min-w-0 bg-[#F5F5F5]">
                            {isLoading && <LoadingOverlay module={currentModule} />}
                            {isRefining && generatedImageUrl && (
                                <ResultRefiner
                                    imageUrl={generatedImageUrl}
                                    onClose={() => setIsRefining(false)}
                                    onApplyRefinement={handleRefinementApply}
                                />
                            )}

                            {/* Replaced Static Image with EditorCanvas */}
                            <div className="w-full h-full p-0 flex flex-col">
                                {currentModule === 'lookbook' || currentModule === 'campaign' || currentModule === 'still_life' ? (
                                    <ProductionPanel
                                        module={currentModule}
                                        baseModel={referenceObjects.find(r => r.purpose === 'baseModel')?.file || null}
                                        modelStats={modelStats}
                                        results={shotResults}
                                        isGenerating={isBatchGenerating}
                                        onSelectionChange={(_ids) => { }} // Manage selection inside Panel
                                        onGenerate={handleBatchGenerate}
                                        onRetryShot={handleRetryShot}
                                        onDownload={handleDownloadShot}
                                        onDownloadAll={() => { }}
                                        shotReferences={shotReferences}
                                        onUpdateShotReference={(id, file) => {
                                            if (file === null) {
                                                const next = { ...shotReferences };
                                                delete next[id];
                                                setShotReferences(next);
                                            } else {
                                                setShotReferences(prev => ({ ...prev, [id]: file }));
                                            }
                                        }}
                                    />
                                ) : (
                                    <EditorCanvas
                                        imageUrl={generatedImageUrl}
                                        onUploadClick={() => document.getElementById('initial-upload-input')?.click()}
                                    />
                                )}
                            </div>
                        </main>
                    </div>
                );
        }
    };

    return (
        <div className="w-full h-full bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden flex flex-col font-sans relative">
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at center, #9A3B3B 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>
            <div className="relative z-10 w-full h-full flex flex-col">
                <Header
                    onLogoClick={(appState === 'editor' || appState === 'generating') ? handleNewCreation : undefined}
                    module={(appState === 'editor' || appState === 'generating') ? currentModule : undefined}
                />
                <div className="flex-1 min-h-0">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default App;

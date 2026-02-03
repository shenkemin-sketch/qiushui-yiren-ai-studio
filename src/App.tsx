import { Suspense, lazy } from 'react';
import Header from './components/Header';
import StartScreen from './components/StartScreen';
import Spinner from './components/Spinner';
import { useHistory } from './hooks/useHistory';
import { useWorkflow } from './hooks/useWorkflow';
import { useGeneration } from './hooks/useGeneration';

const ReferencePanel = lazy(() => import('./components/ReferencePanel'));
const StrategyPanel = lazy(() => import('./components/StrategyPanel'));
const ProductionPanel = lazy(() => import('./components/ProductionPanel'));
const ResultRefiner = lazy(() => import('./components/ResultRefiner'));

function App() {
    // 1. Workflow State
    const {
        appState,
        setAppState,
        currentModule,
        referenceObjects,
        setReferenceObjects,
        modelStats,
        setModelStats,
        stylePrompt,
        setStylePrompt,
        outputAspectRatio,
        setOutputAspectRatio,
        resetWorkflow,
        enterEditor
    } = useWorkflow();

    // 2. History State
    const {
        history,
        historyIndex,
        generatedImageUrl,
        updateHistory,
        undo,
        redo,
        resetHistory
    } = useHistory();

    // 3. Generation Logic
    const {
        error,
        exhaustedModels,
        isRefining,
        setIsRefining,
        shotResults,
        shotReferences,
        setShotReferences,
        isBatchGenerating,
        singleGenerate,
        batchGenerate,
        refineImage
    } = useGeneration(referenceObjects, currentModule, modelStats, outputAspectRatio, setAppState);

    // --- Handlers bridging hooks ---

    // Wrapper for Single Generation to update History
    const onGenerateClick = async () => {
        const url = await singleGenerate(stylePrompt);
        if (url) {
            updateHistory(url, referenceObjects);
        }
    };

    // Wrapper for Batch Generation
    const onBatchGenerateClick = async (selectedIds: string[]) => {
        await batchGenerate(selectedIds);
    };

    const onRefineApply = async (mask: File, prompt: string) => {
        if (!generatedImageUrl) return;
        const url = await refineImage(generatedImageUrl, mask, prompt);
        if (url) {
            updateHistory(url, referenceObjects);
            setIsRefining(false);
        }
    };

    // --- UI Rendering ---

    // --- UI Rendering ---

    // Simple layout switch
    if (appState === 'start') {
        return (
            <StartScreen
                onModeSelect={(mod, files) => {
                    if (files) {
                        enterEditor(mod, files, (url, ref) => resetHistory(url, [ref]));
                    } else {
                        // Enter with no files
                        enterEditor(mod, null, () => { });
                    }
                }}
            />
        );
    }

    const isProduction = currentModule === 'campaign' || currentModule === 'still_life';

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col font-sans text-neutral-900">
            <Header
                onLogoClick={resetWorkflow}
                module={currentModule}
            // Removed title logic as Header handles it now or it's static? Header component doesn't take 'title' prop in the viewed file.
            // It just takes module and onLogoClick. The title was "秋水伊人".
            />

            <main className="flex-1 max-w-[1600px] mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 transition-all">

                {/* Left: Configuration & References */}
                <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
                    <Suspense fallback={<div className="h-96 flex items-center justify-center bg-white rounded-xl"><Spinner size="lg" /></div>}>
                        <ReferencePanel
                            referenceObjects={referenceObjects}
                            onReferenceObjectsChange={setReferenceObjects}
                            isLoading={appState === 'generating'}
                            module={currentModule}
                            modelStats={modelStats}
                            onModelStatsChange={setModelStats}
                        />

                        <StrategyPanel
                            // currentModule passed but unused in updated component (via 'any'), keeping for compatibility if needed later
                            currentModule={currentModule}
                            // modelStats handled by ReferencePanel now, but passing just in case to satisfy old calling code if any
                            modelStats={modelStats}
                            setModelStats={setModelStats}

                            stylePrompt={stylePrompt}
                            onStylePromptChange={setStylePrompt}
                            aspectRatio={outputAspectRatio}
                            setAspectRatio={setOutputAspectRatio}
                            disabled={appState === 'generating'}
                        />
                    </Suspense>
                </div>

                {/* Center: Main Canvas (Single Mode) or Production Grid */}
                <div className={`${isProduction ? "lg:col-span-9" : "lg:col-span-6"} order-1 lg:order-2 min-h-[500px]`}>
                    {isProduction ? (
                        <Suspense fallback={<div className="h-full flex items-center justify-center bg-white rounded-xl"><Spinner size="lg" /></div>}>
                            <ProductionPanel
                                module={currentModule}
                                baseModel={referenceObjects.find(r => r.purpose === 'baseModel')?.file || null}
                                modelStats={modelStats}
                                results={shotResults}
                                onGenerate={onBatchGenerateClick}
                                isGenerating={isBatchGenerating}
                                onSelectionChange={() => { }} // Wired inside? ProductionPanel handles selection internally mostly
                                onRetryShot={() => { }} // Placeholder
                                onDownload={() => { }} // Placeholder
                                onDownloadAll={() => { }} // Placeholder
                                shotReferences={shotReferences}
                                onUpdateShotReference={(id, file) => {
                                    setShotReferences(prev => ({ ...prev, [id]: file! }));
                                }}
                            />
                        </Suspense>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-neutral-100 p-8 min-h-[600px] flex flex-col items-center justify-center relative">
                            {appState === 'generating' && (
                                <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center backdrop-blur-sm">
                                    <div className="animate-spin w-10 h-10 border-4 border-neutral-200 border-t-neutral-900 rounded-full mb-4" />
                                    <p className="text-neutral-500 font-medium">AI 正在构思画面...</p>
                                </div>
                            )}

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm max-w-md text-center">
                                    {error}
                                </div>
                            )}

                            {isRefining && generatedImageUrl ? (
                                <Suspense fallback={<div className="absolute inset-0 flex items-center justify-center bg-white/80"><Spinner /></div>}>
                                    <ResultRefiner
                                        imageUrl={generatedImageUrl}
                                        onClose={() => setIsRefining(false)}
                                        onApplyRefinement={onRefineApply}
                                    />
                                </Suspense>
                            ) : (
                                generatedImageUrl ? (
                                    <div className="relative group">
                                        <img src={generatedImageUrl} alt="Generated" className="max-h-[700px] w-auto object-contain rounded-lg shadow-md" />
                                        <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setIsRefining(true)} className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white">
                                                Modify
                                            </button>
                                            <a href={generatedImageUrl} download="yi-lens-creation.png" className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white">
                                                Download
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-neutral-400 text-center">
                                        <p>等待生成...</p>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Actions & History (Hidden in Production Mode for now, or moved) */}
                {!isProduction && (
                    <div className="col-span-3 space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
                            <button
                                onClick={onGenerateClick}
                                disabled={appState === 'generating'}
                                className="w-full bg-neutral-900 text-white py-4 rounded-lg font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {appState === 'generating' ? '生成中...' : '生成 Lookbook'}
                            </button>

                            <div className="mt-6 flex justify-between px-2">
                                <button onClick={() => undo(setReferenceObjects)} disabled={historyIndex <= 0} className="p-2 text-neutral-400 hover:text-neutral-900 disabled:opacity-30">Undo</button>
                                <span className="text-xs text-neutral-300 py-3">{historyIndex + 1} / {history.length}</span>
                                <button onClick={() => redo(setReferenceObjects)} disabled={historyIndex >= history.length - 1} className="p-2 text-neutral-400 hover:text-neutral-900 disabled:opacity-30">Redo</button>
                            </div>
                        </div>
                    </div>
                )}

            </main>

            {/* Global Quota Warning */}
            {exhaustedModels.size > 0 && (
                <div className="fixed bottom-4 left-4 right-4 bg-orange-50 border border-orange-100 p-4 rounded-lg shadow-lg flex items-center justify-between z-50">
                    <p className="text-orange-800 text-sm">
                        ⚠️ 部分模型配额已耗尽，系统自动切换至备用模型: {Array.from(exhaustedModels).join(', ')}
                    </p>
                    <button onClick={() => window.location.reload()} className="text-orange-900 font-bold text-sm">刷新配额</button>
                </div>
            )}
        </div>
    );
}

export default App;

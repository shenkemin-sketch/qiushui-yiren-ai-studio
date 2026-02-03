import { useState } from 'react';
import { generateEditedImage } from '../services/geminiService';
import { WorkflowModule, ModelStats, ShotResult, ShotDefinition, AppState, ProductCategory, ReferenceObject } from '../types';
import { CAMPAIGN_SHOTS, STILL_LIFE_CREATIVE_SHOTS, STILL_LIFE_TOPS_SHOTS, STILL_LIFE_BOTTOMS_SHOTS, STILL_LIFE_DRESSES_SHOTS, getLookbookShots } from '../data/shotDefinitions';

// Helper: Data URL to File
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

// Helper: Preprocess Image
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

// Helper: Get Shot Definition
const getShotDefinition = (module: WorkflowModule, id: string): ShotDefinition | undefined => {
    let all: ShotDefinition[] = [];
    if (module === 'lookbook') {
        const categories: ProductCategory[] = ['dress', 'top', 'pants', 'skirt', 'coat', 'matching_set'];
        all = categories.flatMap(c => getLookbookShots(c));
        const map = new Map();
        all.forEach(s => map.set(s.id, s));
        all = Array.from(map.values());
    }
    else if (module === 'campaign') all = CAMPAIGN_SHOTS;
    else if (module === 'still_life') all = [...STILL_LIFE_CREATIVE_SHOTS, ...STILL_LIFE_TOPS_SHOTS, ...STILL_LIFE_BOTTOMS_SHOTS, ...STILL_LIFE_DRESSES_SHOTS];

    return all.find(s => s.id === id);
};

export const useGeneration = (
    referenceObjects: ReferenceObject[],
    currentModule: WorkflowModule,
    modelStats: ModelStats,
    outputAspectRatio: string,
    setAppState: (state: AppState) => void
) => {
    const [error, setError] = useState<string | null>(null);
    const [exhaustedModels, setExhaustedModels] = useState<Set<string>>(new Set());
    const [isRefining, setIsRefining] = useState(false);

    // Batch Production State
    const [shotResults, setShotResults] = useState<Record<string, ShotResult>>({});
    const [shotReferences, setShotReferences] = useState<Record<string, File>>({});
    const [isBatchGenerating, setIsBatchGenerating] = useState(false);

    const handleQuotaExhausted = (model: string) => {
        setExhaustedModels(prev => {
            const next = new Set(prev);
            next.add(model);
            return next;
        });
    };

    const singleGenerate = async (prompt?: string): Promise<string | undefined> => {
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
            return finalResultUrl;

        } catch (e: any) {
            console.error("生成失败:", e);
            setError(e.message || '生成图片时发生未知错误。');
        } finally {
            setAppState('editor');
        }
    };

    const batchGenerate = async (selectedIds: string[]) => {
        const baseModelRef = referenceObjects.find(r => r.purpose === 'baseModel');
        if (!baseModelRef) {
            setError("请先上传主图 (Main Model/Product)");
            return;
        }

        setIsBatchGenerating(true);
        setError(null);

        const initialupdates: Record<string, ShotResult> = {};
        selectedIds.forEach(id => {
            initialupdates[id] = { shotId: id, status: 'generating', selected: true };
        });
        setShotResults(prev => ({ ...prev, ...initialupdates }));

        for (const id of selectedIds) {
            const shotDef = getShotDefinition(currentModule, id);
            if (!shotDef) continue;

            try {
                const finalPrompt = shotDef.promptTemplate;
                const localRefFile = shotReferences[id];
                let currentShotRefs = [...referenceObjects];

                if (localRefFile) {
                    const localRefObj: ReferenceObject = {
                        id: `local_${id}`,
                        file: localRefFile,
                        purpose: 'style_makeup_hair',
                        description: 'Shot Specific Reference'
                    };
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
                    undefined,
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

    const refineImage = async (generatedImageUrl: string, mask: File, prompt: string): Promise<string | undefined> => {
        setIsRefining(false);
        setAppState('generating');
        setError(null);

        try {
            const baseFile = dataURLtoFile(generatedImageUrl, "current_image.png");

            const resultUrl = await generateEditedImage(
                baseFile,
                [],
                prompt,
                undefined,
                mask,
                undefined,
                currentModule,
                undefined,
                true,
                handleQuotaExhausted
            );
            return resultUrl;

        } catch (e: any) {
            setError(e.message || '局部修改失败。');
        } finally {
            setAppState('editor');
        }
    };

    return {
        error,
        setError,
        exhaustedModels,
        isRefining,
        setIsRefining,
        shotResults,
        setShotResults,
        shotReferences,
        setShotReferences,
        isBatchGenerating,
        singleGenerate,
        batchGenerate,
        refineImage,
        dataURLtoFile // Export utility if needed
    };
};

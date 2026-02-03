/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GenerateContentResponse, Type } from "@google/genai";
import { type ReferenceObject } from "../types";
import { WorkflowModule, ModelStats, AI_MODELS } from "../types";

// --- UTILS: Image Compression ---
export const compressImage = async (file: File, maxDimension: number = 1536, quality: number = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxDimension) {
                    height = Math.round((height * maxDimension) / width);
                    width = maxDimension;
                }
            } else {
                if (height > maxDimension) {
                    width = Math.round((width * maxDimension) / height);
                    height = maxDimension;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error("Could not get canvas context"));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            const dataUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality);
            resolve(dataUrl);
        };

        img.onerror = (err) => {
            URL.revokeObjectURL(objectUrl);
            reject(err);
        };

        img.src = objectUrl;
    });
};

const dataUrlToPart = (dataUrl: string) => {
    const arr = dataUrl.split(',');
    if (arr.length < 2) throw new Error("无效的数据 URL");
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch || !mimeMatch[1]) throw new Error("无法从数据 URL 解析 MIME 类型");

    const mimeType = mimeMatch[1];
    const data = arr[1];
    return { inlineData: { mimeType, data } };
}

const fileToPart = async (file: File): Promise<{ inlineData: { mimeType: string; data: string; } }> => {
    const compressedDataUrl = await compressImage(file);
    return dataUrlToPart(compressedDataUrl);
};

// --- TYPE GUARD HELPERS ---
const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return String(error);
};

// --- RETRY WITH EXPONENTIAL BACKOFF ---
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

const withRetry = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 5,
    baseDelay: number = 2000
): Promise<T> => {
    let lastError: unknown;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: unknown) {
            lastError = error;
            const msg = getErrorMessage(error);

            // Only retry on rate limit (429) or server overload (503)
            const isRetryable = msg.includes('429') ||
                msg.includes('RESOURCE_EXHAUSTED') ||
                msg.includes('503') ||
                msg.includes('overloaded');

            if (!isRetryable || attempt === maxRetries - 1) {
                throw error;
            }

            const delay = Math.pow(2, attempt) * baseDelay;
            // console.log(`API 请求失败，${delay}ms 后重试 (${attempt + 1}/${maxRetries})...`);
            await sleep(delay);
        }
    }

    throw lastError;
};

// --- ERROR HANDLING WRAPPER ---
const wrapGenAICall = async <T>(fn: () => Promise<T>): Promise<T> => {
    return withRetry(async () => {
        try {
            return await fn();
        } catch (e: unknown) {
            const msg = getErrorMessage(e);
            console.error("Gemini API Error:", e);

            if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
                throw new Error("QUOTA_EXCEEDED"); // Internal code to detect quota issues
            }
            if (msg.includes('503') || msg.includes('overloaded')) {
                throw new Error("⚠️ 服务繁忙 (503)：AI 模型当前负载过高，请稍后重试。");
            }

            // Try to parse raw JSON error messages often returned by the SDK
            try {
                if (msg.trim().startsWith('{')) {
                    const parsed = JSON.parse(msg) as { error?: { message?: string; code?: number; status?: string } };
                    if (parsed.error?.message) {
                        // Check for quota inside parsed JSON
                        if (parsed.error.code === 429 || parsed.error.status === 'RESOURCE_EXHAUSTED') {
                            throw new Error("QUOTA_EXCEEDED");
                        }
                        throw new Error(`API 错误: ${parsed.error.message}`);
                    }
                }
            } catch (jsonErr: unknown) {
                // ignore parsing error, use original message
            }

            throw new Error(`请求失败: ${msg.length > 100 ? msg.substring(0, 100) + '...' : msg}`);
        }
    }, 5, 2000);
};

const handleApiResponse = (
    response: GenerateContentResponse,
    context: string
): string => {
    if (response.promptFeedback?.blockReason) {
        const { blockReason } = response.promptFeedback;
        const errorMessage = `创作请求被安全系统拦截，原因：${blockReason}。请调整你的输入后重试。`;
        console.error(errorMessage, { response });
        throw new Error(errorMessage);
    }

    const imagePartFromResponse = response.candidates?.[0]?.content?.parts?.find(
        part => part.inlineData
    );

    if (imagePartFromResponse?.inlineData) {
        const { mimeType, data } = imagePartFromResponse.inlineData;
        return `data:${mimeType};base64,${data}`;
    }

    const finishReason = response.candidates?.[0]?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
        const errorMessage = `图像生成中断，原因：${finishReason}。这通常与安全策略有关，请尝试调整你的参考图或说明。`;
        console.error(errorMessage, { response });
        throw new Error(errorMessage);
    }

    const errorMessage = `AI 未能生成图像。这可能是因为请求过于复杂，或触发了安全策略。请尝试简化你的指令或更换参考图。`;

    console.error(`模型响应中未包含“${context}”的图像部分。`, { response });
    throw new Error(errorMessage);
};

export const DEFAULT_STRATEGY_PROMPT = `You are an AI Creative Director for fashion brand 'Autumn Water Lady'.
Generate 3 creative concepts (Title + Prompt) in Simplified Chinese.`;

// --- PROMPT ENGINEERING CONSTANTS ---



const NEGATIVE_CONSTRAINTS = `
**🚫 NEGATIVE CONSTRAINTS (STRICTLY FORBIDDEN):**
- NO deformed bodies, extra fingers, distorted hands, or missing limbs.
- NO text, watermarks, signatures, or blurred faces.
- NO mannequins or plastic-looking skin (unless specified in Still Life).
- NO cartoonish, 3D render, or illustration styles. MUST BE PHOTOREALISTIC.
- NO complex messy backgrounds (unless specified).
`;

/**
 * System Prompt Generator
 */
export const getDefaultImageSystemPrompt = (
    aspectRatio?: string,
    hasOutpaintingMask?: boolean,
    hasTryOnClothing?: boolean,
    module: WorkflowModule = 'lookbook',
    modelStats?: ModelStats
): string => {

    const commonHeader = `You are the **Executive Art Director & Lead Photographer** for 'Autumn Water Lady' (秋水伊人), a premium fashion brand blending Modern Oriental aesthetics with Urban Professionalism.
    **Visual Identity**: Elegant, Intelligent, Resilient, Refined.

    ### 🧠 INTERNAL VISUAL REASONING PROTOCOL
    Before synthesizing the pixels, you MUST conceptually simulate this 4-step process:
    1.  **DECONSTRUCTION**: Analyze the [Base Model]'s facial geometry (canthal tilt, jawline, nose bridge) and store it as a rigid 3D mesh.
    2.  **MATERIAL MAPPING**: Identify the chemical properties of the [Garment] fabric (e.g., Silk=High Specular, Wool=Subsurface Scattering).
    3.  **LIGHTING SIMULATION**: Ray-trace the scene using the specific lighting setup defined below. Ensure accurate falloff.
    4.  **COMPOSITION LOCK**: Align the subject according to the Golden Ratio for the specified aspect ratio.

    ### 📸 TECHNICAL CAMERA SPEC
    - **System**: Phase One IQ4 150MP System (Medium Format).
    - **Lens**: Schneider Kreuznach 80mm LS f/2.8 Blue Ring.
    - **Aperture**: f/8 (Studio/Lookbook) or f/2.8 (Lifestyle/Campaign).
    - **Focal Length**: 80mm (No distortion).
    - **Lighting Engine**: Physicially Based Rendering (PBR) with Global Illumination.
    
    ${NEGATIVE_CONSTRAINTS}
    `;

    // --- MODULE 4: STILL LIFE & CRAFT AGENT ---
    if (module === 'still_life') {
        return `${commonHeader}
### 🎯 MODULE: MASTERPIECE STILL LIFE
**VISUAL MANDATE**:
1.  **[HERO]**: The Object is the Protagonist. Elevate it to art.
2.  **[TEXTURE]**: Hyper-realism. Viewers must "feel" the thread count.
3.  **[LIGHT]**: "Rembrandt for Objects". Sculpt the shape with light and shadow.
4.  **[CONSTRAINT]**: ZERO human presence. Pure object focus.

${hasOutpaintingMask ? `**🔧 TOOL - OUTPAINTING**: Extend the background texture seamlessly, maintaining the established lighting gradient.` : ''}
${aspectRatio && aspectRatio !== 'auto' ? `**📐 FORMAT**: Force output aspect ratio to **${aspectRatio}**.` : ''}

**OUTPUT**: Return ONLY raw high-fidelity image bytes.`;
    }

    // --- MODEL AGENTS COMMON LOGIC ---
    const hasBodyTypeSpec = modelStats && modelStats.bodyType !== 'unchanged';
    const hasAgeSpec = modelStats && modelStats.age && modelStats.age.trim() !== '';
    const constraints = [];
    if (hasAgeSpec) constraints.push(`- **BIOLOGICAL AGE LOCK**: The subject MUST appear physically **${modelStats.age} years old**. Adjust skin texture depth and collagen levels accordingly.`);
    if (hasBodyTypeSpec) constraints.push(`- **MORPHOLOGY LOCK**: The subject MUST strictly have a **${modelStats.bodyType}** body frame. (${modelStats.height || 'standard height'}, ${modelStats.weight || 'standard weight'}).`);

    let moduleSpecificInstructions = "";

    // --- MODULE 1: LOOKBOOK AGENT ---
    if (module === 'lookbook') {
        moduleSpecificInstructions = `
### 🎯 MODULE: E-COMMERCE LOOKBOOK (Premium)
**VISUAL MANDATE**: "Clarity is King."
1.  **[BACKDROP]**: Infinite Cyclorama. Pure White (#FFFFFF) or Soft Warm Grey (#F5F5F0). No corners.
2.  **[LIGHT]**: Commercial Butterfly Lighting. Large diffused source above center. Soft fill from below. 
3.  **[POSE]**: "The Power Stance". Confident, professional, selling the fit.
4.  **[PRIORITY]**: 100% Color Accuracy. 100% Texture Visibility.
`;
    }
    // --- MODULE 2: CAMPAIGN AGENT ---
    else if (module === 'campaign') {
        moduleSpecificInstructions = `
### 🎯 MODULE: GLOBAL CAMPAIGN (Editorial)
**VISUAL MANDATE**: "Emotion over Information."
1.  **[SETTING]**: Narrative-driven environments. High-end Architecture, Abstract Art Spaces, or Cinematic Nature.
2.  **[LIGHT]**: Cinematic Lighting. High Dynamic Range. Intentional shadows for drama. 
3.  **[POSE]**: Fluid, Dynamic, Expressive. Not static.
4.  **[STYLE]**: Magazine Grain, Color Grading (Kodak Portra 400 emulation), Film Aesthetic.
`;
    }

    return `${commonHeader}
${moduleSpecificInstructions}

### 🛡️ IMMUTABLE GENERATION LAWS
1.  **IDENTITY CLONING**: The face in the output MUST be a perfect biometric match to the [Base Model]. **Tolerance: 0% deviation.**
2.  **FABRIC PHYSICS**: If [Garment] is Silk, it must drape like liquid. If Denim, it must hold structure.
3.  **OUTFIT INTEGRITY**: 
    ${hasTryOnClothing ? `- **MODE: VIRTUAL TRY-ON**. Re-dress the [Base Model] in the [Garment]. Ensure realistic fabric interaction with the body.` : `- **MODE: ORIGINAL FIT**. Do NOT change the [Base Model]'s clothing. Preserve every fold and seam.`}

${hasOutpaintingMask ? `**🔧 TOOL - OUTPAINTING**: Analyze the scene context and extend seamlessly.` : ''}
${aspectRatio && aspectRatio !== 'auto' ? `**📐 FORMAT**: Force output aspect ratio to **${aspectRatio}**.` : ''}

${constraints.length > 0 ? '### MORPHOLOGICAL CONSTRAINTS:\n' + constraints.join('\n') : ''}

**OUTPUT**: Return ONLY raw high-fidelity image bytes.`;
};

const purposeLabels: Record<string, string> = {
    baseModel: '主角 (Main Subject)',
    clothing_garment: '★ 试穿服装 (Garment)',
    modification_detail: '局部修改 (Local Edit)',

    // Studio
    studio_background_color: '纯色背景 (Color BG)',
    studio_lighting_clean: '电商布光 (Clean Light)',

    // Lifestyle
    lifestyle_scene_street: '街拍场景 (Street)',
    lifestyle_scene_cafe: '探店/咖啡 (Cafe)',
    lifestyle_scene_office: '职场通勤 (Office)',
    lifestyle_pose_natural: '自然姿势 (Natural Pose)',

    // Brand
    brand_scene_luxury: '奢华置景 (Luxury)',
    brand_artistic_vibe: '艺术氛围 (Art Vibe)',
    brand_lighting_cinematic: '电影光影 (Cinematic)',
    style_makeup_hair: '高级妆造 (High-end Makeup)',

    // Still Life
    craft_flat_lay: '平铺精修 (Flat Lay)',
    craft_macro_texture: '面料微距 (Macro)',
    craft_origin_scene: '产地/原材料 (Origin)',

    accessory_general: '配饰 (Accessory)',
};

const generateRefinedPrompt = (
    allReferences: ReferenceObject[],
    _isCreativeOutpainting: boolean = false,
    module: WorkflowModule = 'lookbook',
    modelStats?: ModelStats
): string => {
    const references = allReferences.filter(ref => ref.purpose !== 'baseModel');
    const purposeMap: { [key: string]: ReferenceObject[] } = {};
    references.forEach(ref => {
        if (!purposeMap[ref.purpose]) purposeMap[ref.purpose] = [];
        purposeMap[ref.purpose].push(ref);
    });

    const getAssetString = (ref: ReferenceObject) => {
        const description = ref.description || 'Ref';
        return `[${purposeLabels[ref.purpose] || ref.purpose}: "${description}"]`;
    };

    // STRUCTURED PROMPT ASSEMBLY
    let prompt = `### 📋 SHOOT PLAN: ${module.toUpperCase()}\n`;

    if (module === 'still_life') {
        prompt += `**[SUBJECT]**: [Main Product]. Isolate subject. High detail.\n`;
        if (purposeMap['craft_macro_texture']) prompt += `**[CAMERA]**: MACRO LENS 100mm. Focus on weave/grain.\n`;
        if (purposeMap['craft_flat_lay']) prompt += `**[ANGLE]**: 90° Overhead Flat Lay.\n`;
        if (purposeMap['craft_origin_scene']) prompt += `**[ENV]**: Raw Material Origin (Cotton field/Nature/Stone).\n`;
    } else {
        // MODEL MODES
        prompt += `**[SUBJECT SPEC]**: **[Base Model]**. ⚠️ STRICT IDENTITY LOCK REQUIRED.\n`;
        if (modelStats) {
            const bodyStr = modelStats.bodyType === 'unchanged' ? 'Natural/Unchanged' : modelStats.bodyType;
            prompt += `**[BIOMETRICS]**: Biological Age ${modelStats.age}, Morphology ${bodyStr}.\n`;
        }

        const garment = purposeMap['clothing_garment']?.[0];
        if (garment) {
            prompt += `**[STYLING]**: **${getAssetString(garment)}**. Drapes naturally on body.\n`;
        } else {
            prompt += `**[STYLING]**: Maintain Original Wardrobe verbatim.\n`;
        }

        // Module Specifics - Updated to match new definitions
        if (module === 'lookbook') {
            // Check if lifestyle purposes are present to switch prompt style lightly
            if (purposeMap['lifestyle_scene_street'] || purposeMap['lifestyle_scene_cafe'] || purposeMap['lifestyle_scene_office'] || purposeMap['lifestyle_pose_natural']) {
                prompt += `**[SCENE SETTING]**:\n`;
                if (purposeMap['lifestyle_scene_street']) prompt += `- Location: Busy Urban Street / City Crossing.\n`;
                if (purposeMap['lifestyle_scene_cafe']) prompt += `- Location: Chic Cafe Window / Interior.\n`;
                if (purposeMap['lifestyle_scene_office']) prompt += `- Location: Modern Minimalist Office.\n`;
                if (purposeMap['lifestyle_pose_natural']) prompt += `- Action: Walking / Drinking Coffee / Hailing Taxi.\n`;
                prompt += `- Atmosphere: Authentic, "Seeding" style, OOTD.\n`;
            } else {
                // Default to Studio
                prompt += `**[STUDIO SETUP]**:\n`;
                if (purposeMap['studio_background_color']) prompt += `- Background: Solid Color / Gradient Paper.\n`;
                if (purposeMap['studio_lighting_clean']) prompt += `- Lighting: Butterfly Lighting or Loop Lighting. Soft.\n`;
                prompt += `- Quality: 8K, Sharp focus on garment.\n`;
            }
        } else if (module === 'campaign') {
            prompt += `**[ART DIRECTION]**:\n`;
            if (purposeMap['brand_scene_luxury']) prompt += `- Location: Historical Architecture / Luxury Hotel Lobby.\n`;
            if (purposeMap['brand_lighting_cinematic']) prompt += `- Lighting: High Contrast, Spotlight, Volumetric Fog.\n`;
            if (purposeMap['brand_artistic_vibe']) prompt += `- Style: Surreal, Dreamy, Avant-Garde.\n`;
            prompt += `- Atmosphere: Expensive, Emotional, Cinematic.\n`;
        }
    }

    // Generic overrides
    const localMod = purposeMap['modification_detail']?.[0];
    if (localMod) prompt += `\n**[EDIT REQUEST]**: ${getAssetString(localMod)}.\n`;

    return prompt;
};


export const generateEditedImage = async (
    baseModelFile: File,
    allReferences: ReferenceObject[],
    userPrompt?: string,
    aspectRatio?: string,
    outpaintingMask?: File,
    customSystemPrompt?: string,
    module: WorkflowModule = 'lookbook',
    modelStats?: ModelStats,
    isRefinement?: boolean,
    onQuotaExhausted?: (model: string) => void
): Promise<string> => {
    // --- BACKEND PROXY CALL ---
    const executeGenAI = async (parts: any[], config: any, context: string) => {
        const primaryModel = AI_MODELS.PRO;
        try {
            return await wrapGenAICall(async () => {
                // Modified: Call internal API route instead of direct SDK
                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: primaryModel,
                        parts: parts,
                        genConfig: config // Renamed to avoid confusion with fetch config
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = errorData.error?.message || errorData.error || response.statusText;

                    // Propagate specific error codes for retry logic
                    if (errorMessage.includes('429') || errorMessage.includes('QUOTA') || response.status === 429) {
                        throw new Error("QUOTA_EXCEEDED");
                    }
                    if (response.status === 503 || errorMessage.includes('503')) {
                        throw new Error("503 Service Unavailable");
                    }

                    throw new Error(`Backend API Error: ${errorMessage}`);
                }

                const data = await response.json();
                // Map the backend JSON response to the expected format for handleApiResponse
                // The SDK returns a specific structure, our API returns the JSON serialization of it.
                // handleApiResponse expects 'GenerateContentResponse'. 
                // JSON serialization usually preserves the structure needed (candidates, promptFeedback).
                return handleApiResponse(data as GenerateContentResponse, context);
            });
        } catch (e: any) {
            const msg = e.message || '';
            if (msg.includes("QUOTA_EXCEEDED") || msg.includes('429')) {
                if (onQuotaExhausted) onQuotaExhausted(primaryModel);
                throw new Error("⚠️ 配额已耗尽：Pro 模型配额已用完，请稍后再试。");
            }
            throw e;
        }
    }

    if (isRefinement) {
        const parts: any[] = [
            { text: `Refinement Task: "${userPrompt}". Maintain identity.` },
            await fileToPart(baseModelFile),
            await fileToPart(outpaintingMask!),
        ];
        return executeGenAI(parts, { imageConfig: { imageSize: '2K' } }, 'Refinement');
    }

    const baseModelRef = allReferences.find(ref => ref.purpose === 'baseModel');
    const otherRefs = allReferences.filter(ref => ref.purpose !== 'baseModel');

    const defaultPrompt = generateRefinedPrompt(allReferences, !!outpaintingMask && !otherRefs.length, module, modelStats);
    const dynamicPrompt = userPrompt
        ? `${defaultPrompt}\n\n#### 📣 CLIENT NOTE: ${userPrompt}`
        : defaultPrompt;

    const hasTryOnClothing = allReferences.some(ref => ref.purpose === 'clothing_garment');
    const systemPrompt = customSystemPrompt || getDefaultImageSystemPrompt(aspectRatio, !!outpaintingMask, hasTryOnClothing, module, modelStats);

    const mainImagePart = await fileToPart(baseModelFile);

    const parts: any[] = [
        { text: "=== 🎭 ROLE DEFINITION ===\n" + systemPrompt },
        { text: "\n=== 📂 ASSET INVENTORY === \n" },
        { text: `**[PRIMARY]: [Base Model]**\nROLE: IDENTITY SOURCE. The output MUST look like this person.\n` },
        mainImagePart,
    ];

    if (baseModelRef?.mask) {
        parts.push({ text: `**[ASSET 1] MASK:**` });
        parts.push(dataUrlToPart(baseModelRef.mask));
    }

    if (outpaintingMask) {
        parts.push({ text: `**OUTPAINTING MASK:**` });
        const maskPart = await fileToPart(outpaintingMask);
        parts.push(maskPart);
    }

    let assetCounter = 2;
    for (const ref of otherRefs) {
        let purpose = purposeLabels[ref.purpose] || ref.purpose;
        const description = ref.description || ref.file.name;

        // Semantic Tagging for Model
        let usage = "VISUAL REFERENCE";
        if (ref.purpose === 'clothing_garment') usage = "GARMENT TO WEAR";
        else if (ref.purpose === 'style_makeup_hair') usage = "STYLE/POSE GUIDE (Override)";

        parts.push({ text: `\n**ASSET ${assetCounter}: [${purpose}]**\nUSAGE: ${usage}\nDescription: ${description}` });
        parts.push(await fileToPart(ref.file));
        if (ref.mask) {
            parts.push({ text: `**ASSET ${assetCounter} MASK:**` });
            parts.push(dataUrlToPart(ref.mask));
        }
        assetCounter++;
    }

    parts.push({ text: "\n=== 🎬 EXECUTE === \n" });
    parts.push({ text: dynamicPrompt });

    const modelConfig: any = {
        generationConfig: { temperature: 0.4 },
        imageConfig: { imageSize: '2K' }
    };

    const isPureGeneration = !baseModelRef?.mask && !outpaintingMask;
    if (isPureGeneration && aspectRatio && aspectRatio !== 'auto') {
        modelConfig.imageConfig.aspectRatio = aspectRatio;
    }

    return executeGenAI(parts, modelConfig, 'Generation');
};

export interface StrategySuggestion {
    title: string;
    prompt: string;
}

export const generateStrategySuggestions = async (
    baseModel: File,
    _allReferences: ReferenceObject[],
    auxiliaryPrompt?: string,
    module: WorkflowModule = 'lookbook'
): Promise<StrategySuggestion[]> => {
    // Note: We are using a separate API call for strategy or reuse the generic one if model allows?
    // The previous implementation used AI_MODELS.TEXT_REASONING ('gemini-3-pro-preview'). 
    // We should allow passing model to backend.

    const mainImagePart = await fileToPart(baseModel);

    // --- PERSONA SELECTION ---
    let systemPrompt = "";

    // 1. Lookbook (棚拍/款片)
    if (module === 'lookbook') {
        systemPrompt = `You are a **Sentient E-commerce Photography Director (电商摄影总监)** for fashion brand 'Autumn Water Lady'.
        
        **YOUR GOAL**: Maximize Click-Through Rate (CTR) and Product Clarity.
        **AESTHETICS**: Minimalist, High-Key, Commercial, Detail-Oriented.
        
        **TASK**: Generate 3 high-quality execution proposals based on the [Base Model] and [Assets].
        **OUTPUT FORMAT**: JSON Array of objects { title, prompt }.
        
        **STRATEGY GUIDELINES**:
        - Focus on **clean lighting** (Butterfly, Loop) and **solid/gradient backgrounds**.
        - Poses should be elegant but standard for catalogs (highlighting fit).
        - Avoid distracting elements. The product is the hero.
        - Titles should be professional (e.g., "Pure White High-Key", "Morandi Grey Tone").
        
        **🚨 DIVERSITY REQUIREMENT**: Each of the 3 proposals MUST be visually distinct. Do NOT repeat:
        - The same lighting setup (if one uses Butterfly, others must use Loop/Rembrandt/etc.)
        - The same background color (vary: White, Grey, Cream, Gradient)
        - The same pose angle (Front, 3/4, Side, Dynamic)
        
        ${auxiliaryPrompt ? `**USER NOTE**: ${auxiliaryPrompt}` : ''}`;
    }

    // 2. Campaign (形象片 - High Fashion)
    else if (module === 'campaign') {
        systemPrompt = `You are a **Vogue/Harper's Bazaar Creative Director (时尚大刊创意总监)**.
        
        **YOUR GOAL**: Brand elevation, artistic expression, and visual impact.
        **AESTHETICS**: Avant-garde, Luxury, Cinematic, Editorial.
        
        **TASK**: Generate 3 high-quality execution proposals based on the [Base Model] and [Assets].
        **OUTPUT FORMAT**: JSON Array of objects { title, prompt }.

        **STRATEGY GUIDELINES**:
        - Scenarios: Surreal landscapes, Grand historical architecture, Abstract sets.
        - Lighting: Chiaroscuro (High Contrast), Spotlight, Volumetric Fog, Moody.
        - Poses: Abstract, emotional, powerful, non-standard.
        - Titles should be poetic and artistic (e.g., "Dreamscape", "Midnight Noir", "Architectural Dialogue").

        **🚨 DIVERSITY REQUIREMENT**: Each of the 3 proposals MUST be visually distinct. Do NOT repeat:
        - The same environment type (Architecture vs Nature vs Abstract)
        - The same lighting mood (Warm vs Cool vs Mixed)
        - The same emotional tone (Powerful vs Vulnerable vs Ethereal)

        ${auxiliaryPrompt ? `**USER NOTE**: ${auxiliaryPrompt}` : ''}`;
    }

    // 4. Still Life (静物 - Texture & Craft)
    else if (module === 'still_life') {
        systemPrompt = `You are a **Luxury Product Set Designer (高奢静物置景师)**.
        
        **YOUR GOAL**: Showcase craftsmanship, material quality, and sensory details.
        **AESTHETICS**: Zen, Geometric, Texture-focused, Premium.
        
        **TASK**: Generate 3 high-quality execution proposals based on the [Base Model] (Product).
        **OUTPUT FORMAT**: JSON Array of objects { title, prompt }.

        **STRATEGY GUIDELINES**:
        - NO HUMANS. Focus purely on the object.
        - Composition: Flat Lay (90°), Levitating objects, Macro close-ups.
        - Props: Raw materials (Stone, liquid, wood, sand) to improved storytelling.
        - Lighting: Sharp directional light to highlight grain, weave, and reflections.
        - Titles should focus on material/mood (e.g., "Stone & Silk", "Floating Gravity").

        **🚨 DIVERSITY REQUIREMENT**: Each of the 3 proposals MUST be visually distinct. Do NOT repeat:
        - The same camera angle (Flat Lay vs 45° vs Macro)
        - The same prop material (Stone vs Wood vs Liquid)
        - The same color temperature (Warm vs Cool vs Neutral)

        ${auxiliaryPrompt ? `**USER NOTE**: ${auxiliaryPrompt}` : ''}`;
    }

    const parts: any[] = [{ text: systemPrompt }, mainImagePart];

    return wrapGenAICall(async () => {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: AI_MODELS.TEXT_REASONING,
                parts: parts,
                genConfig: {
                    thinkingConfig: { thinkingBudget: 2048 },
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                prompt: { type: Type.STRING },
                            },
                            required: ["title", "prompt"],
                        },
                    },
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Strategy Gen Error: ${response.statusText}`);
        }

        const data: GenerateContentResponse = await response.json();

        try {
            return JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "[]");
        } catch {
            return [];
        }
    });
};

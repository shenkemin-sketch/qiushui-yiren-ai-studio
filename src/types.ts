
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


export type AppState = 'invitation' | 'start' | 'editor' | 'generating';

export type ShootMode = 'model' | 'stillLife';

// PRD Defined Modules
// New Production Modules
export type WorkflowModule =
    | 'lookbook'   // 模块一：棚拍与款片 (Model Lookbook) - 9+3张 (S级标准 + 唯品增补)
    | 'campaign'   // 模块二：形象大片 (Brand Campaign) - 5张
    | 'still_life'; // 模块三：静物特写 (Still Life) - 3/15张

export type ShotEnvironment = 'indoor' | 'outdoor'; // New: 场景区分
export type ShotPack = 'standard' | 'vip'; // New: 渠道包区分

export type ProductCategory = 'dress' | 'top' | 'pants' | 'skirt' | 'shorts' | 'coat' | 'matching_set';

export type ShotCategory = 'basic' | 'supplement' | 'creative' | 'standard';

export interface ShotDefinition {
    id: string;
    name: string;
    category: ShotCategory;
    pack?: ShotPack; // New: 默认为 standard
    promptTemplate: string;
    aspectRatio: string; // e.g. "3:4", "1:1"
    description: string;
    outputFormat?: 'jpg' | 'png';
    requiresReference?: boolean; // 是否需要额外的参考图（如增补包）
}

export interface ShotResult {
    shotId: string;
    status: 'idle' | 'generating' | 'success' | 'error';
    imageUrl?: string;
    selected: boolean;
}

export interface ModelStats {
    age: string;
    height: string;
    weight: string;
    bodyType: 'unchanged' | 'slim' | 'average' | 'athletic' | 'plus-size' | 'chubby';
}

export const DEFAULT_MODEL_STATS: ModelStats = {
    age: '',
    height: '',
    weight: '',
    bodyType: 'unchanged'
};

export const AI_MODELS = {
    PRO: 'gemini-3-pro-image-preview',
    TEXT_REASONING: 'gemini-3-pro-preview',
} as const;

export type AIModelId = typeof AI_MODELS[keyof typeof AI_MODELS];

export type ReferencePurpose =
    | 'baseModel'
    // Studio
    | 'studio_lighting_clean' | 'studio_background_color'
    // Lifestyle
    | 'lifestyle_scene_street' | 'lifestyle_scene_cafe' | 'lifestyle_scene_office' | 'lifestyle_pose_natural'
    // Brand
    | 'brand_scene_luxury' | 'brand_lighting_cinematic' | 'brand_artistic_vibe'
    // Still Life
    | 'craft_macro_texture' | 'craft_origin_scene' | 'craft_flat_lay'
    // Common
    | 'clothing_garment' | 'accessory_general' | 'style_makeup_hair' | 'modification_detail';

export const GLOBAL_PURPOSES: ReferencePurpose[] = ['studio_lighting_clean', 'brand_lighting_cinematic'];

export interface ReferenceObject {
    file: File;
    description: string;
    mask?: string; // Base64 encoded mask image data URL
    boundingBox?: { x: number; y: number; width: number; height: number }; // Relative coordinates for the box
    id: string; // for stable key
    purpose: ReferencePurpose;
}

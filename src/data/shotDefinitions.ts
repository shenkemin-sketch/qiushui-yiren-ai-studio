
import { ShotDefinition, ProductCategory, ShotPack, ShotEnvironment } from '../types';

// ==========================================
// 核心调性 (Brand DNA): Intellectual Elegance & Relaxed Luxury
// 通用修饰词 (Global Modifiers):
// - Lighting: Sculpted Light, Soft Shadows, Dappled Sunlight (Outdoor), Art Gallery Lighting (Indoor)
// - Pose: Fluid Motion, Candid, Unposed, Relaxed Shoulders
// - Start: JPG Output Only
// ==========================================

// ==========================================
// 模块一：棚拍与款片 (Model Lookbook) - S级标准化
// ==========================================

// 1. 上装/连衣裙 S 级标准 (Tops/Dresses) - 9 Shots
// 优化重点：去除“摆拍感”，增加“空气感”和“画廊氛围”。
// ==========================================
export const S_GRADE_TOPS_SHOTS: ShotDefinition[] = [
    {
        id: 's_full_front',
        name: '全身正面 (Full Front)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '核心主图，松弛而挺拔。',
        promptTemplate: `[SHOT: FULL BODY FRONT]
- **FRAMING**: Head to toe. 10% breathing space above head.
- **POSE**: Standing straight but relaxed. Shoulders dropped. One leg slightly forward. Not rigid.
- **LIGHTING**: Soft "Art Gallery" lighting. Sculpted shadows on garment to show depth.
- **BACKGROUND**: {environment} (Clean, textured wall or minimalist architecture).
- **MOOD**: Intellectual elegance, confident, high-end catalog.`
    },
    {
        id: 's_full_walk',
        name: '全身行走 (Walking)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '动态抓拍，强调面料流动。',
        promptTemplate: `[SHOT: DYNAMIC WALK]
- **FRAMING**: Full body, caught mid-stride.
- **POSE**: Walking towards camera. Fabric flowing naturally. Slight blur on hem is acceptable for realism.
- **FOCUS**: The drape and movement of the material.
- **BACKGROUND**: {environment} with depth.
- **MOOD**: Effortless chic, "on the go", vivid.`
    },
    {
        id: 's_half_front',
        name: '半身互动 (Interaction)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '眼神交流，手部自然动作。',
        promptTemplate: `[SHOT: HALF BODY PORTRAIT]
- **FRAMING**: Cut at hips.
- **POSE**: Candid moment. Maybe adjusting a cuff or hair behind ear. Looking slightly off-camera or soft contact.
- **LIGHTING**: Rembrandt lighting on face, soft fill on clothes. Highlighting fabric texture.
- **BACKGROUND**: {environment} slightly blurred (Bokeh).
- **MOOD**: Intimate, engaging, warm.`
    },
    {
        id: 's_half_side',
        name: '半身侧面 (Profile)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '侧面廓形，建筑感。',
        promptTemplate: `[SHOT: HALF BODY SIDE]
- **FRAMING**: Waist up profile (90°).
- **POSE**: Static but breathing. Chin slightly up.
- **FOCUS**: Architectural silhouette of the garment. Sleeve volume.
- **BACKGROUND**: {environment}.
- **MOOD**: Structural, calm, composed.`
    },
    {
        id: 's_half_34',
        name: '大半身 (3/4 Vibe)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '经典构图，知性气质。',
        promptTemplate: `[SHOT: 3/4 ANGLE UPPER]
- **FRAMING**: Thigh up.
- **POSE**: Leaning slightly (if wall exists) or shifting weight. Elegant geometry.
- **FOCUS**: Outfit coordination and fit.
- **BACKGROUND**: {environment}.
- **MOOD**: Sophisticated, "Old Money" aesthetic.`
    },
    {
        id: 's_back_main',
        name: '背面展示 (Back)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '背部线条，自然转身。',
        promptTemplate: `[SHOT: FULL BODY BACK]
- **FRAMING**: Full body rear view.
- **POSE**: Turned away, but head turning back slightly (optional). Natural stance.
- **FOCUS**: Back design, zipper/seam details.
- **BACKGROUND**: {environment}.
- **MOOD**: Clean, informative.`
    },
    {
        id: 's_detail_core',
        name: '细节特写 (Core Detail)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '领/腰细节，微距质感。',
        promptTemplate: `[SHOT: DETAIL CLOSEUP]
- **FRAMING**: Close-up on collar, waist, or buttons.
- **LIGHTING**: Raking light (Side light) to emphasize material grain and stitching.
- **FOCUS**: Sharp texture.
- **BACKGROUND**: Blurred neutral tone.`
    },
    {
        id: 's_detail_fabric',
        name: '面料质感 (Fabric)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '极致面料，触感传递。',
        promptTemplate: `[SHOT: MACRO TEXTURE]
- **FRAMING**: Extreme close-up on fabric surface.
- **CONTENT**: Fold or drape of the cloth.
- **LIGHTING**: High contrast micro-contrast to show weave.
- **MOOD**: Tactile, expensive, high-quality.`
    },
    {
        id: 's_creative_pose',
        name: 'S级创意 (Creative Pose)',
        category: 'creative',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '情绪片，光影氛围。',
        promptTemplate: `[SHOT: CREATIVE POSE]
- **FRAMING**: Relaxed sitting or artistic leaning.
- **LIGHTING**: Dappled sunlight (if outdoor) or Spotlight (if indoor).
- **POSE**: Unconventional, editorial.
- **MOOD**: Storytelling, emotional connection.`
    }
];

// ==========================================
// 2. 下装 S 级标准 (Bottoms: Pants/Skirts) - 10-12 Shots
// ==========================================
export const S_GRADE_BOTTOMS_SHOTS: ShotDefinition[] = [
    // 1. 全身 (2张)
    {
        id: 's_btm_full_std',
        name: '全身正面 (Full Front)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '标准全身，展示比例。',
        promptTemplate: `[SHOT: FULL BODY FRONT]
- **FRAMING**: Head to toe.
- **POSE**: Standing straight, legs hip-width apart. Stable.
- **FOCUS**: Leg length and outfit proportion.
- **BACKGROUND**: {environment}.`
    },
    {
        id: 's_btm_full_side',
        name: '全身侧面 (Full Side)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '侧面线条。',
        promptTemplate: `[SHOT: FULL BODY SIDE]
- **FRAMING**: Full body profile.
- **POSE**: Walking stride or static side view.
- **FOCUS**: Side silhouette smoothness.
- **BACKGROUND**: {environment}.`
    },
    // 2. 大下半身 (5张) - 核心重点
    {
        id: 's_btm_low_front',
        name: '大下半身-正 (Lower Front)',
        category: 'standard',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '下半身特写，版型展示。',
        promptTemplate: `[SHOT: WAIST DOWN FRONT]
- **FRAMING**: From waist to floor. Head cut off.
- **POSE**: Neutral standing.
- **FOCUS**: Fit at hips, drape of the leg.
- **LIGHTING**: Soft dimensional light to show fabric weight.`
    },
    {
        id: 's_btm_low_side',
        name: '大下半身-侧 (Lower Side)',
        category: 'standard',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '侧面下半身，线条流畅。',
        promptTemplate: `[SHOT: WAIST DOWN SIDE]
- **FRAMING**: Waist to floor profile.
- **POSE**: One leg stepping forward.
- **FOCUS**: Side seam finish, hip curve.
- **BACKGROUND**: {environment}.`
    },
    {
        id: 's_btm_low_back',
        name: '大下半身-背 (Lower Back)',
        category: 'standard',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '背面臀部修饰效果。',
        promptTemplate: `[SHOT: WAIST DOWN BACK]
- **FRAMING**: Waist to floor rear view.
- **POSE**: Relaxed standing.
- **FOCUS**: Pocket placement, lifting effect (if jeans/pants).`
    },
    {
        id: 's_btm_low_detail',
        name: '大下半身-坐 (Sitting)',
        category: 'standard',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '坐姿展示面料张力。',
        promptTemplate: `[SHOT: WAIST DOWN SITTING]
- **FRAMING**: Cropped on legs while sitting on a stool/chair.
- **POSE**: Knees crossed or relaxed.
- **FOCUS**: How fabric stretches or drapes when seated.`
    },
    {
        id: 's_btm_low_walk',
        name: '大下半身-走 (Walking)',
        category: 'standard',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '裤脚动态。',
        promptTemplate: `[SHOT: WAIST DOWN WALKING]
- **FRAMING**: Waist to floor, motion blur allowed on feet.
- **POSE**: Wide stride.
- **FOCUS**: Movement, flow, dynamic drape.`
    },
    // 3. 细节与背面
    {
        id: 's_btm_detail_waist',
        name: '细节-腰头 (Waist)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '腰部做工微距。',
        promptTemplate: `[SHOT: CLOSEUP WAIST]
- **FRAMING**: Tight crop on waistband/belt.
- **LIGHTING**: Harder light to show button/texture details.`
    },
    {
        id: 's_btm_back_full',
        name: '背面全身 (Back Full)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '全身背面。',
        promptTemplate: `[SHOT: FULL BODY BACK]
- **FRAMING**: Full body from behind.
- **POSE**: Relaxed.
- **BACKGROUND**: {environment}.`
    },
    // 4. 动态/坐姿 (SA增补 - 2张)
    {
        id: 's_btm_sa_sit',
        name: 'SA创意-坐 (Creative Sit)',
        category: 'creative',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '优雅坐姿全身。',
        promptTemplate: `[SHOT: FULL BODY SITTING]
- **FRAMING**: Full body sitting on a designer chair.
- **POSE**: Elegant, legs extended.
- **MOOD**: Relaxed luxury, coffee break vibe.`
    },
    {
        id: 's_btm_sa_motion',
        name: 'SA创意-动 (Creative Motion)',
        category: 'creative',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '动感瞬间。',
        promptTemplate: `[SHOT: DYNAMIC MOTION]
- **FRAMING**: Full body.
- **POSE**: Twirling or jumping slightly.
- **MOOD**: Joyful, lighthearted.`
    }
];

// ==========================================
// 3. 短装 S 级标准 (Shorts/Short Skirts)
// ==========================================
export const S_GRADE_SHORTS_SHOTS: ShotDefinition[] = [
    {
        id: 's_sht_full',
        name: '全身正面 (Full)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '整体搭配。',
        promptTemplate: `[SHOT: FULL BODY]
- **FRAMING**: Full body.
- **POSE**: Casual standing, hand in pocket.
- **MOOD**: Summer breeze, light.`
    },
    { id: 's_sht_low_1', name: '大下半身-正 (Lower Front)', category: 'standard', pack: 'standard', aspectRatio: '3:4', description: '正面短装。', promptTemplate: '[SHOT: WAIST DOWN FRONT] Focus on leg shape and shorts fit.' },
    { id: 's_sht_low_2', name: '大下半身-侧 (Lower Side)', category: 'standard', pack: 'standard', aspectRatio: '3:4', description: '侧面短装。', promptTemplate: '[SHOT: WAIST DOWN SIDE] Focus on hemline angle.' },
    { id: 's_sht_with_upper_1', name: '带上半身-正 (With Upper)', category: 'standard', pack: 'standard', aspectRatio: '3:4', description: '半身带腰。', promptTemplate: '[SHOT: THIGH UP FRONT] Mid-thigh to head. Connecting top and bottom.' },
    { id: 's_sht_with_upper_2', name: '带上半身-侧 (With Upper Side)', category: 'standard', pack: 'standard', aspectRatio: '3:4', description: '侧半身带腰。', promptTemplate: '[SHOT: THIGH UP SIDE] Looking over shoulder. Gentle curve.' },
    // Simplified Details
    { id: 's_sht_macro_1', name: '极致特写 (Macro)', category: 'basic', pack: 'standard', aspectRatio: '3:4', description: '材质特写。', promptTemplate: '[SHOT: MACRO DETAIL] Texture focus.' },
    { id: 's_sht_detail', name: '腰部细节 (Detail)', category: 'basic', pack: 'standard', aspectRatio: '3:4', description: '腰头做工。', promptTemplate: '[SHOT: WAIST DETAIL] Construction focus.' },
    { id: 's_sht_back', name: '背面展示 (Back)', category: 'basic', pack: 'standard', aspectRatio: '3:4', description: '背面。', promptTemplate: '[SHOT: FULL BODY BACK] Rear view.' },
    { id: 's_sht_sa_1', name: 'SA创意 (Creative)', category: 'creative', pack: 'standard', aspectRatio: '3:4', description: '创意角度。', promptTemplate: '[SHOT: LOW ANGLE] Enhancing leg length.' }
];

export const getLookbookShots = (
    category: ProductCategory = 'dress',
    packs: ShotPack[] = ['standard'],
    env: ShotEnvironment = 'indoor'
): ShotDefinition[] => {
    let shots: ShotDefinition[] = [];

    if (packs.includes('standard')) {
        switch (category) {
            case 'pants':
            case 'skirt':
                shots = [...shots, ...S_GRADE_BOTTOMS_SHOTS];
                break;
            case 'shorts':
                shots = [...shots, ...S_GRADE_SHORTS_SHOTS];
                break;
            case 'dress':
            case 'top':
            case 'coat':
            case 'matching_set':
            default:
                shots = [...shots, ...S_GRADE_TOPS_SHOTS];
                break;
        }
    }

    // Environment Injections with Visual Tuning
    // Studio: Art Gallery vibe (Clean, Texture wall, Soft Light)
    // Outdoor: Architecture/Street vibe (Natural Light, Depth)
    const ENV_DESCRIPTIONS: Record<ShotEnvironment, string> = {
        indoor: "Indoor Studio, minimalist grey textured wall, soft window light, art gallery atmosphere",
        outdoor: "Outdoor, upscale city architecture, clean lines, soft natural daylight, shallow depth of field"
    };

    return shots.map(shot => ({
        ...shot,
        promptTemplate: shot.promptTemplate.replace('{environment}', ENV_DESCRIPTIONS[env] || ENV_DESCRIPTIONS.indoor)
    }));
};


// ==========================================
// 模块二：形象大片 (Editorial/Campaign) - 4 Shots
// 优化重点：增加电影感、颗粒感、故事性。
// ==========================================
export const CAMPAIGN_SHOTS: ShotDefinition[] = [
    {
        id: 'campaign_hero',
        name: '主视觉 (Hero)',
        category: 'creative',
        aspectRatio: '3:4',
        description: '品牌宣言，电影质感。',
        promptTemplate: `[SHOT: CINEMATIC WIDE]
- **COMPOSITION**: Wide shot, perfectly balanced.
- **LIGHTING**: Golden hour sunlight filtering through trees (Dappled Light). Warm, enveloping nuances.
- **POSE**: Relaxed elegance. Leaning on a railing or walking slowly.
- **BACKGROUND**: High-end resort garden or pool side. Blurred but recognizable luxury.
- **TEXTURE**: Slight film grain added.
- **VIBE**: "The Face of the Holiday". Quiet luxury, emotional.`
    },
    {
        id: 'campaign_scene',
        name: '场景融合 (Scene)',
        category: 'creative',
        aspectRatio: '3:4',
        description: '人与环境的共鸣。',
        promptTemplate: `[SHOT: ENVIRONMENTAL PORTRAIT]
- **FRAMING**: Incorporating architectural elements or tropical plants in foreground.
- **RELATIONSHIP**: Merging with nature.
- **FOCUS**: The feeling of vacation.
- **LIGHTING**: Natural, directional sunlight.
- **MOOD**: Escapism, freedom, narrative.`
    },
    {
        id: 'campaign_light',
        name: '光影艺术 (Light)',
        category: 'creative',
        aspectRatio: '3:4',
        description: '光影切割，艺术感。',
        promptTemplate: `[SHOT: ARTISTIC SHADOWS]
- **TECHNIQUE**: Hard sunlight creating geometric shadows of palm leaves on the dress/body.
- **FOCUS**: Texture interaction with light.
- **MOOD**: Sensory, warm, lazy afternoon.`
    },
    {
        id: 'campaign_emotion',
        name: '情绪特写 (Emotion)',
        category: 'creative',
        aspectRatio: '3:4',
        description: '情绪传递，故事感。',
        promptTemplate: `[SHOT: EMOTIONAL CLOSEUP]
- **FRAMING**: Close up on face and shoulder.
- **EXPRESSION**: Soft, genuine, looking away or closed eyes enjoying breeze.
- **STYLE**: Backlit (Rim light) on hair. Airy and ethereal.
- **VIBE**: Soulful, intimate, cinematic.`
    }
];

// ==========================================
// 模块三：静物特写 (Still Life) - S级重构
// 优化重点：触感 (Tactility)、雕塑光 (Sculpted)、标准白底 (Standard)
// ==========================================

// 1. 创意静物 (Creative)
export const STILL_LIFE_CREATIVE_SHOTS: ShotDefinition[] = [
    {
        id: 'sc_outdoor_vibe',
        name: '外景氛围 (Outdoor)',
        category: 'creative',
        aspectRatio: '3:4',
        description: '自然光下的静物。',
        promptTemplate: `[SHOT: CREATIVE STILL LIFE]
- **COMPOSITION**: Product placed naturally on stone or wood surface.
- **LIGHTING**: Dappled sunlight, leaf shadows.
- **BACKGROUND**: Blurred garden depth.
- **MOOD**: Organic, breathing.`
    },
    {
        id: 'sc_color_stack',
        name: '多色/叠放 (Stack)',
        category: 'creative',
        aspectRatio: '3:4',
        description: '叠放艺术。',
        promptTemplate: `[SHOT: ARTISTIC FOLD]
- **COMPOSITION**: Neatly folded or artistically draped.
- **FOCUS**: Soft edges, volume of the stack.
- **LIGHTING**: Soft studio light.`
    },
    {
        id: 'sc_fabric_source',
        name: '面料/原料 (Source)',
        category: 'creative',
        aspectRatio: '3:4',
        description: '概念图。',
        promptTemplate: `[SHOT: CONCEPTUAL MATERIAL]
- **COMPOSITION**: Garment mixed with raw textures (cotton, linen, silk).
- **STYLE**: Art installation vibe.
- **LIGHTING**: Warm, cozy.`
    },
    {
        id: 'sc_detail_craft',
        name: '工艺特写 (Craft)',
        category: 'creative',
        aspectRatio: '3:4',
        description: '极致微距。',
        promptTemplate: `[SHOT: MACRO CRAFT]
- **FRAMING**: Extreme macro on embroidery or seam.
- **LIGHTING**: Raking light to show relief and height of thread.
- **FOCUS**: Precision.`
    }
];

// 2. 常规静物 (Standard) - JPG Output (White Background)
// 2.1 上装 (Tops)
export const STILL_LIFE_TOPS_SHOTS: ShotDefinition[] = [
    { id: 'st_top_hang_f', name: '挂拍正面 (Front)', category: 'standard', aspectRatio: '3:4', description: '标准挂拍。', promptTemplate: '[SHOT: HANGING FRONT] Clean white background (RGB 255,255,255). Perfect symmetry. Soft even light.' },
    { id: 'st_top_hang_b', name: '挂拍背面 (Back)', category: 'standard', aspectRatio: '3:4', description: '标准背面。', promptTemplate: '[SHOT: HANGING BACK] Clean white background. Showing back design.' },
    { id: 'st_top_flat', name: '平铺造型 (Flat)', category: 'standard', aspectRatio: '3:4', description: '标准平铺。', promptTemplate: '[SHOT: FLAT LAY] Top down view. White background. Natural styling.' },
    { id: 'st_top_col', name: '细节-领口 (Collar)', category: 'standard', aspectRatio: '1:1', description: '领口特写。', promptTemplate: '[SHOT: CLOSEUP] Collar details. High quality textures.' },
    { id: 'st_top_cuff', name: '细节-袖口 (Cuff)', category: 'standard', aspectRatio: '1:1', description: '袖口特写。', promptTemplate: '[SHOT: CLOSEUP] Sleeve cuff details.' },
    { id: 'st_top_hem', name: '细节-下摆 (Hem)', category: 'standard', aspectRatio: '1:1', description: '下摆特写。', promptTemplate: '[SHOT: CLOSEUP] Hemline details.' }
];

// 2.2 下装 (Bottoms)
export const STILL_LIFE_BOTTOMS_SHOTS: ShotDefinition[] = [
    { id: 'st_btm_hang_f', name: '挂拍正面 (Front)', category: 'standard', aspectRatio: '3:4', description: '裤装挂拍。', promptTemplate: '[SHOT: HANGING FRONT] Clean white background. Clip hanger visible. Straight legs.' },
    { id: 'st_btm_hang_b', name: '挂拍背面 (Back)', category: 'standard', aspectRatio: '3:4', description: '背面挂拍。', promptTemplate: '[SHOT: HANGING BACK] Clean white background. Pocket details.' },
    { id: 'st_btm_waist', name: '细节-腰头 (Waist)', category: 'standard', aspectRatio: '1:1', description: '腰头特写。', promptTemplate: '[SHOT: CLOSEUP] Waistband, button, zipper. Sharp focus.' },
    { id: 'st_btm_hem', name: '细节-裤脚 (Hem)', category: 'standard', aspectRatio: '1:1', description: '裤脚特写。', promptTemplate: '[SHOT: CLOSEUP] Hem sticking and fabric weave.' },
    { id: 'st_btm_tex', name: '面料肌理 (Texture)', category: 'standard', aspectRatio: '1:1', description: '面料微距。', promptTemplate: '[SHOT: MACRO TEXTURE] Fabric grain and color.' }
];

// 2.3 连衣裙 (Dresses/Coats/Sets)
export const STILL_LIFE_DRESSES_SHOTS: ShotDefinition[] = [
    { id: 'st_dress_hang_f', name: '全身挂拍-正 (Front)', category: 'standard', aspectRatio: '3:4', description: '整件正面。', promptTemplate: '[SHOT: HANGING FRONT] Full length dress. Clean white background. Soft shadows.' },
    { id: 'st_dress_hang_b', name: '全身挂拍-背 (Back)', category: 'standard', aspectRatio: '3:4', description: '整件背面。', promptTemplate: '[SHOT: HANGING BACK] Full length reverse. Clean white background.' },
    { id: 'st_dress_detail_top', name: '细节-上半身 (Top)', category: 'standard', aspectRatio: '1:1', description: '上半身工艺。', promptTemplate: '[SHOT: CLOSEUP] Bodice and neckline details. High fidelity.' },
    { id: 'st_dress_waist', name: '细节-收腰 (Waist)', category: 'standard', aspectRatio: '1:1', description: '腰部结构。', promptTemplate: '[SHOT: CLOSEUP] Waistline draping or belt details.' },
    { id: 'st_dress_hem', name: '细节-裙摆 (Hem)', category: 'standard', aspectRatio: '1:1', description: '裙摆垂感。', promptTemplate: '[SHOT: CLOSEUP] Hemline flow and stitching.' },
    { id: 'st_dress_fabric', name: '面料质感 (Fabric)', category: 'standard', aspectRatio: '1:1', description: '面料表现。', promptTemplate: '[SHOT: MACRO TEXTURE] Print or weave detail. Touching reality.' }
];


// Factory Function to get Still Life Shots
export const getStillLifeShots = (category: ProductCategory = 'dress'): ShotDefinition[] => {
    // 1. Creative Shots always included
    const creativeShots = STILL_LIFE_CREATIVE_SHOTS;

    // 2. Standard Shots based on Category
    let standardShots: ShotDefinition[] = [];

    switch (category) {
        case 'pants':
        case 'skirt':
        case 'shorts':
            standardShots = STILL_LIFE_BOTTOMS_SHOTS;
            break;
        case 'top':
            standardShots = STILL_LIFE_TOPS_SHOTS;
            break;
        case 'dress':
        case 'coat':
        case 'matching_set':
        default:
            standardShots = STILL_LIFE_DRESSES_SHOTS;
            break;
    }

    return [...standardShots, ...creativeShots];
};

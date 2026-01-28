
import { ShotDefinition, ProductCategory, ShotPack, ShotEnvironment } from '../types';

// ==========================================
// 模块一：棚拍与款片 (Model Lookbook) - S级标准化
// ==========================================

// 天猫 S 级标准包 (9 Shots)
// 关键词：简约、大牌、高质感、稳定
// ==========================================
// 1. 上装/连衣裙 S 级标准 (Tops/Dresses) - 9 Shots
// ==========================================
export const S_GRADE_TOPS_SHOTS: ShotDefinition[] = [
    {
        id: 's_full_front',
        name: '全身正面 (Full Front)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '核心主图，站姿挺拔，展示整体版型。',
        promptTemplate: `[SHOT: FULL BODY FRONT]
- **FRAMING**: Head to toe visible. 10% margin top/bottom.
- **POSE**: Model standing straight, weight on one leg. Arms relaxed at sides.
- **FOCUS**: Sharp focus on entire outfit.
- **BACKGROUND**: {environment} environment with soft, high-end lighting.
- **MOOD**: Professional, clear, inviting.`
    },
    {
        id: 's_full_walk',
        name: '全身行走 (Walking)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '动态展示，面料流动感，自信大步。',
        promptTemplate: `[SHOT: DYNAMIC WALK]
- **FRAMING**: Full body or 3/4.
- **POSE**: Mid-stride walking towards camera. Garment flowing naturally.
- **FOCUS**: Fabric movement, drape in motion.
- **BACKGROUND**: {environment} environment.
- **MOOD**: Energetic, effortless chic.`
    },
    {
        id: 's_half_front',
        name: '半身正面 (Interaction)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '眼神交流，展示领口/肩部。',
        promptTemplate: `[SHOT: HALF BODY FRONT]
- **FRAMING**: Cut at hips. Head fully visible.
- **POSE**: Facing camera comfortably. Slight tilt of head. One hand possibly adjusting garment.
- **FOCUS**: Upper body details, neckline, and face.
- **BACKGROUND**: {environment} background, slightly out of focus.
- **MOOD**: Engaging, personal connection.`
    },
    {
        id: 's_half_side',
        name: '半身侧面 (Profile)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '侧面廓形，袖型展示。',
        promptTemplate: `[SHOT: HALF BODY SIDE]
- **FRAMING**: Waist up profile (90° turn).
- **POSE**: Static profile or slight turn.
- **FOCUS**: Side silhouette, sleeve width, armhole drop.
- **BACKGROUND**: {environment} environment.
- **MOOD**: Structural, confident.`
    },
    {
        id: 's_half_34',
        name: '大半身 (3/4 Vibe)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '经典电商构图，优雅舒适。',
        promptTemplate: `[SHOT: 3/4 ANGLE UPPER]
- **FRAMING**: Knee up or thigh up. 45-degree angle.
- **POSE**: Elegant, one shoulder slightly forward. Relaxed posture.
- **FOCUS**: Outfit coordination, overall fit.
- **BACKGROUND**: {environment} with depth.
- **MOOD**: Sophisticated, high-end catalog.`
    },
    {
        id: 's_back_main',
        name: '背面展示 (Back)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '背部设计，收腰/线条展示。',
        promptTemplate: `[SHOT: FULL BODY BACK]
- **FRAMING**: Full body or knee-up from behind.
- **POSE**: Model turned away. Head slightly turned back or looking forward.
- **FOCUS**: Back design details, fit across shoulders/hips.
- **BACKGROUND**: {environment} background.
- **MOOD**: Informative, clean.`
    },
    {
        id: 's_detail_core',
        name: '细节特写 (Core Detail)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '核心设计点（领/腰/肌理）。',
        promptTemplate: `[SHOT: DETAIL CLOSEUP]
- **FRAMING**: Close-up on key design element (collar, waist, or buttons).
- **POSE**: Natural usage showing functionality.
- **FOCUS**: Sharp detail, precise stitching.
- **LIGHTING**: Highlighting structure.
- **BACKGROUND**: Blurred {environment}.`
    },
    {
        id: 's_detail_fabric',
        name: '面料质感 (Fabric)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '面料质感，光影层次。',
        promptTemplate: `[SHOT: MACRO TEXTURE]
- **FRAMING**: Extreme close-up on a flat section of garment.
- **POSE**: Hand gently brushing fabric (optional).
- **FOCUS**: Texture grain, weave, and color. Narrow depth of field.
- **LIGHTING**: Raking light to emphasize surface texture.
- **BACKGROUND**: Indistinguishable.`
    },
    {
        id: 's_creative_pose',
        name: 'S级创意 (Creative Pose)',
        category: 'creative',
        pack: 'standard',
        aspectRatio: '3:4',
        description: 'SA款增加项：坐姿或独特光影。',
        promptTemplate: `[SHOT: CREATIVE POSE]
- **FRAMING**: Varied (Sitting or artistic standing).
- **POSE**: Relaxed seated pose on a prop or stylish leaning pose.
- **FOCUS**: Outfit silhouette in relaxed state.
- **BACKGROUND**: {environment} environment with artistic lighting.
- **MOOD**: Editorial, stylish, high-fashion.`
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
        description: '整体搭配，站姿挺拔，交代全身比例。',
        promptTemplate: `[SHOT: FULL BODY FRONT]
- **FRAMING**: Head to toe.
- **POSE**: Standing straight, legs slightly apart to show pant/skirt shape.
- **FOCUS**: Full outfit proportion.
- **BACKGROUND**: {environment}.`
    },
    {
        id: 's_btm_full_side',
        name: '全身侧面 (Full Side)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '侧面全身，展示裤管/裙摆维度。',
        promptTemplate: `[SHOT: FULL BODY SIDE]
- **FRAMING**: Full body profile.
- **POSE**: Walking or standing side profile.
- **FOCUS**: Side silhouette leg width.
- **BACKGROUND**: {environment}.`
    },
    // 2. 大下半身 (5张) - 核心重点
    {
        id: 's_btm_low_front',
        name: '大下半身-正 (Lower Front)',
        category: 'standard',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '膝盖以上至脚部，正面展示版型。',
        promptTemplate: `[SHOT: WAIST DOWN FRONT]
- **FRAMING**: Crop from waist to floor. Head not visible.
- **POSE**: Standing straight, symmetrical.
- **FOCUS**: Pant/Skirt front fit, drape, and length(break).
- **BACKGROUND**: {environment}.`
    },
    {
        id: 's_btm_low_side',
        name: '大下半身-侧 (Lower Side)',
        category: 'standard',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '侧面下半身，臀腿线条。',
        promptTemplate: `[SHOT: WAIST DOWN SIDE]
- **FRAMING**: Waist to floor profile.
- **POSE**: One leg forward (walking stride).
- **FOCUS**: Side seam, hip fit, leg volume.
- **BACKGROUND**: {environment}.`
    },
    {
        id: 's_btm_low_back',
        name: '大下半身-背 (Lower Back)',
        category: 'standard',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '背面下半身，臀部贴合度。',
        promptTemplate: `[SHOT: WAIST DOWN BACK]
- **FRAMING**: Waist to floor from behind.
- **POSE**: Standing relaxed.
- **FOCUS**: Pocket placement, fit across hips.
- **BACKGROUND**: {environment}.`
    },
    {
        id: 's_btm_low_detail',
        name: '大下半身-坐 (Sitting)',
        category: 'standard',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '坐姿展示面料在弯曲状态下的表现。',
        promptTemplate: `[SHOT: WAIST DOWN SITTING]
- **FRAMING**: Waist to knees/floor.
- **POSE**: Sitting on a stool, knees crossed or relaxed.
- **FOCUS**: Fabric tension vs drape when sitting.
- **BACKGROUND**: {environment}.`
    },
    {
        id: 's_btm_low_walk',
        name: '大下半身-走 (Walking)',
        category: 'standard',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '行走时的裤脚/裙摆动态。',
        promptTemplate: `[SHOT: WAIST DOWN WALKING]
- **FRAMING**: Waist to floor, mid-motion.
- **POSE**: Mid-stride.
- **FOCUS**: Fabric movement, flow around legs.
- **BACKGROUND**: {environment}.`
    },
    // 3. 细节与背面
    {
        id: 's_btm_detail_waist',
        name: '细节-腰头 (Waist)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '腰头做工，扣子细节。',
        promptTemplate: `[SHOT: CLOSEUP WAIST]
- **FRAMING**: Tight crop on waistband.
- **FOCUS**: Button, zipper, waistband stitching.
- **BACKGROUND**: {environment} blurred.`
    },
    {
        id: 's_btm_back_full',
        name: '背面全身 (Back Full)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '背面整体效果。',
        promptTemplate: `[SHOT: FULL BODY BACK]
- **FRAMING**: Full body from behind.
- **FOCUS**: Overall back silhouette.
- **BACKGROUND**: {environment}.`
    },
    // 4. 动态/坐姿 (SA增补 - 2张)
    {
        id: 's_btm_sa_sit',
        name: 'SA创意-坐 (Creative Sit)',
        category: 'creative',
        pack: 'standard',
        aspectRatio: '3:4',
        description: 'SA款增加：优雅坐姿。',
        promptTemplate: `[SHOT: FULL BODY SITTING]
- **FRAMING**: Full body sitting.
- **POSE**: Stylish, relaxed posture on a chair/sofa.
- **FOCUS**: Lifestyle vibe of the bottom wear.
- **BACKGROUND**: {environment} textured.`
    },
    {
        id: 's_btm_sa_motion',
        name: 'SA创意-动 (Creative Motion)',
        category: 'creative',
        pack: 'standard',
        aspectRatio: '3:4',
        description: 'SA款增加：大幅度动态。',
        promptTemplate: `[SHOT: DYNAMIC MOTION]
- **FRAMING**: Full body.
- **POSE**: Twirling (if skirt) or wide stride (if pants).
- **MOOD**: High energy.`
    }
];

// ==========================================
// 3. 短装 S 级标准 (Shorts/Short Skirts) - 9-11 Shots
// ==========================================
export const S_GRADE_SHORTS_SHOTS: ShotDefinition[] = [
    // 1. 全身 (1张)
    {
        id: 's_sht_full',
        name: '全身正面 (Full)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '交代整体搭配。',
        promptTemplate: `[SHOT: FULL BODY]
- **FRAMING**: Full body.
- **POSE**: Casual standing.
- **FOCUS**: Overall look.`
    },
    // 2. 大下半身 (2张)
    {
        id: 's_sht_low_1',
        name: '大下半身-正 (Lower Front)',
        category: 'standard',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '腿部线条，短裤/裙版型。',
        promptTemplate: `[SHOT: WAIST DOWN FRONT]
- **FRAMING**: Waist to mid-calf.
- **FOCUS**: Shorts/Skirt fit, leg shape.
- **BACKGROUND**: {environment}.`
    },
    {
        id: 's_sht_low_2',
        name: '大下半身-侧 (Lower Side)',
        category: 'standard',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '侧面版型。',
        promptTemplate: `[SHOT: WAIST DOWN SIDE]
- **FRAMING**: Waist to knee profile.
- **FOCUS**: Hemline, side fit.
- **BACKGROUND**: {environment}.`
    },
    // 3. 带上半身 (2张) - 核心重点
    {
        id: 's_sht_with_upper_1',
        name: '带上半身-正 (With Upper)',
        category: 'standard',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '半身构图带入短装，展示腰线。',
        promptTemplate: `[SHOT: THIGH UP FRONT]
- **FRAMING**: Mid-thigh to head.
- **POSE**: Hands in pockets or on hips.
- **FOCUS**: Connectivity between top and bottom.
- **BACKGROUND**: {environment}.`
    },
    {
        id: 's_sht_with_upper_2',
        name: '带上半身-侧 (With Upper Side)',
        category: 'standard',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '侧面半身带入短装。',
        promptTemplate: `[SHOT: THIGH UP SIDE]
- **FRAMING**: Mid-thigh to head profile.
- **POSE**: Looking over shoulder.
- **FOCUS**: Side silhouette.
- **BACKGROUND**: {environment}.`
    },
    // 4. 大特写 (2张)
    {
        id: 's_sht_macro_1',
        name: '极致特写 (Macro Detail)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '材质极致特写，扣子/拉链。',
        promptTemplate: `[SHOT: MACRO DETAIL]
- **FRAMING**: Extreme close-up.
- **FOCUS**: Fabric texture, hardware.
- **LIGHTING**: Soft studio light.`
    },
    {
        id: 's_sht_macro_2',
        name: '特写-辅助 (Detail 2)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '另一个角度的特写。',
        promptTemplate: `[SHOT: CLOSE UP DETAIL]
- **FRAMING**: Close up on pocket of hem.
- **FOCUS**: Stitching quality.`
    },
    // 5. 细节 (1张)
    {
        id: 's_sht_detail',
        name: '常规细节 (Detail)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '常规细节展示。',
        promptTemplate: `[SHOT: WAIST DETAIL]
- **FRAMING**: Close up waist.`
    },
    // 6. 背面 (1张)
    {
        id: 's_sht_back',
        name: '背面展示 (Back)',
        category: 'basic',
        pack: 'standard',
        aspectRatio: '3:4',
        description: '后片效果。',
        promptTemplate: `[SHOT: FULL BODY BACK]
- **FRAMING**: Full body from behind.`
    },
    // 7. SA增补 (1-2张)
    {
        id: 's_sht_sa_1',
        name: 'SA创意 (Creative)',
        category: 'creative',
        pack: 'standard',
        aspectRatio: '3:4',
        description: 'SA款创意镜头。',
        promptTemplate: `[SHOT: CREATIVE ANGLE]
- **FRAMING**: Low angle or dynamic.`
    }
];

// 唯品会增补包 (3 Shots)
// 关键词：网感、场景、即使感、点击率
export const VIP_SUPPLEMENT_SHOTS: ShotDefinition[] = [
    {
        id: 'vip_vibe_snap',
        name: '场景抓拍 (Vibe Snap)',
        category: 'supplement',
        pack: 'vip',
        aspectRatio: '3:4',
        description: '非棚拍感，更加生活的瞬间，回头/大笑。',
        promptTemplate: `[SHOT: LIFESTYLE SNAPSHOT]
- **FRAMING**: Candid full body or 3/4.
- **ACTION**: Caught in movement, laughing, or turning back head.
- **STYLE**: Strong "net sense" (influencer style). Less posed, more raw.
- **BACKGROUND**: {environment} - engaging and lively.
- **MOOD**: Spontaneous, joyful, "in the moment".`
    },
    {
        id: 'vip_prop_inter',
        name: '道具互动 (Prop)',
        category: 'supplement',
        pack: 'vip',
        aspectRatio: '3:4',
        description: '鲜花/咖啡/报纸，营造生活方式。',
        promptTemplate: `[SHOT: PROP INTERACTION]
- **FRAMING**: Waist up or 3/4.
- **ACTION**: Holding fresh flowers, a coffee cup, or magazine.
- **FOCUS**: Lifestyle integration of the outfit.
- **BACKGROUND**: {environment} with lifestyle elements.
- **MOOD**: Relaxed, daily luxury.`
    },
    {
        id: 'vip_dynamic_pose',
        name: '动态扭姿 (Dynamic Pose)',
        category: 'supplement',
        pack: 'vip',
        aspectRatio: '3:4',
        description: '所谓“扭捏”但显身材的网红构图。',
        promptTemplate: `[SHOT: DYNAMIC POSE]
- **FRAMING**: Full body.
- **POSE**: Exaggerated curve, "broken" standing pose to accentuate curves.
- **STYLE**: High click-through rate style. Visually impactful.
- **BACKGROUND**: {environment} environment.
- **MOOD**: Confident, attention-grabbing.`
    }
];

export const getLookbookShots = (
    category: ProductCategory = 'dress',
    packs: ShotPack[] = ['standard'],
    env: ShotEnvironment = 'indoor'
): ShotDefinition[] => {
    let shots: ShotDefinition[] = [];

    // In S-Grade standard, shots are uniform across categories, 
    // but we might want to tweak prompts slightly based on category in the future.
    // For now, we use the unified S-Grade set.

    // Dispatch S-Grade shots based on category
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

    if (packs.includes('vip')) {
        shots = [...shots, ...VIP_SUPPLEMENT_SHOTS];
    }

    // Environment Descriptions
    const ENV_DESCRIPTIONS: Record<ShotEnvironment, string> = {
        indoor: "Clean Indoor Studio, minimalist grey or textured wall, soft window light, high-end gallery space",
        outdoor: "Outdoor Street, upscale city street (Parisian style), soft sunlight, architectural depth, blurred background"
    };

    // Inject Environment into Prompt Templates
    return shots.map(shot => ({
        ...shot,
        promptTemplate: shot.promptTemplate.replace('{environment}', ENV_DESCRIPTIONS[env] || ENV_DESCRIPTIONS.indoor)
    }));
};


// ==========================================
// 模块二：形象大片 (Editorial/Campaign) - 4 Shots FIXED
// ==========================================
export const CAMPAIGN_SHOTS: ShotDefinition[] = [
    {
        id: 'campaign_hero',
        name: '主视觉 (Hero)',
        category: 'creative',
        aspectRatio: '3:4',
        description: 'The defining brand statement. Relaxed resort luxury.',
        promptTemplate: `[SHOT: HERO CAMPAIGN]
- **COMPOSITION**: Wide or 3/4 shot. Center weighted but relaxed.
- **LIGHTING**: Golden hour sunlight, warm and enveloping.
- **POSE**: Relaxed elegance. Walking near water or leaning on resort architecture.
- **BACKGROUND**: Upscale Sanya-style resort, blurred tropical greenery, clean white architecture.
- **VIBE**: "The Face of the Holiday". Effortless chic, wealthy but relaxed.`
    },
    {
        id: 'campaign_scene',
        name: '场景融合 (Scene)',
        category: 'creative',
        aspectRatio: '3:4',
        description: 'Immersion in the resort atmosphere.',
        promptTemplate: `[SHOT: ENVIRONMENTAL WIDE]
- **FRAMING**: Wide shot, prioritizing environment-person harmony.
- **RELATIONSHIP**: Merging with nature (tropical plants) or architectural lines.
- **FOCUS**: The feeling of being on vacation. Outfit flow in the breeze.
- **BACKGROUND**: Dappled light through palm leaves, swimming pool reflections, or ocean horizon.
- **MOOD**: Storytelling, escape, freedom.`
    },
    {
        id: 'campaign_light',
        name: '光影艺术 (Light)',
        category: 'creative',
        aspectRatio: '3:4',
        description: 'Sun-kissed texture and shadows.',
        promptTemplate: `[SHOT: ARTISTIC LIGHTING]
- **TECHNIQUE**: Hard sunlight creating geometric shadows (palm leaves/architecture).
- **FOCUS**: Warmth on skin and fabric texture.
- **MOOD**: Lazy afternoon, sensory, emotional.
- **LIGHTING**: Natural hard light, rich contrast but warm tones.`
    },
    {
        id: 'campaign_emotion',
        name: '情绪特写 (Emotion)',
        category: 'creative',
        aspectRatio: '3:4',
        description: 'Breezy intimacy.',
        promptTemplate: `[SHOT: EMOTIONAL CLOSEUP]
- **FRAMING**: Close-up on face/shoulder.
- **EXPRESSION**: Soft, genuine, enjoying the breeze. Slight smile or relaxed gaze.
- **STYLE**: Backlit by sun (hair glow), slight overexposure for airiness.
- **VIBE**: Intimate, soulfulness, "in the moment".`
    }
];

// ==========================================
// 模块三：静物特写 (Still Life) - Unchanged
// ==========================================
// ==========================================
// 模块三：静物特写 (Still Life) - S级重构 (Phase 4)
// ==========================================

// 1. 创意静物 (Creative) - 4 Shots
export const STILL_LIFE_CREATIVE_SHOTS: ShotDefinition[] = [
    {
        id: 'sc_outdoor_vibe',
        name: '外景氛围 (Outdoor)',
        category: 'creative',
        aspectRatio: '3:4',
        description: '带自然光影和环境的静物图。',
        promptTemplate: `[SHOT: CREATIVE OUTDOOR]
- **COMPOSITION**: Product placed on natural stone or wood texture.
- **LIGHTING**: Dappled sunlight (gobo), leaf shadows.
- **BACKGROUND**: Blurred outdoor garden or architectural wall.
- **MOOD**: Organic, breathing, high-end.`
    },
    {
        id: 'sc_color_stack',
        name: '多色叠穿 (Stack)',
        category: 'creative',
        aspectRatio: '3:4',
        description: '同款多色叠放展示。',
        promptTemplate: `[SHOT: COLOR STACK]
- **COMPOSITION**: Neatly folded stack of the same item in different colors (if applicable) or gradient arrangement.
- **FOCUS**: Edge alignment, software drape.
- **LIGHTING**: Soft studio light, highlighting color differences.`
    },
    {
        id: 'sc_fabric_source',
        name: '面料溯源 (Source)',
        category: 'creative',
        aspectRatio: '3:4',
        description: '面料成分/原料概念图。',
        promptTemplate: `[SHOT: FABRIC SOURCE]
- **COMPOSITION**: Garment mixed with raw material concepts (cotton boll, wool yarn, silk cocoons).
- **STYLE**: Artistic conceptual photography.
- **LIGHTING**: Warm, origin-story vibe.`
    },
    {
        id: 'sc_detail_craft',
        name: '工艺特写 (Craft)',
        category: 'creative',
        aspectRatio: '3:4',
        description: '极致微距展示做工。',
        promptTemplate: `[SHOT: CRAFT DETAIL]
- **FRAMING**: Extreme macro on stitching or embroidery.
- **LIGHTING**: Raking light to show thread relief.
- **FOCUS**: Precision and quality.`
    }
];

// 2. 常规静物 (Standard) - 按品类拆分

// 2.1 上装 (Tops) - 6 Shots
export const STILL_LIFE_TOPS_SHOTS: ShotDefinition[] = [
    { id: 'st_top_hang_f', name: '挂拍正面 (Front)', category: 'standard', aspectRatio: '3:4', description: '正面挂拍。', promptTemplate: '[SHOT: HANGING FRONT] Clean white background. Simple wooden hanger.' },
    { id: 'st_top_hang_b', name: '挂拍背面 (Back)', category: 'standard', aspectRatio: '3:4', description: '背面挂拍。', promptTemplate: '[SHOT: HANGING BACK] Reverse side hanging.' },
    { id: 'st_top_flat', name: '平铺造型 (Flat)', category: 'standard', aspectRatio: '3:4', description: '正面平铺造型。', promptTemplate: '[SHOT: STYLED FLAT LAY] Artistic folding, sleeves arranged naturally.' },
    { id: 'st_top_col', name: '细节-领口 (Collar)', category: 'standard', aspectRatio: '1:1', description: '领口细节。', promptTemplate: '[SHOT: MACRO COLLAR] Focus on twisting/neckline design.' },
    { id: 'st_top_cuff', name: '细节-袖口 (Cuff)', category: 'standard', aspectRatio: '1:1', description: '袖口细节。', promptTemplate: '[SHOT: MACRO CUFF] Focus on sleeve ending/buttons.' },
    { id: 'st_top_hem', name: '细节-下摆 (Hem)', category: 'standard', aspectRatio: '1:1', description: '下摆/面料。', promptTemplate: '[SHOT: MACRO HEM] Focus on bottom stitching and fabric texture.' }
];

// 2.2 下装 (Bottoms) - 5 Shots (Pants/Skirts/Shorts)
export const STILL_LIFE_BOTTOMS_SHOTS: ShotDefinition[] = [
    { id: 'st_btm_hang_f', name: '挂拍正面 (Front)', category: 'standard', aspectRatio: '3:4', description: '正面展示裤型/裙型。', promptTemplate: '[SHOT: HANGING FRONT] Clip hanger. Showing full leg shape.' },
    { id: 'st_btm_hang_b', name: '挂拍背面 (Back)', category: 'standard', aspectRatio: '3:4', description: '背面展示。', promptTemplate: '[SHOT: HANGING BACK] Showing back pockets and fit.' },
    { id: 'st_btm_waist', name: '细节-腰头 (Waist)', category: 'standard', aspectRatio: '1:1', description: '腰部核心特写。', promptTemplate: '[SHOT: MACRO WAISTBAND] Focus on button, zipper, and waist construction.' },
    { id: 'st_btm_hem', name: '细节-裤脚 (Hem)', category: 'standard', aspectRatio: '1:1', description: '裤脚/裙摆细节。', promptTemplate: '[SHOT: MACRO HEM] Focus on leg opening stitching.' },
    { id: 'st_btm_tex', name: '面料肌理 (Texture)', category: 'standard', aspectRatio: '1:1', description: '面料微距。', promptTemplate: '[SHOT: MICRO TEXTURE] Extreme close up of weave.' }
];

// 2.3 连衣裙 (Dresses/Coats/Sets) - 6 Shots
export const STILL_LIFE_DRESSES_SHOTS: ShotDefinition[] = [
    { id: 'st_dress_hang_f', name: '全身挂拍-正 (Front)', category: 'standard', aspectRatio: '3:4', description: '整体版型。', promptTemplate: '[SHOT: HANGING FRONT] Full length hanging.' },
    { id: 'st_dress_hang_b', name: '全身挂拍-背 (Back)', category: 'standard', aspectRatio: '3:4', description: '背面收腰结构。', promptTemplate: '[SHOT: HANGING BACK] Full length reverse.' },
    { id: 'st_dress_detail_top', name: '细节-上半身 (Top)', category: 'standard', aspectRatio: '1:1', description: '领口与肩部。', promptTemplate: '[SHOT: CLOSEUP TOP] Focus on bodice and neckline.' },
    { id: 'st_dress_waist', name: '细节-收腰 (Waist)', category: 'standard', aspectRatio: '1:1', description: '腰节工艺。', promptTemplate: '[SHOT: CLOSEUP WAIST] Focus on waist definition/belt.' },
    { id: 'st_dress_hem', name: '细节-裙摆 (Hem)', category: 'standard', aspectRatio: '1:1', description: '下摆垂感。', promptTemplate: '[SHOT: CLOSEUP HEM] Focus on skirt drape and fabric volume.' },
    { id: 'st_dress_fabric', name: '面料质感 (Fabric)', category: 'standard', aspectRatio: '1:1', description: '面料特写。', promptTemplate: '[SHOT: MACRO FABRIC] Texture and print detail.' }
];


// Factory Function to get Still Life Shots
export const getStillLifeShots = (category: ProductCategory = 'dress'): ShotDefinition[] => {

    // 1. Creative Shots are always included (as 'creative' category)
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

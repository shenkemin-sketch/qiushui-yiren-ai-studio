
import { GoogleGenAI } from "@google/genai";
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Import Real Data
// Note: We use relative paths assuming execution from project root or scripts dir context.
// Ideally, tsx handles imports correctly.
import {
    S_GRADE_TOPS_SHOTS,
    S_GRADE_BOTTOMS_SHOTS,
    CAMPAIGN_SHOTS,
    getStillLifeShots,
    getLookbookShots
} from '../data/shotDefinitions';
import { ShotDefinition } from '../src/types';

// --- CONFIGURATION ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const INPUT_DIR = path.join(PROJECT_ROOT, '_ai_test_suite/01_inputs');
const OUTPUT_DIR = path.join(PROJECT_ROOT, '_ai_test_suite/03_outputs');
const ENV_FILE = path.join(PROJECT_ROOT, '.env.local');

// 🔴 SAFETY LIMITS
const MAX_TOTAL_GENERATIONS = 100;
const DELAY_BETWEEN_SHOTS_MS = 2500;

// --- HELPER: Read .env.local ---
function getApiKey(): string {
    if (!fs.existsSync(ENV_FILE)) throw new Error(`.env.local not found`);
    const content = fs.readFileSync(ENV_FILE, 'utf-8');
    const match = content.match(/GEMINI_API_KEY=(.*)/);
    if (!match || !match[1]) throw new Error("GEMINI_API_KEY not found");
    return match[1].trim().replace(/["']/g, '');
}

// --- HELPER: File to Part ---
function fileToPart(filePath: string, mimeType: string) {
    const fileBuffer = fs.readFileSync(filePath);
    return {
        inlineData: {
            data: fileBuffer.toString('base64'),
            mimeType: mimeType
        }
    };
}

// --- HELPER: Utilities ---
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, baseDelay = 1000): Promise<T> {
    try {
        return await fn();
    } catch (error: any) {
        if (retries === 0) throw error;
        // Retry on network errors or 503 or 429
        const msg = error.message || '';
        const shouldRetry = msg.includes('fetch failed') || msg.includes('503') || msg.includes('429');

        if (!shouldRetry) throw error; // Don't retry on 400 Bad Request (Prompt block)

        console.warn(`   ⚠️ Error: ${msg}. Retrying in ${baseDelay}ms... (${retries} left)`);
        await sleep(baseDelay);
        return retryWithBackoff(fn, retries - 1, baseDelay * 2);
    }
}

// --- ENGINE: Generate Image ---
async function generateShot(
    ai: GoogleGenAI,
    baseModelPath: string,
    productPath: string,
    shot: ShotDefinition,
    module: string,
    productCategory: string // 'dress' | 'pants'
) {
    // 1. Prepare Output Path
    const categoryName = productCategory.charAt(0).toUpperCase() + productCategory.slice(1); // Dress
    const moduleName = module.charAt(0).toUpperCase() + module.slice(1); // Lookbook
    const targetDir = path.join(OUTPUT_DIR, categoryName, moduleName);

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    const filename = `${shot.id}.jpg`;
    const outputPath = path.join(targetDir, filename);

    if (fs.existsSync(outputPath)) {
        console.log(`   ⏭️ Skipped (Exists): ${filename}`);
        return;
    }

    console.log(`\n📸 Generating [${categoryName}/${moduleName}]: ${shot.name} (${shot.id})...`);

    // 2. Prompt Construction
    let systemPrompt = `You are the Executive Art Director for 'Autumn Water Lady'.
    **PHOTOREALISTIC MODE ON**.
    - Model: ${baseModelPath.includes('模特') ? 'Keep Identity' : 'Zero Human (Still Life)'}
    - Product Category: ${productCategory}`;

    if (module === 'still_life') {
        systemPrompt += "\n**CONSTRAINT**: ZERO HUMAN PRESENCE. Pure object focus.";
    }

    const parts: any[] = [
        { text: systemPrompt },
        { text: `**[PRIMARY REFERENCE]**` },
        fileToPart(baseModelPath, 'image/jpeg')
    ];

    if (module !== 'still_life') {
        parts.push({ text: `**[GARMENT REFERENCE]**:\nUSAGE: WEAR THIS.` });
        parts.push(fileToPart(productPath, 'image/jpeg'));
    }

    parts.push({ text: `\n=== EXECUTE SHOT ===\nPrompt: ${shot.promptTemplate}\nDescription: ${shot.description}` });

    // 3. Execution with Retry
    await retryWithBackoff(async () => {
        // Log the prompt for verification (QA Loop)
        const logEntry = `\n[${new Date().toISOString()}] [${categoryName}/${moduleName}/${shot.id}]\nPROMPT: ${shot.promptTemplate}\n----------------------------------------`;
        fs.appendFileSync(path.join(PROJECT_ROOT, '_ai_test_suite/test_run.log'), logEntry);

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-image-preview',
            contents: { parts: parts },
            config: {
                imageConfig: { imageSize: '2K' },
                generationConfig: { temperature: 0.4 }
            }
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

        if (imagePart?.inlineData?.data) {
            const buffer = Buffer.from(imagePart.inlineData.data, 'base64');
            fs.writeFileSync(outputPath, buffer);
            console.log(`   ✅ Saved: ${filename}`);
        } else {
            console.error("   ❌ No image returned. Check policy.");
            fs.appendFileSync(path.join(PROJECT_ROOT, '_ai_test_suite/test_run.log'), `\n❌ SCENARIO FAILED: ${filename}\n`);
            // Log full response for debugging
            // console.log(JSON.stringify(response, null, 2));
        }
    });
}

// --- MAIN EXECUTION ---
async function runSuite() {
    console.log("🚀 Starting V2 Upgrade AI Test Suite...");
    const ai = new GoogleGenAI({ apiKey: getApiKey() });

    // Inputs
    const MODEL_IMG = path.join(INPUT_DIR, '模特 1.jpg');
    const DRESS_IMG = path.join(INPUT_DIR, '连衣裙.jpg');
    const PANTS_IMG = path.join(INPUT_DIR, '牛仔裤.jpg');

    if (!fs.existsSync(MODEL_IMG)) { console.error("Missing input: 模特 1.jpg"); return; }

    // === EXECUTION PLAN ===
    // 1. Dress (Category: dress)
    //    - Lookbook: S_GRADE_TOPS_SHOTS
    //    - Campaign: CAMPAIGN_SHOTS
    //    - Still Life: getStillLifeShots('dress')

    console.log("\n====== PRODUCT: DRESS (连衣裙) ======");
    // 1. Lookbook Studio (Indoor)
    const dressShots_Studio = getLookbookShots('dress', ['standard'], 'indoor');
    for (const shot of dressShots_Studio) {
        await generateShot(ai, MODEL_IMG, DRESS_IMG, shot, 'lookbook_studio', 'dress');
        await sleep(DELAY_BETWEEN_SHOTS_MS);
    }
    // 2. Lookbook Outdoor (Outdoor)
    const dressShots_Outdoor = getLookbookShots('dress', ['standard'], 'outdoor');
    for (const shot of dressShots_Outdoor) {
        await generateShot(ai, MODEL_IMG, DRESS_IMG, shot, 'lookbook_outdoor', 'dress');
        await sleep(DELAY_BETWEEN_SHOTS_MS);
    }

    // 3. Campaign
    const dressShots_Campaign = CAMPAIGN_SHOTS;
    for (const shot of dressShots_Campaign) {
        await generateShot(ai, MODEL_IMG, DRESS_IMG, shot, 'campaign', 'dress');
        await sleep(DELAY_BETWEEN_SHOTS_MS);
    }
    // 4. Still Life
    const dressShots_Still = getStillLifeShots('dress');
    for (const shot of dressShots_Still) {
        await generateShot(ai, DRESS_IMG, DRESS_IMG, shot, 'still_life', 'dress');
        await sleep(DELAY_BETWEEN_SHOTS_MS);
    }

    // 2. Pants (Category: pants)
    //    - Lookbook: S_GRADE_BOTTOMS_SHOTS
    //    - Campaign: CAMPAIGN_SHOTS
    //    - Still Life: getStillLifeShots('pants')

    console.log("\n====== PRODUCT: PANTS (牛仔裤) ======");
    // 1. Lookbook Studio (Indoor)
    const pantsShots_Studio = getLookbookShots('pants', ['standard'], 'indoor');
    for (const shot of pantsShots_Studio) {
        await generateShot(ai, MODEL_IMG, PANTS_IMG, shot, 'lookbook_studio', 'pants');
        await sleep(DELAY_BETWEEN_SHOTS_MS);
    }
    // 2. Lookbook Outdoor (Outdoor)
    const pantsShots_Outdoor = getLookbookShots('pants', ['standard'], 'outdoor');
    for (const shot of pantsShots_Outdoor) {
        await generateShot(ai, MODEL_IMG, PANTS_IMG, shot, 'lookbook_outdoor', 'pants');
        await sleep(DELAY_BETWEEN_SHOTS_MS);
    }

    // 3. Campaign
    const pantsShots_Campaign = CAMPAIGN_SHOTS;
    for (const shot of pantsShots_Campaign) {
        await generateShot(ai, MODEL_IMG, PANTS_IMG, shot, 'campaign', 'pants');
        await sleep(DELAY_BETWEEN_SHOTS_MS);
    }
    // 4. Still Life
    const pantsShots_Still = getStillLifeShots('pants');
    for (const shot of pantsShots_Still) {
        await generateShot(ai, PANTS_IMG, PANTS_IMG, shot, 'still_life', 'pants');
        await sleep(DELAY_BETWEEN_SHOTS_MS);
    }

    console.log(`\n🎉 Test Suite V2 Completed.`);
}

runSuite();

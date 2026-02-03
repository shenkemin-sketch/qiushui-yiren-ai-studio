import { GoogleGenAI } from "@google/genai";

// Increase execution time limit to 60s (Pro plan) or 10s (Hobby)
// Note: Hobby plan has hard 10s limit for Serverless Functions.
export const config = {
    maxDuration: 60,
};

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { model, parts, genConfig } = req.body;

        // Server-side environment variable check
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("Missing GEMINI_API_KEY environment variable");
            return res.status(500).json({ error: 'Configuration Error: Backend API Key missing.' });
        }

        const ai = new GoogleGenAI({ apiKey });

        // Call the Gemini API
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: parts },
            config: genConfig,
        });

        // Return the full response object
        return res.status(200).json(response);

    } catch (error: any) {
        console.error("Backend Proxy Error:", error);
        return res.status(500).json({
            error: {
                message: error.message || 'Internal Server Error',
                details: error.toString()
            }
        });
    }
}

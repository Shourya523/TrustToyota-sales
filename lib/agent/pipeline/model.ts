import { generateText as baseGenerateText, GenerateTextResult } from 'ai';
import { groq } from '@ai-sdk/groq';

export async function generateText(options: any) {
    const originalModel = options.model;
    
    try {
        return await baseGenerateText(options);
    } catch (err: any) {
        const errorMsg = String(err.message || err).toLowerCase();
        const isRateLimit = errorMsg.includes("rate limit") || errorMsg.includes("429") || errorMsg.includes("limit reached") || errorMsg.includes("tokens per day");
        
        if (isRateLimit) {
            console.warn(`[Pipeline] Rate limit hit on model. Falling back to llama-3.1-8b-instant.`);
            
            // Force fallback to llama-3.1-8b-instant
            return await baseGenerateText({
                ...options,
                model: groq('llama-3.1-8b-instant')
            });
        }
        
        throw err;
    }
}

import { generateText } from '@/lib/agent/pipeline/model';
import { groq } from '@ai-sdk/groq';

export interface DashboardSuggestion {
    shouldSuggest: boolean;
    suggestionText?: string;
    suggestedWidgetType?: 'bar' | 'pie' | 'line' | 'metric';
}

export async function generateDashboardSuggestion(
    query: string,
    insight: string
): Promise<DashboardSuggestion> {
    try {
        const { text } = await generateText({
            model: groq('llama-3.3-70b-versatile'),
            system: `You are a Dashboard Analyst. Output ONLY a raw JSON object. Do not use markdown blocks.
            Format: {"shouldSuggest": boolean, "suggestionText": "string", "suggestedWidgetType": "bar" | "pie" | "line" | "metric"}
            If it's a simple lookup, set shouldSuggest to false.`,
            prompt: `User Question: "${query}"\nInsight Provided: "${insight}"\n\nReturn JSON.`,
        });

        // Strip markdown blocks if the LLM adds them
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanText);
        return parsed;
    } catch (err) {
        console.error("[Pipeline] Error generating dashboard suggestion", err);
        return { shouldSuggest: false };
    }
}

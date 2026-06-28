import { generateText } from '@/lib/agent/pipeline/model';
import { groq } from '@ai-sdk/groq';

export interface ChartSuggestion {
    shouldRender: boolean;
    type?: 'bar' | 'line' | 'pie' | 'area';
    title?: string;
    xKey?: string;
    yKey?: string;
}

export async function detectChartRequirement(
    query: string,
    data: any[]
): Promise<ChartSuggestion> {
    try {
        if (!Array.isArray(data) || data.length < 2) {
            return { shouldRender: false };
        }
        
        // Take keys from the first row of data
        const keys = Object.keys(data[0]);
        if (keys.length < 2) return { shouldRender: false };

        const { text } = await generateText({
            model: groq('llama-3.3-70b-versatile'),
            system: `You are a data visualization assistant. Determine if the given dataset should be visualized as a chart. 
Only recommend a chart if it has multiple categories or values that compare nicely (like sales per model, deliveries per month, rankings).
If the user explicitly requests a specific chart type (such as "pie", "pie chart", "bar chart", "line chart", "area chart") in their query, you MUST set "shouldRender" to true and use that requested type.
Output ONLY a raw JSON: {"shouldRender": boolean, "type": "bar"|"line"|"pie"|"area", "title": "string", "xKey": "string", "yKey": "string"}
xKey and yKey MUST exactly match one of the keys in this list: ${JSON.stringify(keys)}.`,
            prompt: `User query: "${query}"\nData Sample (first 3 rows): ${JSON.stringify(data.slice(0, 3))}`
        });

        // Clean markdown code blocks from JSON
        const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanText);
        
        // Confirm keys match exactly
        if (parsed.shouldRender && (!keys.includes(parsed.xKey) || !keys.includes(parsed.yKey))) {
            return { shouldRender: false };
        }

        return parsed;
    } catch (err) {
        console.error("[Pipeline] Chart detection failed:", err);
        return { shouldRender: false };
    }
}

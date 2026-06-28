import { generateText } from '@/lib/agent/pipeline/model';
import { groq } from '@ai-sdk/groq';

export type Intent = 'SQL_QUERY' | 'GENERAL_CHAT' | 'DASHBOARD_EDIT';

export async function classifyIntent(query: string): Promise<Intent> {
    const lowerQuery = query.toLowerCase();
    
    // Quick keyword heuristic for analytics queries
    const dataKeywords = [
        'sales', 'deliveries', 'delivery', 'showroom', 'officer', 'so',
        'model', 'vehicle', 'car', 'perform', 'rank', 'diverse', 'diversity',
        'how many', 'count', 'who', 'which', 'top', 'best', 'worst', 'compare',
        'average', 'avg', 'growth'
    ];

    const isDataQuery = dataKeywords.some(keyword => {
        // Match whole words or boundary conditions
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        return regex.test(lowerQuery);
    });

    if (isDataQuery) {
        console.log(`[Pipeline] Intent Classified (Heuristic): SQL_QUERY`);
        return 'SQL_QUERY';
    }

    try {
        const { text } = await generateText({
            model: groq('llama-3.3-70b-versatile'),
            system: `You are a strict intent classifier for a dealership analytics dashboard.
Categorize the user's input into one of three categories:
- SQL_QUERY: ANY question about data, sales, deliveries, vehicles, showrooms, officers, performance, models, metrics, analysis, rankings, or comparisons.
- DASHBOARD_EDIT: ANY request to modify the UI, colors, charts, or layout.
- GENERAL_CHAT: ONLY for basic greetings ("hi", "hello") or completely unrelated small talk.

Output ONLY the exact category name. Do not explain.`,
            prompt: `User Input: "${query}"\nCategory:`,
        });

        const intentString = text.trim().toUpperCase();
        let intent: Intent = 'GENERAL_CHAT';
        
        if (intentString.includes('SQL_QUERY')) {
            intent = 'SQL_QUERY';
        } else if (intentString.includes('DASHBOARD_EDIT')) {
            intent = 'DASHBOARD_EDIT';
        } else if (intentString.includes('GENERAL_CHAT')) {
            intent = 'GENERAL_CHAT';
        } else {
            intent = 'SQL_QUERY';
        }

        console.log(`[Pipeline] Intent Classified (LLM): ${intent}`);
        return intent;
    } catch (err) {
        console.error('[Pipeline] Failed to classify intent, falling back to SQL_QUERY', err);
        return 'SQL_QUERY';
    }
}

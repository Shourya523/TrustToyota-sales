import { generateText } from '@/lib/agent/pipeline/model';
import { groq } from '@ai-sdk/groq';

export async function generateInsight(
    query: string,
    sqlData: any,
    finalSql: string
): Promise<string> {
    let dataString = JSON.stringify(sqlData, null, 2);
    if (dataString.length > 5000) {
        const sliced = Array.isArray(sqlData) ? sqlData.slice(0, 20) : sqlData;
        dataString = JSON.stringify(sliced, null, 2) + "\n... (data truncated to fit context limit)";
    }
    
    const { text } = await generateText({
        model: groq('openai/gpt-oss-120b'),
        system: `You are an expert Data Analyst Copilot. Your job is to take raw database query results and the user's original question, and provide a clear, concise, and insightful conversational response.
        Do not output raw JSON. State the answer clearly. If the result is a single number, present it nicely. If it's a list, summarize or list it nicely.
        Do not reveal the raw SQL to the user unless they asked for it.`,
        prompt: `User Question: "${query}"\n\nDatabase Results:\n${dataString}`,
    });

    return text;
}

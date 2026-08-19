import { generateText } from '@/lib/agent/pipeline/model';
import { groq } from '@ai-sdk/groq';

export async function createExecutionPlan(
    query: string,
    schemaGraph: string,
    semantics: string,
    examples: string
): Promise<string> {
    try {
        const { text: plan } = await generateText({
            model: groq('openai/gpt-oss-120b'),
            system: `You are the Planning Agent. Your job is to take a user's question, the database schema graph, business semantics, and past examples, and formulate a step-by-step reasoning plan to answer the question. Do NOT generate the actual SQL, just outline the logic required.
            
Schema Graph Context:
${schemaGraph}

Business Semantics:
${semantics}

Few-Shot Examples:
${examples}
`,
            prompt: `User Question: "${query}"\n\nOutline the step-by-step logic required to fetch this data.`,
        });

        console.log("[Pipeline] Plan Created:", plan);
        return plan;
    } catch (err) {
        console.error("[Pipeline] Error creating plan:", err);
        return "Failed to create plan. Proceeding with direct generation.";
    }
}

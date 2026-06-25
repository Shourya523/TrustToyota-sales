// app/api/agent/route.ts
import { groq } from "@ai-sdk/groq";
import {
    streamText,
    convertToModelMessages,
    createUIMessageStreamResponse,
    toUIMessageStream,
    UIMessage
} from "ai";
import { getAgentTools } from "@/lib/agent/tools";
import { systemPrompt } from "@/lib/agent/prompts";

export async function POST(req: Request) {
    const payload = await req.json();
    console.log("Received payload:", payload);
    const messages: UIMessage[] = payload.messages || payload || [];

    const result = streamText({
        model: groq("llama-3.3-70b-versatile"),
        system: systemPrompt,
        messages: await convertToModelMessages(messages),
        tools: getAgentTools(),
    });

    return result.toUIMessageStreamResponse();
}
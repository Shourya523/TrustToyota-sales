import { groq } from "@ai-sdk/groq";
import {
    streamText,
    convertToModelMessages,
    createUIMessageStreamResponse,
    UIMessageChunk,
} from "ai";
import { getAgentTools } from "@/lib/agent/tools";
import { systemPrompt } from "@/lib/agent/prompts";
import { classifyIntent } from "@/lib/agent/pipeline/intent-classifier";
import { getGraphSchemaContext } from "@/lib/agent/pipeline/neo4j-schema-graph";
import { retrieveSemantics, retrieveExamples } from "@/lib/agent/pipeline/retrievers";
import { createExecutionPlan } from "@/lib/agent/pipeline/planning-agent";
import { executeWithRepair } from "@/lib/agent/pipeline/sql-engine";
import { generateInsight } from "@/lib/agent/pipeline/insight-generator";
import { generateDashboardSuggestion } from "@/lib/agent/pipeline/dashboard-suggestions";
import { detectChartRequirement } from "@/lib/agent/pipeline/chart-detector";

export async function POST(req: Request) {
    const payload = await req.json();
    let messages: any[] = [];
    let lastUserMessage = '';

    if (payload.messages && Array.isArray(payload.messages)) {
        messages = payload.messages;
        const lastMsg = messages[messages.length - 1];
        if (typeof lastMsg.content === 'string') {
            lastUserMessage = lastMsg.content;
        } else if (Array.isArray(lastMsg.parts)) {
            const textPart = lastMsg.parts.find((p: any) => p.type === 'text');
            if (textPart) lastUserMessage = textPart.text;
        } else if (lastMsg.text) {
            lastUserMessage = lastMsg.text;
        }
    } else if (Array.isArray(payload)) {
        messages = payload;
        const lastMsg = messages[messages.length - 1];
        if (typeof lastMsg.content === 'string') {
            lastUserMessage = lastMsg.content;
        } else if (Array.isArray(lastMsg.parts)) {
            const textPart = lastMsg.parts.find((p: any) => p.type === 'text');
            if (textPart) lastUserMessage = textPart.text;
        } else if (lastMsg.text) {
            lastUserMessage = lastMsg.text;
        }
    } else if (payload.text) {
        messages = [{ role: 'user', content: payload.text }];
        lastUserMessage = payload.text;
    } else if (payload.prompt) {
        messages = [{ role: 'user', content: payload.prompt }];
        lastUserMessage = payload.prompt;
    }

    // Double-check if we got an empty string or undefined
    lastUserMessage = lastUserMessage || '';

    const messageId = `assistant-msg-${Date.now()}`;

    // Use a custom ReadableStream of UIMessageChunks to stream pipeline steps
    const stream = new ReadableStream<UIMessageChunk>({
        async start(controller) {
            function writeText(text: string) {
                controller.enqueue({
                    type: 'text-delta',
                    id: messageId,
                    delta: text
                });
            }

            // Signal start of text
            controller.enqueue({
                type: 'text-start',
                id: messageId
            });

            try {
                writeText("Analyzing intent...\n\n");
                const intent = await classifyIntent(lastUserMessage);

                if (intent === 'SQL_QUERY') {
                    writeText("Querying Neo4j schema graph...\n\n");
                    const schema = await getGraphSchemaContext();

                    writeText("Retrieving semantic rules & examples...\n\n");
                    const semantics = await retrieveSemantics(lastUserMessage);
                    const examples = await retrieveExamples(lastUserMessage);

                    writeText("Creating execution plan...\n\n");
                    const plan = await createExecutionPlan(lastUserMessage, schema, semantics, examples);

                    writeText("Executing SQL with self-repair...\n\n");
                    const { data: rawData, finalSql } = await executeWithRepair(lastUserMessage, plan, schema);

                    // Clean numbers for recharts (cast string numbers from driver to actual numbers)
                    const data = Array.isArray(rawData) ? rawData.map((row: any) => {
                        const cleaned: any = {};
                        for (const key of Object.keys(row)) {
                            const val = row[key];
                            if (typeof val === 'string' && /^\d+$/.test(val)) {
                                cleaned[key] = parseInt(val, 10);
                            } else if (typeof val === 'string' && /^\-?\d+$/.test(val)) {
                                cleaned[key] = parseInt(val, 10);
                            } else if (typeof val === 'string' && /^\-?\d+\.\d+$/.test(val)) {
                                cleaned[key] = parseFloat(val);
                            } else {
                                cleaned[key] = val;
                            }
                        }
                        return cleaned;
                    }) : rawData;

                    // 1. Stream the SQL execution as a tool chunk to the UI (to render table!)
                    const sqlCallId = `sql-${Date.now()}`;
                    controller.enqueue({
                        type: 'tool-input-available',
                        toolCallId: sqlCallId,
                        toolName: 'executeSql',
                        input: { query: finalSql }
                    });
                    controller.enqueue({
                        type: 'tool-output-available',
                        toolCallId: sqlCallId,
                        output: data
                    });

                    // 2. Dynamically detect if a chart should be rendered
                    const chartSuggestion = await detectChartRequirement(lastUserMessage, data);
                    if (chartSuggestion.shouldRender) {
                        const chartCallId = `chart-${Date.now()}`;
                        controller.enqueue({
                            type: 'tool-input-available',
                            toolCallId: chartCallId,
                            toolName: 'getChartTool',
                            input: { query: finalSql, type: chartSuggestion.type, title: chartSuggestion.title, xKey: chartSuggestion.xKey, yKey: chartSuggestion.yKey }
                        });
                        controller.enqueue({
                            type: 'tool-output-available',
                            toolCallId: chartCallId,
                            output: { chartConfig: { type: chartSuggestion.type, title: chartSuggestion.title, data, xKey: chartSuggestion.xKey, yKey: chartSuggestion.yKey, query: finalSql } }
                        });
                    }

                    writeText("Generating insights...\n\n");
                    const insight = await generateInsight(lastUserMessage, data, finalSql);
                    
                    const suggestion = await generateDashboardSuggestion(lastUserMessage, insight);

                    let finalResponse = insight;
                    if (suggestion.shouldSuggest) {
                        finalResponse += `\n\n> **Dashboard Suggestion**: ${suggestion.suggestionText} (Widget: ${suggestion.suggestedWidgetType})`;
                    }

                    // Stream the final response
                    writeText(finalResponse);
                    
                    controller.enqueue({
                        type: 'text-end',
                        id: messageId
                    });
                    controller.close();
                } else {
                    // Fallback to standard conversational agent without tools 
                    // (since Groq throws validation errors for unused tools on general chat)
                    writeText("Routing to conversational agent...\n\n");
                    
                    let result;
                    try {
                        result = streamText({
                            model: groq("llama-3.3-70b-versatile"),
                            system: systemPrompt,
                            messages: await convertToModelMessages(messages)
                        });
                        for await (const chunk of result.textStream) {
                            writeText(chunk);
                        }
                    } catch (err: any) {
                        const errorMsg = String(err.message || err).toLowerCase();
                        if (errorMsg.includes("rate limit") || errorMsg.includes("429") || errorMsg.includes("limit reached") || errorMsg.includes("tokens per day")) {
                            console.warn("[Pipeline] streamText Rate limit hit. Falling back to llama-3.1-8b-instant.");
                            result = streamText({
                                model: groq("llama-3.1-8b-instant"),
                                system: systemPrompt,
                                messages: await convertToModelMessages(messages)
                            });
                            for await (const chunk of result.textStream) {
                                writeText(chunk);
                            }
                        } else {
                            throw err;
                        }
                    }

                    controller.enqueue({
                        type: 'text-end',
                        id: messageId
                    });
                    controller.close();
                }
            } catch (err: any) {
                console.error("[Pipeline] Error:", err);
                writeText(`\n\nError during pipeline execution: ${err.message}`);
                controller.enqueue({
                    type: 'text-end',
                    id: messageId
                });
                controller.close();
            }
        }
    });

    return createUIMessageStreamResponse({ stream });
}
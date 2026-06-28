"use client";

import { ChartRender } from '@/app/components/ChartRendered';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Send, Bot, User, Database, Mic, MicOff, TrendingUp, CheckCircle, Loader2, XCircle, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ParsedMessage {
  steps: { label: string; active: boolean; error?: boolean }[];
  insight: string;
  suggestion?: { text: string; widgetType: string };
}

function parseMessageContent(content: string): ParsedMessage {
  const stepsList = [
    { key: "Analyzing intent", label: "Analyzing Intent" },
    { key: "Querying Neo4j", label: "Querying Schema Graph" },
    { key: "Retrieving semantic", label: "Retrieving Semantic Context" },
    { key: "Creating execution plan", label: "Creating Execution Plan" },
    { key: "Executing SQL", label: "Executing SQL & Self-Repair" },
    { key: "Generating insights", label: "Generating Final Insights" },
    { key: "Routing to conversational agent", label: "Routing to Conversational Agent" }
  ];

  const steps: ParsedMessage["steps"] = [];
  let remainingText = content;

  // 1. Detect which steps have appeared in the stream
  stepsList.forEach((stepItem) => {
    if (content.includes(stepItem.key)) {
      const isError = content.includes("Error during pipeline");
      steps.push({
        label: stepItem.label,
        active: false,
        error: isError && steps.length === stepsList.filter(s => content.includes(s.key)).length - 1
      });
      
      const regex = new RegExp(`.*${stepItem.key}[^\\n]*\\n*`, 'g');
      remainingText = remainingText.replace(regex, '');
    }
  });

  // 2. Extract Dashboard Suggestion
  let suggestion: ParsedMessage["suggestion"] | undefined;
  const suggestionRegex = />\s*\*\*Dashboard Suggestion\*\*:\s*([^(]+)\s*\(Widget:\s*([^)]+)\)/i;
  const match = remainingText.match(suggestionRegex);
  if (match) {
    suggestion = {
      text: match[1].trim(),
      widgetType: match[2].trim()
    };
    remainingText = remainingText.replace(suggestionRegex, '').trim();
  }

  const insight = remainingText.trim();

  // If currently streaming and the latest step is listed, mark it as active
  if (steps.length > 0) {
    const hasInsight = insight.length > 0 && !insight.includes("Error during pipeline");
    if (!hasInsight) {
      steps[steps.length - 1].active = true;
    }
  }

  return { steps, insight, suggestion };
}

function getMessageText(m: any): string {
  if (typeof m.content === 'string' && m.content) {
    return m.content;
  }
  if (Array.isArray(m.parts)) {
    const textPart = m.parts.find((p: any) => p.type === 'text');
    if (textPart) return textPart.text;
  }
  if (m.text) {
    return m.text;
  }
  return '';
}

function renderMarkdownText(text: string) {
  if (!text) return null;

  // Split by double newlines to separate sections
  const blocks = text.split(/\n\n+/);

  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Check if it is a list of items
        if (trimmed.startsWith('- ') || trimmed.includes('\n- ') || trimmed.includes('\n - ')) {
          const items = trimmed
            .split(/\n\s*-\s+/)
            .map(item => item.replace(/^- /, '').trim())
            .filter(Boolean);
          return (
            <ul key={bIdx} className="space-y-2.5 pl-2 mt-1">
              {items.map((item, iIdx) => {
                // Check if item contains bold title
                const boldMatch = item.match(/^\*\*(.*?)(?::\*\*|\*\*:\s*)([\s\S]*)/);
                if (boldMatch) {
                  return (
                    <li key={iIdx} className="flex items-start gap-2.5 text-xs md:text-sm text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EB0A1E] mt-2 shrink-0" />
                      <div>
                        <strong className="text-white font-semibold">{boldMatch[1]}:</strong>
                        <span className="ml-1.5 text-zinc-300">{boldMatch[2]}</span>
                      </div>
                    </li>
                  );
                }
                return (
                  <li key={iIdx} className="flex items-start gap-2.5 text-xs md:text-sm text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EB0A1E] mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Check if block starts with **Title:** or ### Title
        const headingMatch = trimmed.match(/^(?:\#\#\#|\*\*)\s*(.*?)\s*(?::\*\*|\*\*:\s*|\#\#\#):?$/);
        const inlineHeadingMatch = trimmed.match(/^\*\*(.*?)(?::\*\*|\*\*:\s*\n?)([\s\S]*)/);

        if (headingMatch) {
          return (
            <h3 key={bIdx} className="text-xs md:text-sm font-bold text-white uppercase tracking-wider border-l-2 border-[#EB0A1E] pl-2 mt-2">
              {headingMatch[1]}
            </h3>
          );
        }

        if (inlineHeadingMatch && inlineHeadingMatch[1].length < 60 && !inlineHeadingMatch[2].includes('\n')) {
          // A single line like "**Top-Performing Showroom Location:** Description..."
          return (
            <div key={bIdx} className="bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-800/40 flex flex-col gap-1 mt-1">
              <strong className="text-[10px] uppercase tracking-wide text-zinc-400 font-bold">{inlineHeadingMatch[1]}</strong>
              <p className="text-xs md:text-sm text-zinc-200 leading-relaxed">{inlineHeadingMatch[2]}</p>
            </div>
          );
        }
        
        if (inlineHeadingMatch && inlineHeadingMatch[1].length < 60) {
          // Title followed by multi-line text
          return (
            <div key={bIdx} className="flex flex-col gap-1.5 mt-2">
              <h3 className="text-[10px] md:text-xs uppercase tracking-wider text-zinc-400 font-bold border-l-2 border-[#EB0A1E] pl-2">
                {inlineHeadingMatch[1]}
              </h3>
              <div className="text-xs md:text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap pl-2">
                {inlineHeadingMatch[2]}
              </div>
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={bIdx} className="text-xs md:text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}



export default function ChatPage() {
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/agent',
    }),
  });

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [pinningId, setPinningId] = useState<string | null>(null);
  const isLoading = status !== 'ready';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Restore chat messages from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('trust-toyota-chat-messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMessages(parsed.slice(-20)); // Limit to last 20 messages
        }
      } catch (e) {
        console.error("Failed to parse saved chat messages", e);
      }
    }
  }, [setMessages]);

  // Persist chat messages to localStorage when they change
  useEffect(() => {
    if (messages && messages.length > 0) {
      localStorage.setItem('trust-toyota-chat-messages', JSON.stringify(messages));
    }
  }, [messages]);

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('trust-toyota-chat-messages');
  };

  const handlePinWidget = async (config: any) => {
    if (!config) return;
    setPinningId(config.title);
    try {
      const res = await fetch('/api/dashboard/widgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: config.title,
          query: config.query,
          type: config.type,
          xKey: config.xKey,
          yKey: config.yKey
        })
      });
      if (res.ok) {
        alert(`Successfully pinned "${config.title}" to dashboard!`);
      } else {
        alert("Failed to pin widget.");
      }
    } catch (err) {
      console.error(err);
      alert("Error pinning widget.");
    } finally {
      setPinningId(null);
    }
  };

  useEffect(() => {
    // Initialize Web Speech API
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Helper to render raw SQL output as a table or nice format
  const renderSqlResult = (output: any) => {
    if (!output || typeof output !== 'object') return null;

    // If it's an array of results
    if (Array.isArray(output) && output.length > 0) {
      const firstRow = output[0];
      const columns = Object.keys(firstRow);

      // If it's a single value (like COUNT(*))
      if (output.length === 1 && columns.length === 1) {
        return (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-zinc-400">{columns[0]}:</span>
            <span className="text-white font-semibold text-lg">{firstRow[columns[0]]}</span>
          </div>
        );
      }

      // Otherwise render a sleek table
      return (
        <div className="mt-3 overflow-x-auto border border-zinc-800 rounded-lg">
          <table className="w-full text-left text-xs md:text-sm text-zinc-300">
            <thead className="text-[10px] md:text-xs uppercase bg-zinc-900 border-b border-zinc-800">
              <tr>
                {columns.map(col => (
                  <th key={col} className="px-3 py-1.5 md:px-4 md:py-2 font-medium whitespace-nowrap">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {output.map((row, idx) => (
                <tr key={idx} className="border-b border-zinc-800/50 last:border-0 bg-zinc-950/50">
                  {columns.map(col => (
                    <td key={col} className="px-3 py-1.5 md:px-4 md:py-2 whitespace-nowrap">{String(row[col])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // Fallback for objects
    return (
      <div className="mt-2 text-zinc-300">
        <pre className="text-xs overflow-x-auto">{JSON.stringify(output, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-zinc-100">
      {/* Header */}
      <div className="border-b border-zinc-800 p-4 md:p-6 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center shrink-0">
            <Bot className="text-[#EB0A1E] w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base md:text-xl font-semibold truncate">Trust Toyota Copilot</h1>
            <p className="text-xs md:text-sm text-zinc-400 truncate hidden sm:block">Ask anything about deliveries, sales, and performance.</p>
            <p className="text-[10px] text-zinc-500 truncate sm:hidden">dealership analytics assistant</p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5"
            title="Delete Chat History"
          >
            <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
            Clear Chat
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4 p-4 text-center">
            <Bot className="w-12 h-12 text-zinc-700" />
            <p className="text-sm">How can I help you with dealership analytics today?</p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex gap-2 md:gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                <Bot className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#EB0A1E]" />
              </div>
            )}

            <div className={`px-3 py-2 md:px-4 md:py-3 max-w-[92%] sm:max-w-[85%] md:max-w-[80%] rounded-2xl ${m.role === 'user'
              ? 'bg-[#EB0A1E] text-white rounded-br-none'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none'
              }`}>

              {m.role === 'user' ? (
                <p className="whitespace-pre-wrap text-xs md:text-sm leading-relaxed">{getMessageText(m)}</p>
              ) : (() => {
                const parsed = parseMessageContent(getMessageText(m));

                return (
                  <div className="flex flex-col gap-3">
                    {/* Pipeline Operations Stepper */}
                    {parsed.steps.length > 0 && (
                      <div className="border-b border-zinc-800/80 pb-3 mb-1 flex flex-col gap-2">
                        <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                          Pipeline Operations
                        </div>
                        <div className="grid grid-cols-1 gap-1.5">
                          {parsed.steps.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-[10px] md:text-xs">
                              {step.error ? (
                                <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                              ) : step.active ? (
                                <Loader2 className="w-3.5 h-3.5 text-[#EB0A1E] animate-spin shrink-0" />
                              ) : (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              )}
                              <span className={step.active ? "text-zinc-200 font-medium animate-pulse" : "text-zinc-400"}>
                                {step.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Main response text */}
                     {parsed.insight ? (
                      <div className="mt-1">
                        {renderMarkdownText(parsed.insight)}
                      </div>
                    ) : parsed.steps.length > 0 && (
                      <div className="text-xs text-zinc-500 italic flex items-center gap-1.5 py-1">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Generating response...
                      </div>
                    )}

                    {/* Dashboard Suggestion card */}
                    {parsed.suggestion && (
                      <div className="mt-2 p-3 bg-zinc-950/80 border border-zinc-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-start sm:items-center gap-2.5">
                          <div className="p-1.5 bg-[#EB0A1E]/10 rounded-lg text-[#EB0A1E] shrink-0 mt-0.5 sm:mt-0">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-white">Suggested Chart</h4>
                            <p className="text-[10px] text-zinc-400 mt-0.5 break-words">{parsed.suggestion.text}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-400">
                            {parsed.suggestion.widgetType}
                          </span>
                          <button className="px-2.5 py-1 bg-[#EB0A1E] text-white text-[10px] font-semibold rounded-lg hover:bg-red-700 transition-colors">
                            Pin
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Render tool invocations (charts, tables etc) if any exist */}
                    {m.parts && m.parts.length > 0 && (
                      <div className="mt-2 flex flex-col gap-2">
                        {m.parts.map((part: any, i: number) => {
                          if (part.type.startsWith('tool-') || part.type === 'tool-invocation') {
                            const toolName = part.toolName || (part.type.startsWith('tool-') ? part.type.replace('tool-', '') : part.toolInvocation?.toolName);
                            const state = part.state || part.toolInvocation?.state || 'output-available';
                            const output = part.output || part.result || part.toolInvocation?.output || part.toolInvocation?.result;

                            if (state === 'output-available' || state === 'result') {
                              if (toolName === 'getChartTool') {
                                const config = output?.chartConfig || output;
                                return (
                                  <div key={i} className="mt-3 w-full min-w-0 md:min-w-[500px] bg-zinc-950 p-2 md:p-4 border border-zinc-800 rounded-xl relative group overflow-hidden">
                                    {config?.query && (
                                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button
                                          onClick={() => handlePinWidget(config)}
                                          disabled={pinningId === config.title}
                                          className="px-2.5 py-1 bg-[#EB0A1E] hover:bg-red-700 text-white text-[10px] font-semibold rounded-lg transition-colors disabled:opacity-50"
                                        >
                                          {pinningId === config.title ? 'Pinning...' : 'Pin to Dashboard'}
                                        </button>
                                      </div>
                                    )}
                                    <ChartRender config={config} />
                                  </div>
                                );
                              }
                              
                              if (toolName === 'executeSql') {
                                return (
                                  <div key={i} className="mt-2 flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-zinc-400 text-xs">
                                      <Database className="w-3 h-3" />
                                      <span>Data retrieved from database</span>
                                    </div>
                                    {renderSqlResult(output)}
                                  </div>
                                );
                              }
                              
                              if (toolName === 'predictTrend') {
                                if (output?.error) {
                                  return (
                                    <div key={i} className="mt-2 text-red-400 text-sm p-3 bg-red-950/20 border border-red-900/50 rounded-lg">
                                      Failed to predict trend: {output.error}
                                    </div>
                                  );
                                }
                                return (
                                  <div key={i} className="mt-3 flex flex-col gap-2 p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                                    <div className="flex items-center gap-2 text-zinc-300 font-medium pb-2 border-b border-zinc-800">
                                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                                      Trend Forecast
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-2">
                                      <div className="text-sm text-zinc-400">Slope: <span className="text-white">{output.trend_analysis?.slope}</span></div>
                                      <div className="text-sm text-zinc-400">Intercept: <span className="text-white">{output.trend_analysis?.intercept}</span></div>
                                    </div>
                                    
                                    <div className="mt-3 grid grid-cols-3 gap-2">
                                      {output.predictions?.map((pred: any, idx: number) => (
                                        <div key={idx} className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg flex flex-col items-center">
                                          <span className="text-xs text-zinc-500 uppercase font-semibold">Period {pred.period_offset}</span>
                                          <span className="text-xl text-white font-bold mt-1">{pred.predicted_value}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div key={i} className="mt-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-zinc-400 font-mono">
                                  <span className="flex flex-col gap-1">
                                    <span className="text-green-500">✓ Completed {toolName}</span>
                                  </span>
                                </div>
                              );
                            }
                          }
                          return null;
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-zinc-300" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-[#EB0A1E]" />
            </div>
            <div className="px-4 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-2xl rounded-bl-none flex items-center gap-2">
              <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-zinc-800 bg-[#09090b] shrink-0">
        <form onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput('');
          }
        }} className="max-w-4xl mx-auto relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about deliveries, locations, sales officers..."
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-full pl-4 pr-20 py-2.5 md:pl-5 md:pr-24 md:py-3 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-[#EB0A1E]"
              disabled={isLoading}
            />

            <div className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 md:gap-1">
              <button
                type="button"
                onClick={toggleListening}
                disabled={isLoading}
                className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-colors ${isListening
                    ? 'bg-red-500/20 text-red-500 animate-pulse'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                  }`}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <Mic className="w-3.5 h-3.5 md:w-4 md:h-4" /> : <Mic className="w-3.5 h-3.5 md:w-4 md:h-4" />}
              </button>

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-7 h-7 md:w-8 md:h-8 bg-[#EB0A1E] text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
              >
                <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
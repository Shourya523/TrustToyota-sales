"use client";

import { ChartRender } from '@/app/components/ChartRendered';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Send, Bot, User, Database, Mic, MicOff, TrendingUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/agent',
    }),
  });

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const isLoading = status !== 'ready';
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

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
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="text-xs uppercase bg-zinc-900 border-b border-zinc-800">
              <tr>
                {columns.map(col => (
                  <th key={col} className="px-4 py-2 font-medium">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {output.map((row, idx) => (
                <tr key={idx} className="border-b border-zinc-800/50 last:border-0 bg-zinc-950/50">
                  {columns.map(col => (
                    <td key={col} className="px-4 py-2">{String(row[col])}</td>
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
      <div className="border-b border-zinc-800 p-6 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center">
          <Bot className="text-[#EB0A1E] w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-semibold">Trust Toyota Copilot</h1>
          <p className="text-sm text-zinc-400">Ask anything about deliveries, sales, and performance.</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
            <Bot className="w-12 h-12 text-zinc-700" />
            <p>How can I help you with dealership analytics today?</p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-[#EB0A1E]" />
              </div>
            )}

            <div className={`px-4 py-3 max-w-[80%] rounded-2xl ${m.role === 'user'
              ? 'bg-[#EB0A1E] text-white rounded-br-none'
              : 'bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-bl-none'
              }`}>
              
              {/* ── Render parts ──────────────────────────────── */}
              {m.parts?.map((part: any, i: number) => {
                // Plain text
                if (part.type === 'text') {
                  return (
                    <p key={i} className="whitespace-pre-wrap text-sm leading-relaxed">
                      {part.text}
                    </p>
                  );
                }

                // Tool call
                if (part.type.startsWith('tool-') || part.type === 'tool-invocation') {
                  const toolName = part.toolName || (part.type.startsWith('tool-') ? part.type.replace('tool-', '') : part.toolInvocation?.toolName);
                  const state = part.state || part.toolInvocation?.state || 'output-available';
                  const output = part.output || part.result || part.toolInvocation?.output || part.toolInvocation?.result;
                  
                  if (state !== 'output-available' && state !== 'output-error' && state !== 'result') {
                    return (
                      <div key={i} className="mt-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-xs text-zinc-400 font-mono">
                        <span className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#EB0A1E] rounded-full animate-pulse" />
                          Running query...
                        </span>
                      </div>
                    );
                  }

                  if (state === 'output-available' || state === 'result') {
                    if (toolName === 'getChartTool') {
                      const config = output?.chartConfig || output;
                      return (
                        <div key={i} className="mt-4 w-full min-w-[500px]">
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
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-full pl-5 pr-24 py-3 focus:outline-none focus:ring-1 focus:ring-[#EB0A1E]"
              disabled={isLoading}
            />
            
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={toggleListening}
                disabled={isLoading}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isListening 
                    ? 'bg-red-500/20 text-red-500 animate-pulse' 
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="w-8 h-8 bg-[#EB0A1E] text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import { Loader2, FileText, TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react";
import { FabASKai } from "@/app/components/fabASKai";

interface Forecast {
    model: string;
    expected: number;
    history: { month: string; count: number }[];
}

interface PerformanceSummary {
    monthName: string;
    increase: number;
    drivenBy: string[];
    areasOfConcern: string[];
}

interface ReportData {
    performanceSummary: PerformanceSummary;
    forecasts: Forecast[];
}

export default function ReportsPage() {
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/reports")
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch reports");
                return res.json();
            })
            .then(data => {
                setData(data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading || !data) {
        return (
            <div className="flex h-full min-h-screen items-center justify-center bg-[#09090b]">
                <Loader2 className="h-6 w-6 animate-spin text-[#EB0A1E]" />
                <span className="ml-3 text-sm font-medium text-zinc-400">Compiling executive reports...</span>
            </div>
        );
    }

    const { performanceSummary, forecasts } = data;

    return (
        <div className="p-8 pb-32 min-h-screen bg-[#09090b] text-zinc-100 flex flex-col xl:flex-row gap-8">

            <div className="flex-1 flex flex-col gap-6">
                <header className="mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                            <FileText className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Executive Reports</h1>
                            <p className="text-sm text-zinc-400 mt-1">Data-driven performance summary and forecasting.</p>
                        </div>
                    </div>
                </header>

                {/* MONTH PERFORMANCE */}
                <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/60 p-8">
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-zinc-200 tracking-wide">
                            {performanceSummary.monthName} Performance Summary
                        </h2>

                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-zinc-950/50 border-zinc-800">
                            {performanceSummary.increase >= 0 ? (
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                            ) : (
                                <TrendingDown className="w-5 h-5 text-red-400" />
                            )}
                            <span className="text-base font-semibold text-zinc-300">
                                Deliveries {performanceSummary.increase >= 0 ? 'increased' : 'decreased'} by
                                <span className={performanceSummary.increase >= 0 ? "text-emerald-400 ml-1.5" : "text-red-400 ml-1.5"}>
                                    {Math.abs(performanceSummary.increase)}%
                                </span>
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Growth Drivers */}
                        <div className="bg-zinc-950/50 p-6 rounded-xl border border-emerald-900/30">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-500 mb-4 flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                Growth Driven By
                            </h3>
                            <ul className="space-y-3">
                                {performanceSummary.drivenBy.map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-zinc-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <span className="font-medium text-base">{item}</span>
                                    </li>
                                ))}
                                {performanceSummary.drivenBy.length === 0 && (
                                    <span className="text-sm text-zinc-500">No positive growth drivers found this month.</span>
                                )}
                            </ul>
                        </div>

                        {/* Areas of Concern */}
                        <div className="bg-zinc-950/50 p-6 rounded-xl border border-red-900/30">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-red-500 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Areas of Concern
                            </h3>
                            <ul className="space-y-3">
                                {performanceSummary.areasOfConcern.map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-zinc-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                        <span className="font-medium text-base">{item}</span>
                                    </li>
                                ))}
                                {performanceSummary.areasOfConcern.length === 0 && (
                                    <span className="text-sm text-zinc-500">No areas of concern found. Everything is growing!</span>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* EXPECTED NEXT MONTH (SIDEBAR ON DESKTOP) */}
            <div className="w-full xl:w-[400px] flex flex-col gap-6 shrink-0 mt-2">
                <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/60 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-zinc-200 tracking-wide">
                                Expected Next Month
                            </h2>
                            <p className="text-xs text-zinc-500 mt-1">3-Month trailing average forecast</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {forecasts.map((model) => (
                            <div key={model.model} className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50 flex items-center justify-between group">
                                <div className="flex-1">
                                    <span className="text-sm font-semibold text-zinc-300 block mb-1">{model.model}</span>

                                    {/* Mini Sparkline Chart */}
                                    <div className="h-6 w-24">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={model.history}>
                                                <defs>
                                                    <linearGradient id={`color-${model.model}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5} />
                                                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
                                                <Area type="monotone" dataKey="count" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill={`url(#color-${model.model})`} isAnimationActive={false} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-zinc-100">{model.expected}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

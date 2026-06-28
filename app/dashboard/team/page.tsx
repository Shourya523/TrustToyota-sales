"use client";

import { useEffect, useState } from "react";
import { Users, Loader2, ArrowUpRight, ArrowDownRight, Trophy, CarFront, MapPin, Search } from "lucide-react";
import { FabASKai } from "@/app/components/fabASKai";

interface TeamMember {
    name: string;
    deliveries: number;
    rank: number;
    topModels: string[];
    topLocation: string;
    avgMonthly: number;
    growthPercent: number | null;
    comparisonMonth?: string;
}

export default function TeamPage() {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/team")
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch team data");
                return res.json();
            })
            .then(data => {
                setTeam(data.team);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const filteredTeam = team.filter(so => so.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center bg-[#09090b]">
                <Loader2 className="h-6 w-6 animate-spin text-[#EB0A1E]" />
                <span className="ml-3 text-sm font-medium text-zinc-400">Loading team performance...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-full items-center justify-center p-6 bg-[#09090b]">
                <div className="rounded-lg bg-red-950/30 p-4 text-red-400 border border-red-900/50 max-w-md w-full">
                    <p className="font-semibold text-sm">Error loading team data</p>
                    <p className="text-xs mt-1 opacity-80">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 pb-32 min-h-screen bg-[#09090b]">
            <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EB0A1E]/10 flex items-center justify-center border border-[#EB0A1E]/20">
                        <Users className="w-5 h-5 text-[#EB0A1E]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Team Performance</h1>
                        <p className="text-sm text-zinc-400 mt-1">Directory of Sales Officers and their core metrics.</p>
                    </div>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search team..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeam.map((so) => (
                    <div key={so.name} className="bg-zinc-900/50 rounded-2xl border border-zinc-800/60 p-6 flex flex-col relative overflow-hidden group hover:border-zinc-700 transition-colors">
                        {so.rank === 1 && (
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#EB0A1E]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                        )}

                        <div className="flex items-start justify-between mb-6 relative z-10">
                            <div>
                                <h3 className="text-xl font-bold text-zinc-100">{so.name}</h3>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Rank</span>
                                    <span className={`text-sm font-bold ${so.rank <= 3 ? 'text-amber-400' : 'text-zinc-300'}`}>
                                        #{so.rank}
                                    </span>
                                    {so.rank === 1 && <Trophy className="w-4 h-4 text-amber-400 ml-1" />}
                                </div>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg font-bold text-zinc-400">
                                {so.name.charAt(0).toUpperCase()}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-4 mb-6 relative z-10">
                            <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50 min-h-[96px] flex flex-col justify-center">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Deliveries</p>
                                <p className="text-2xl font-bold text-zinc-100">{so.deliveries}</p>
                            </div>
                            <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50 flex flex-col justify-center min-h-[96px]">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1.5">Avg / Month</p>
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-lg font-bold text-zinc-200">{so.avgMonthly}</span>
                                        <span className="text-xs font-medium text-zinc-500">vehicles</span>
                                    </div>
                                    {so.growthPercent !== undefined && so.growthPercent !== null && (
                                        <div className="flex items-center flex-wrap gap-1.5 mt-0.5">
                                            <div className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                                so.growthPercent >= 0 
                                                    ? 'text-emerald-400 bg-emerald-500/10' 
                                                    : 'text-rose-400 bg-rose-500/10'
                                            }`}>
                                                {so.growthPercent >= 0 ? (
                                                    <ArrowUpRight className="w-3 h-3 shrink-0" />
                                                ) : (
                                                    <ArrowDownRight className="w-3 h-3 shrink-0" />
                                                )}
                                                <span>
                                                    {so.growthPercent >= 0 ? '+' : ''}{so.growthPercent.toFixed(0)}%
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-zinc-500 font-semibold whitespace-nowrap">
                                                {so.comparisonMonth ? `${so.comparisonMonth} vs avg` : "vs avg"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 relative z-10 pt-4 border-t border-zinc-800/50">
                            <div>
                                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                                    <CarFront className="w-4 h-4" />
                                    <span className="text-sm">Top Models</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {so.topModels?.map(model => (
                                        <span key={model} className="px-2 py-1 text-xs font-medium bg-zinc-800 text-zinc-300 rounded-md border border-zinc-700">
                                            {model}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm">Top Location</span>
                                </div>
                                <span className="text-sm font-medium text-zinc-200">{so.topLocation}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredTeam.length === 0 && !loading && (
                <div className="py-12 text-center text-zinc-500">
                    No sales officers found matching "{searchQuery}"
                </div>
            )}

        </div>
    );
}

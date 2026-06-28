"use client";

import { useEffect, useState } from "react";
import { Loader2, ArrowUpRight, ArrowDownRight, Trophy, CarFront, MapPin, Users } from "lucide-react";
import { FabASKai } from "@/app/components/fabASKai";

interface Showroom {
    name: string;
    deliveries: number;
    rank: number;
    topModels: string[];
    topSO: string;
    avgMonthly: number;
    growthPercent: number | null;
    comparisonMonth?: string;
}

export default function ShowroomsPage() {
    const [showrooms, setShowrooms] = useState<Showroom[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/showrooms")
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch showroom data");
                return res.json();
            })
            .then(data => {
                setShowrooms(data.showrooms);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center bg-[#09090b]">
                <Loader2 className="h-6 w-6 animate-spin text-[#EB0A1E]" />
                <span className="ml-3 text-sm font-medium text-zinc-400">Loading showroom analytics...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-full items-center justify-center p-6 bg-[#09090b]">
                <div className="rounded-lg bg-red-950/30 p-4 text-red-400 border border-red-900/50 max-w-md w-full">
                    <p className="font-semibold text-sm">Error loading showroom data</p>
                    <p className="text-xs mt-1 opacity-80">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 pb-32 min-h-screen bg-[#09090b]">
            <header className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EB0A1E]/10 flex items-center justify-center border border-[#EB0A1E]/20">
                        <MapPin className="w-5 h-5 text-[#EB0A1E]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Showrooms</h1>
                        <p className="text-sm text-zinc-400 mt-1">Location-wise performance and metrics.</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {showrooms.map((room) => (
                    <div key={room.name} className="bg-zinc-900/50 rounded-2xl border border-zinc-800/60 p-6 flex flex-col relative overflow-hidden group hover:border-zinc-700 transition-colors">
                        {room.rank === 1 && (
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#EB0A1E]/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                        )}

                        <div className="flex items-start justify-between mb-6 relative z-10">
                            <div>
                                <h3 className="text-xl font-bold text-zinc-100">{room.name}</h3>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Rank</span>
                                    <span className={`text-sm font-bold ${room.rank <= 3 ? 'text-amber-400' : 'text-zinc-300'}`}>
                                        #{room.rank}
                                    </span>
                                    {room.rank === 1 && <Trophy className="w-4 h-4 text-amber-400 ml-1" />}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-4 mb-6 relative z-10">
                            <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50 min-h-[96px] flex flex-col justify-center">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Deliveries</p>
                                <p className="text-2xl font-bold text-zinc-100">{room.deliveries}</p>
                            </div>
                            <div className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800/50 flex flex-col justify-center min-h-[96px]">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1.5">Avg / Month</p>
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-lg font-bold text-zinc-200">{room.avgMonthly}</span>
                                        <span className="text-xs font-medium text-zinc-500">vehicles</span>
                                    </div>
                                    {room.growthPercent !== undefined && room.growthPercent !== null && (
                                        <div className="flex items-center flex-wrap gap-1.5 mt-0.5">
                                            <div className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                                room.growthPercent >= 0 
                                                    ? 'text-emerald-400 bg-emerald-500/10' 
                                                    : 'text-rose-400 bg-rose-500/10'
                                            }`}>
                                                {room.growthPercent >= 0 ? (
                                                    <ArrowUpRight className="w-3 h-3 shrink-0" />
                                                ) : (
                                                    <ArrowDownRight className="w-3 h-3 shrink-0" />
                                                )}
                                                <span>
                                                    {room.growthPercent >= 0 ? '+' : ''}{room.growthPercent.toFixed(0)}%
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-zinc-500 font-semibold whitespace-nowrap">
                                                {room.comparisonMonth ? `${room.comparisonMonth} vs avg` : "vs avg"}
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
                                    {room.topModels?.map(model => (
                                        <span key={model} className="px-2 py-1 text-xs font-medium bg-zinc-800 text-zinc-300 rounded-md border border-zinc-700">
                                            {model}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <Users className="w-4 h-4" />
                                    <span className="text-sm">Top Sales Officer</span>
                                </div>
                                <span className="text-sm font-medium text-zinc-200">{room.topSO}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

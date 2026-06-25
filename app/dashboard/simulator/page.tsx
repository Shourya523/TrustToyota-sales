"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Loader2, Settings2, ArrowUpRight, ArrowDownRight, Lightbulb, UserMinus, TrendingUp, TrendingDown, Wand2, Activity } from "lucide-react";
import { FabASKai } from "@/app/components/fabASKai";

interface DashboardData {
    kpis: { totalDeliveries: number };
    monthlySales: { month: string; sales: number }[];
    modelDistribution: { model: string; count: number }[];
    locations: { location: string; deliveries: number }[];
    salesOfficers: { sales_officer: string; deliveries: number }[];
}

export default function Simulator() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const [activeScenario, setActiveScenario] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/dashboard")
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            });
    }, []);

    if (loading || !data) {
        return (
            <div className="flex h-full min-h-screen items-center justify-center bg-[#09090b]">
                <Loader2 className="h-6 w-6 animate-spin text-[#EB0A1E]" />
            </div>
        );
    }

    const total = data.kpis.totalDeliveries || 1;
    const rahulCount = data.salesOfficers.find(s => s.sales_officer === 'Rahul')?.deliveries || 0;
    const innovaCount = data.modelDistribution.find(m => m.model === 'Innova')?.count || 0;
    const kuanwalaCount = data.locations.find(l => l.location === 'Kuanwala')?.deliveries || 0;

    let simulatedTotal = total;
    if (activeScenario === "innova_up") simulatedTotal = total + (innovaCount * 0.2);
    if (activeScenario === "kuanwala_down") simulatedTotal = total - (kuanwalaCount * 0.1);
    if (activeScenario === "rahul_leaves") simulatedTotal = total - rahulCount;

    return (
        <div className="p-8 pb-32 min-h-screen bg-[#09090b] text-zinc-100">
            <header className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Activity className="w-6 h-6 text-indigo-500" />
                    Enterprise Impact Simulator
                </h1>
                <p className="text-sm text-zinc-400 mt-1">Run fractional arithmetic on live data to project business outcomes.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <button onClick={() => setActiveScenario("innova_up")} className={`p-6 rounded-xl border text-left transition-all ${activeScenario === "innova_up" ? 'bg-indigo-900/40 border-indigo-500' : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800'}`}>
                    <TrendingUp className="w-5 h-5 text-emerald-400 mb-3" />
                    <h3 className="font-semibold text-zinc-200">What if Innova demand grows 20%?</h3>
                </button>
                <button onClick={() => setActiveScenario("kuanwala_down")} className={`p-6 rounded-xl border text-left transition-all ${activeScenario === "kuanwala_down" ? 'bg-indigo-900/40 border-indigo-500' : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800'}`}>
                    <TrendingDown className="w-5 h-5 text-red-400 mb-3" />
                    <h3 className="font-semibold text-zinc-200">What if Kuanwala drops by 10%?</h3>
                </button>
                <button onClick={() => setActiveScenario("rahul_leaves")} className={`p-6 rounded-xl border text-left transition-all ${activeScenario === "rahul_leaves" ? 'bg-indigo-900/40 border-indigo-500' : 'bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800'}`}>
                    <UserMinus className="w-5 h-5 text-amber-400 mb-3" />
                    <h3 className="font-semibold text-zinc-200">What if Rahul leaves?</h3>
                </button>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8">
                <h2 className="text-lg font-semibold text-zinc-300 mb-6">Simulation Result</h2>
                <div className="flex items-end gap-4">
                    <div>
                        <p className="text-sm text-zinc-500 mb-1">Projected Total Deliveries</p>
                        <p className="text-5xl font-bold text-zinc-100">{Math.round(simulatedTotal)}</p>
                    </div>
                    {activeScenario && (
                        <div className="pb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${simulatedTotal > total ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                {simulatedTotal > total ? '+' : ''}{Math.round(simulatedTotal - total)} units
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <FabASKai />
        </div>
    );
}

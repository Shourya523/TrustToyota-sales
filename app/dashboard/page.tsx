"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Loader2, TrendingUp, MapPin, Users, CarFront, Palette, Tag, ArrowUpRight, Filter, Search, Lightbulb } from "lucide-react";
import { FabASKai } from "../components/fabASKai";
import { useFilters } from "../components/FilterContext";

interface DashboardData {
  kpis: {
    totalDeliveries: number;
  };
  monthlySales: { month: string; sales: number }[];
  modelDistribution: { model: string; count: number }[];
  topModels: { model: string; sold: number }[];
  locations: { location: string; deliveries: number }[];
  salesOfficers: { sales_officer: string; deliveries: number }[];
  colours: { colour: string; count: number }[];
  remarks: { remark: string; count: number }[];
  insights: string[];
}

const TOYOTA_RED = "#EB0A1E";
const COLORS = [
  TOYOTA_RED, "#475569", "#94a3b8", "#cbd5e1", "#1e293b",
  "#f8fafc", "#334155", "#64748b", "#e2e8f0", "#0f172a",
];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { selectedLocation, setSelectedLocation, selectedModel, setSelectedModel, selectedMonth, setSelectedMonth } = useFilters();

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#EB0A1E]" />
        <span className="ml-3 text-sm font-medium text-zinc-400">Loading metrics...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="rounded-lg bg-red-950/30 p-4 text-red-400 border border-red-900/50 max-w-md w-full">
          <p className="font-semibold text-sm">Error loading dashboard</p>
          <p className="text-xs mt-1 opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  const tooltipStyle = {
    backgroundColor: '#18181b',
    borderColor: '#27272a',
    color: '#f4f4f5',
    borderRadius: '6px',
    fontSize: '12px',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)',
  };

  // Ensure unique list for filters
  const locationList = Array.from(new Set(data.locations.map(l => l.location)));
  const modelList = Array.from(new Set(data.topModels.map(m => m.model)));
  const monthList = Array.from(new Set(data.monthlySales.map(m => m.month)));

  return (
    <div className="p-8 pb-32">
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Dealer Intelligence Platform</h1>
          <p className="text-sm text-zinc-400 mt-1">Real-time delivery and sales analytics.</p>
        </div>

        {/* Global Filters */}
        <div className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
          <Filter className="w-4 h-4 text-zinc-500 ml-2" />
          <select
            className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1.5 rounded outline-none border-none cursor-pointer"
            value={selectedMonth || ""}
            onChange={e => setSelectedMonth(e.target.value || null)}
          >
            <option value="">All Months</option>
            {monthList.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select
            className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1.5 rounded outline-none border-none cursor-pointer"
            value={selectedLocation || ""}
            onChange={e => setSelectedLocation(e.target.value || null)}
          >
            <option value="">All Locations</option>
            {locationList.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select
            className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1.5 rounded outline-none border-none cursor-pointer"
            value={selectedModel || ""}
            onChange={e => setSelectedModel(e.target.value || null)}
          >
            <option value="">All Models</option>
            {modelList.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </header>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Deliveries */}
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-6 flex items-start justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#EB0A1E]/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-[#EB0A1E]/10" />
              <div className="relative z-10">
                <p className="text-sm font-medium text-zinc-400 mb-1">Total Deliveries</p>
                <h3 className="text-3xl font-bold text-zinc-100 mt-1">{data.kpis.totalDeliveries}</h3>
              </div>
              <div className="h-10 w-10 bg-zinc-800/80 rounded-lg flex items-center justify-center text-zinc-300 border border-zinc-700/50 relative z-10">
                <CarFront size={18} />
              </div>
            </div>

            {/* Top Model */}
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-6 flex items-start justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-500/10" />
              <div className="relative z-10">
                <p className="text-sm font-medium text-zinc-400 mb-1">Top Model</p>
                <h3 className="text-2xl font-bold text-zinc-100 mt-1 truncate max-w-[140px]">{data.topModels[0]?.model || "N/A"}</h3>
                <p className="text-xs text-emerald-400 mt-2 font-medium">{data.topModels[0]?.sold || 0} units</p>
              </div>
              <div className="h-10 w-10 bg-zinc-800/80 rounded-lg flex items-center justify-center text-zinc-300 border border-zinc-700/50 relative z-10">
                <TrendingUp size={18} />
              </div>
            </div>

            {/* Top Location */}
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-6 flex items-start justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/10" />
              <div className="relative z-10">
                <p className="text-sm font-medium text-zinc-400 mb-1">Top Location</p>
                <h3 className="text-2xl font-bold text-zinc-100 mt-1 truncate max-w-[140px]">{data.locations[0]?.location || "N/A"}</h3>
                <p className="text-xs text-blue-400 mt-2 font-medium">{data.locations[0]?.deliveries || 0} deliveries</p>
              </div>
              <div className="h-10 w-10 bg-zinc-800/80 rounded-lg flex items-center justify-center text-zinc-300 border border-zinc-700/50 relative z-10">
                <MapPin size={18} />
              </div>
            </div>

            {/* Top SO */}
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-6 flex items-start justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-purple-500/10" />
              <div className="relative z-10">
                <p className="text-sm font-medium text-zinc-400 mb-1">Top Sales Officer</p>
                <h3 className="text-2xl font-bold text-zinc-100 mt-1 truncate max-w-[140px]">{data.salesOfficers[0]?.sales_officer || "N/A"}</h3>
                <p className="text-xs text-purple-400 mt-2 font-medium">{data.salesOfficers[0]?.deliveries || 0} deliveries</p>
              </div>
              <div className="h-10 w-10 bg-zinc-800/80 rounded-lg flex items-center justify-center text-zinc-300 border border-zinc-700/50 relative z-10">
                <Users size={18} />
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-6 relative overflow-hidden mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">Morning Brief</h3>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-zinc-300">
                {data.insights?.map((insight, idx) => (
                  <li key={idx} className="flex items-start gap-3 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#EB0A1E] mt-1.5 shrink-0" />
                    <span dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  </li>
                ))}
              </ul>
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-5 col-span-1 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mr-3">
                    <TrendingUp className="text-zinc-300" size={16} />
                  </div>
                  <h2 className="text-sm font-semibold text-zinc-200 tracking-wide uppercase">Monthly Trend</h2>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.monthlySales} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#3f3f46', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke={TOYOTA_RED}
                      strokeWidth={3}
                      dot={{ fill: '#09090b', stroke: TOYOTA_RED, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: TOYOTA_RED, stroke: '#09090b', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-5">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mr-3">
                <CarFront className="text-zinc-300" size={16} />
              </div>
              <h2 className="text-sm font-semibold text-zinc-200 tracking-wide uppercase">Model Distribution</h2>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.modelDistribution.slice(0, 10)}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="model"
                    stroke="none"
                  >
                    {data.modelDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#f4f4f5' }} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-5">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mr-3">
                <CarFront className="text-zinc-300" size={16} />
              </div>
              <h2 className="text-sm font-semibold text-zinc-200 tracking-wide uppercase">Top Selling Models</h2>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topModels} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="model" type="category" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} width={90} />
                  <Tooltip cursor={{ fill: '#27272a', opacity: 0.4 }} contentStyle={tooltipStyle} />
                  <Bar dataKey="sold" fill={TOYOTA_RED} radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-5">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mr-3">
                <MapPin className="text-zinc-300" size={16} />
              </div>
              <h2 className="text-sm font-semibold text-zinc-200 tracking-wide uppercase">Top Locations</h2>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.locations} margin={{ top: 5, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="location" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={50} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#27272a', opacity: 0.4 }} contentStyle={tooltipStyle} />
                  <Bar dataKey="deliveries" fill="#71717a" radius={[4, 4, 0, 0]} barSize={24}>
                    {data.locations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? TOYOTA_RED : '#52525b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-5">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mr-3">
                <Users className="text-zinc-300" size={16} />
              </div>
              <h2 className="text-sm font-semibold text-zinc-200 tracking-wide uppercase">Sales Officers</h2>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.salesOfficers} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="sales_officer" type="category" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} width={90} />
                  <Tooltip cursor={{ fill: '#27272a', opacity: 0.4 }} contentStyle={tooltipStyle} />
                  <Bar dataKey="deliveries" fill="#52525b" radius={[0, 4, 4, 0]} barSize={16}>
                    {data.salesOfficers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? TOYOTA_RED : '#52525b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      <FabASKai />
    </div>
  );
}

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
import { Loader2, TrendingUp, MapPin, Users, CarFront, Lightbulb, Filter } from "lucide-react";
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
  budgetSOSales: { sales_officer: string; deliveries: number }[];
  midSOSales: { sales_officer: string; deliveries: number }[];
  luxurySOSales: { sales_officer: string; deliveries: number }[];
  insights: string[];
  filterLists: { months: string[]; locations: string[]; models: string[] };
}

const TOYOTA_RED = "#EB0A1E";

// Diverse color palettes for different charts
const PALETTE_PIE = ["#EB0A1E", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f43f5e", "#84cc16", "#06b6d4"];
const PALETTE_BAR_1 = ["#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#facc15", "#84cc16", "#10b981", "#14b8a6", "#06b6d4", "#3b82f6"];
const PALETTE_BAR_2 = ["#3b82f6", "#06b6d4", "#14b8a6", "#10b981", "#84cc16", "#facc15", "#f97316", "#f43f5e", "#ec4899", "#8b5cf6"];
const PALETTE_SEGMENTS = ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e", "#06b6d4", "#84cc16"];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"budget" | "mid" | "luxury">("budget");

  const { selectedLocation, setSelectedLocation, selectedModel, setSelectedModel, selectedMonth, setSelectedMonth } = useFilters();

  useEffect(() => {
    setLoading(true);

    // Construct query parameters
    const params = new URLSearchParams();
    if (selectedMonth) params.append("month", selectedMonth);
    if (selectedLocation) params.append("location", selectedLocation);
    if (selectedModel) params.append("model", selectedModel);

    const url = `/api/dashboard${params.toString() ? `?${params.toString()}` : ""}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch data");
        return res.json();
      })
      .then((fetchedData) => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedMonth, selectedLocation, selectedModel]);

  if (loading && !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#EB0A1E]" />
        <span className="ml-3 text-sm font-medium text-zinc-400">Loading metrics...</span>
      </div>
    );
  }

  if (error) {
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

  const getSegmentData = () => {
    if (!data) return [];
    let list: { sales_officer: string; deliveries: number }[] = [];
    if (activeTab === "budget") list = data.budgetSOSales;
    else if (activeTab === "mid") list = data.midSOSales;
    else list = data.luxurySOSales;

    if (list.length <= 10) return list;
    const top10 = list.slice(0, 10);
    const others = list.slice(10).reduce((acc, curr) => acc + Number(curr.deliveries), 0);
    return [...top10, { sales_officer: "Others", deliveries: others }];
  };

  return (
    <div className="p-4 md:p-8 pb-32">
      <header className="mb-6 flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Dealer Intelligence Platform</h1>
          <p className="text-sm text-zinc-400 mt-1">Real-time delivery and sales analytics.</p>
        </div>

        {/* Global Filters */}
        <div className="flex flex-wrap items-center gap-2 bg-zinc-900/50 p-2 rounded-lg border border-zinc-800">
          <Filter className="w-4 h-4 text-zinc-500 ml-2 hidden sm:block" />
          <select
            className="bg-zinc-800 text-zinc-300 text-xs px-2 py-2 rounded outline-none border-none cursor-pointer flex-1 sm:flex-none"
            value={selectedMonth || ""}
            onChange={e => setSelectedMonth(e.target.value || null)}
          >
            <option value="">All Months</option>
            {data?.filterLists?.months?.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select
            className="bg-zinc-800 text-zinc-300 text-xs px-2 py-2 rounded outline-none border-none cursor-pointer flex-1 sm:flex-none"
            value={selectedLocation || ""}
            onChange={e => setSelectedLocation(e.target.value || null)}
          >
            <option value="">All Locations</option>
            {data?.filterLists?.locations?.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select
            className="bg-zinc-800 text-zinc-300 text-xs px-2 py-2 rounded outline-none border-none cursor-pointer flex-1 sm:flex-none w-full sm:w-auto"
            value={selectedModel || ""}
            onChange={e => setSelectedModel(e.target.value || null)}
          >
            <option value="">All Models</option>
            {data?.filterLists?.models?.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </header>

      {/* KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-5 flex items-start justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#EB0A1E]/5 rounded-full blur-xl -mr-8 -mt-8 transition-all group-hover:bg-[#EB0A1E]/10" />
          <div className="relative z-10">
            <p className="text-xs md:text-sm font-medium text-zinc-400 mb-1">Total Deliveries</p>
            <h3 className="text-2xl md:text-3xl font-bold text-zinc-100 mt-1">{data?.kpis.totalDeliveries || 0}</h3>
          </div>
          <div className="h-8 w-8 md:h-10 md:w-10 bg-zinc-800/80 rounded-lg flex items-center justify-center text-zinc-300 border border-zinc-700/50 relative z-10">
            <CarFront size={16} />
          </div>
        </div>

        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-5 flex items-start justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl -mr-8 -mt-8 transition-all group-hover:bg-emerald-500/10" />
          <div className="relative z-10">
            <p className="text-xs md:text-sm font-medium text-zinc-400 mb-1">Top Model</p>
            <h3 className="text-xl md:text-2xl font-bold text-zinc-100 mt-1 truncate max-w-[120px] md:max-w-[140px]">{data?.topModels[0]?.model || "N/A"}</h3>
            <p className="text-xs text-emerald-400 mt-1 font-medium">{data?.topModels[0]?.sold || 0} units</p>
          </div>
          <div className="h-8 w-8 md:h-10 md:w-10 bg-zinc-800/80 rounded-lg flex items-center justify-center text-zinc-300 border border-zinc-700/50 relative z-10">
            <TrendingUp size={16} />
          </div>
        </div>

        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-5 flex items-start justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl -mr-8 -mt-8 transition-all group-hover:bg-blue-500/10" />
          <div className="relative z-10">
            <p className="text-xs md:text-sm font-medium text-zinc-400 mb-1">Top Location</p>
            <h3 className="text-xl md:text-2xl font-bold text-zinc-100 mt-1 truncate max-w-[120px] md:max-w-[140px]">{data?.locations[0]?.location || "N/A"}</h3>
            <p className="text-xs text-blue-400 mt-1 font-medium">{data?.locations[0]?.deliveries || 0} deliveries</p>
          </div>
          <div className="h-8 w-8 md:h-10 md:w-10 bg-zinc-800/80 rounded-lg flex items-center justify-center text-zinc-300 border border-zinc-700/50 relative z-10">
            <MapPin size={16} />
          </div>
        </div>

        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-5 flex items-start justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl -mr-8 -mt-8 transition-all group-hover:bg-purple-500/10" />
          <div className="relative z-10">
            <p className="text-xs md:text-sm font-medium text-zinc-400 mb-1">Top Sales Officer</p>
            <h3 className="text-xl md:text-2xl font-bold text-zinc-100 mt-1 truncate max-w-[120px] md:max-w-[140px]">{data?.salesOfficers[0]?.sales_officer || "N/A"}</h3>
            <p className="text-xs text-purple-400 mt-1 font-medium">{data?.salesOfficers[0]?.deliveries || 0} deliveries</p>
          </div>
          <div className="h-8 w-8 md:h-10 md:w-10 bg-zinc-800/80 rounded-lg flex items-center justify-center text-zinc-300 border border-zinc-700/50 relative z-10">
            <Users size={16} />
          </div>
        </div>
      </div>

      {/* Insights */}
      {data?.insights && data.insights.length > 0 && (
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-5 relative overflow-hidden mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs md:text-sm font-semibold text-zinc-200 uppercase tracking-wider">Morning Brief</h3>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm text-zinc-300">
            {data.insights.map((insight, idx) => (
              <li key={idx} className="flex items-start gap-3 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800/50">
                <div className="w-1.5 h-1.5 rounded-full bg-[#EB0A1E] mt-1.5 shrink-0" />
                <span dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Trend */}
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-4 md:p-5 col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mr-3">
                <TrendingUp className="text-zinc-300" size={14} />
              </div>
              <h2 className="text-xs md:text-sm font-semibold text-zinc-200 tracking-wide uppercase">Monthly Trend</h2>
            </div>
          </div>
          <div className="h-60 md:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.monthlySales || []} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="month" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#3f3f46', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Line type="monotone" dataKey="sales" stroke={TOYOTA_RED} strokeWidth={3} dot={{ fill: '#09090b', stroke: TOYOTA_RED, strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: TOYOTA_RED, stroke: '#09090b', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>


      {/* Grid Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-4 md:p-5">
          <div className="flex items-center mb-6">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mr-3">
              <CarFront className="text-zinc-300" size={14} />
            </div>
            <h2 className="text-xs md:text-sm font-semibold text-zinc-200 tracking-wide uppercase">Model Distribution</h2>
          </div>
          <div className="h-56 md:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.modelDistribution.slice(0, 10) || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="model"
                  stroke="none"
                >
                  {data?.modelDistribution.slice(0, 10).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE_PIE[index % PALETTE_PIE.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#f4f4f5' }} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px', color: '#a1a1aa' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-4 md:p-5">
          <div className="flex items-center mb-6">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mr-3">
              <CarFront className="text-zinc-300" size={14} />
            </div>
            <h2 className="text-xs md:text-sm font-semibold text-zinc-200 tracking-wide uppercase">Top Selling Models</h2>
          </div>
          <div className="h-56 md:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.topModels || []} layout="vertical" margin={{ top: 5, right: 10, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="model" type="category" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} width={80} />
                <Tooltip cursor={{ fill: '#27272a', opacity: 0.4 }} contentStyle={tooltipStyle} itemStyle={{ color: '#e4e4e7' }} />
                <Bar dataKey="sold" radius={[0, 4, 4, 0]} barSize={14}>
                  {data?.topModels.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE_BAR_1[index % PALETTE_BAR_1.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-4 md:p-5">
          <div className="flex items-center mb-6">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mr-3">
              <MapPin className="text-zinc-300" size={14} />
            </div>
            <h2 className="text-xs md:text-sm font-semibold text-zinc-200 tracking-wide uppercase">Top Locations</h2>
          </div>
          <div className="h-56 md:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.locations || []} margin={{ top: 5, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="location" stroke="#71717a" fontSize={9} tickLine={false} axisLine={false} angle={-45} textAnchor="end" height={40} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#27272a', opacity: 0.4 }} contentStyle={tooltipStyle} itemStyle={{ color: '#e4e4e7' }} />
                <Bar dataKey="deliveries" radius={[4, 4, 0, 0]} barSize={20}>
                  {data?.locations.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE_BAR_2[index % PALETTE_BAR_2.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-4 md:p-5">
          <div className="flex items-center mb-6">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mr-3">
              <Users className="text-zinc-300" size={14} />
            </div>
            <h2 className="text-xs md:text-sm font-semibold text-zinc-200 tracking-wide uppercase">Sales Officers</h2>
          </div>
          <div className="h-56 md:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.salesOfficers || []} layout="vertical" margin={{ top: 5, right: 10, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="sales_officer" type="category" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} width={80} />
                <Tooltip cursor={{ fill: '#27272a', opacity: 0.4 }} contentStyle={tooltipStyle} itemStyle={{ color: '#e4e4e7' }} />
                <Bar dataKey="deliveries" radius={[0, 4, 4, 0]} barSize={14}>
                  {data?.salesOfficers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE_BAR_1[index % PALETTE_BAR_1.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-4 md:p-5">
          <div className="flex items-center mb-6">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mr-3">
              <CarFront className="text-zinc-300" size={14} />
            </div>
            <h2 className="text-xs md:text-sm font-semibold text-zinc-200 tracking-wide uppercase">Color Distribution</h2>
          </div>
          <div className="h-56 md:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.colours.slice(0, 10) || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="colour"
                  stroke="none"
                >
                  {data?.colours.slice(0, 10).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE_PIE[index % PALETTE_PIE.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#f4f4f5' }} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px', color: '#a1a1aa' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-4 md:p-5">
          <div className="flex items-center mb-6">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mr-3">
              <Lightbulb className="text-zinc-300" size={14} />
            </div>
            <h2 className="text-xs md:text-sm font-semibold text-zinc-200 tracking-wide uppercase">Top Remarks</h2>
          </div>
          <div className="h-56 md:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.remarks.slice(0, 10) || []} layout="vertical" margin={{ top: 5, right: 10, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="remark" type="category" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} width={80} />
                <Tooltip cursor={{ fill: '#27272a', opacity: 0.4 }} contentStyle={tooltipStyle} itemStyle={{ color: '#e4e4e7' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={14}>
                  {data?.remarks.slice(0, 10).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE_BAR_2[index % PALETTE_BAR_2.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Segment Tabs & Chart */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-4 md:p-6 mb-8 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mr-4 shrink-0">
              <Users className="text-zinc-300" size={18} />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-bold text-zinc-200 tracking-wide uppercase">Sales by Segment Breakdown</h2>
              <p className="text-xs text-zinc-500 mt-1">
                {activeTab === 'budget' && 'e.g. Glanza, Taisor, Rumion'}
                {activeTab === 'mid' && 'e.g. Hyryder, Innova, Hycross, Hilux'}
                {activeTab === 'luxury' && 'e.g. Fortuner, Legender, Camry, Vellfire'}
              </p>
            </div>
          </div>

          <div className="flex items-center bg-zinc-950/50 p-1 rounded-lg border border-zinc-800 self-start sm:self-auto w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("budget")}
              className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "budget" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Budget
            </button>
            <button
              onClick={() => setActiveTab("mid")}
              className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "mid" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Mid
            </button>
            <button
              onClick={() => setActiveTab("luxury")}
              className={`flex-1 sm:flex-none px-6 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "luxury" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Luxury
            </button>
          </div>
        </div>

        <div className="h-[400px] md:h-[500px] w-full flex flex-col md:flex-row items-center justify-center">
          {getSegmentData().length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getSegmentData()}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={160}
                  paddingAngle={2}
                  dataKey="deliveries"
                  nameKey="sales_officer"
                  stroke="none"
                >
                  {getSegmentData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE_SEGMENTS[index % PALETTE_SEGMENTS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#f4f4f5' }} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '13px', color: '#a1a1aa' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-zinc-500 text-sm h-full flex items-center justify-center">No data for this segment in the selected period.</div>
          )}
        </div>
      </div>
    </div>
  );
}

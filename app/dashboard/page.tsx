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
import { Loader2, TrendingUp, MapPin, Users, CarFront, Palette, Tag, ArrowUpRight } from "lucide-react";
import { FabASKai } from "../components/fabASKai";

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
}

// Toyota/Dark Theme palette
// Red: #EB0A1E, Dark Grays: #18181b, #27272a, #3f3f46
const TOYOTA_RED = "#EB0A1E";
const COLORS = [
  TOYOTA_RED, // Toyota Red
  "#475569",  // Slate 600
  "#94a3b8",  // Slate 400
  "#cbd5e1",  // Slate 300
  "#1e293b",  // Slate 800
  "#f8fafc",  // Slate 50
  "#334155",  // Slate 700
  "#64748b",  // Slate 500
  "#e2e8f0",  // Slate 200
  "#0f172a",  // Slate 900
];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="p-8">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Overview</h1>
          <p className="text-sm text-zinc-400 mt-1">Real-time delivery and sales analytics.</p>
        </div>
      </header>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-6 flex items-start justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#EB0A1E]/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-[#EB0A1E]/10" />
          <div className="relative z-10">
            <p className="text-sm font-medium text-zinc-400 mb-1 flex items-center gap-2">
              Total Deliveries
            </p>
            <h3 className="text-4xl font-bold text-zinc-100 mt-2">{data.kpis.totalDeliveries}</h3>
            <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-medium">
              <ArrowUpRight className="w-3 h-3" />
              On track
            </p>
          </div>
          <div className="h-10 w-10 bg-zinc-800/80 rounded-lg flex items-center justify-center text-zinc-300 border border-zinc-700/50 relative z-10">
            <CarFront size={18} />
          </div>
        </div>
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

        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-5">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mr-3">
              <Palette className="text-zinc-300" size={16} />
            </div>
            <h2 className="text-sm font-semibold text-zinc-200 tracking-wide uppercase">Popular Colours</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.colours.slice(0, 8)}
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  dataKey="count"
                  nameKey="colour"
                  labelLine={false}
                  stroke="#18181b"
                  strokeWidth={2}
                  label={(props: any) => `${props.payload?.colour || props.name || ''} (${((props.percent || 0) * 100).toFixed(0)}%)`}
                >
                  {data.colours.slice(0, 8).map((entry, index) => {
                    const colorMap: Record<string, string> = {
                      "WHITE": "#f4f4f5",
                      "PEARL WHITE": "#fafafa",
                      "SILVER": "#a1a1aa",
                      "GREY": "#52525b",
                      "BLACK": "#09090b",
                      "RED": TOYOTA_RED,
                      "BLUE": "#3b82f6",
                    };
                    const fill = colorMap[entry.colour?.toUpperCase()] || COLORS[index % COLORS.length];
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#f4f4f5' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-5">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mr-3">
              <Tag className="text-zinc-300" size={16} />
            </div>
            <h2 className="text-sm font-semibold text-zinc-200 tracking-wide uppercase">Remarks</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.remarks} margin={{ top: 5, right: 20, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="remark" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} angle={-30} textAnchor="end" height={40} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#27272a', opacity: 0.4 }} contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#52525b" radius={[4, 4, 0, 0]} barSize={32}>
                  {data.remarks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? TOYOTA_RED : '#52525b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <FabASKai />
      </div>
    </div>
  );
}

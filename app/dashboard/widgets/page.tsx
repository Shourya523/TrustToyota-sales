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
import { Loader2, TrendingUp, Trash2, Calendar, LayoutGrid, Bot } from "lucide-react";
import Link from "next/link";

const TOYOTA_RED = "#EB0A1E";
const PALETTE_PIE = ["#EB0A1E", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f43f5e", "#84cc16", "#06b6d4"];
const PALETTE_BAR_1 = ["#8b5cf6", "#ec4899", "#f43f5e", "#f97316", "#facc15", "#84cc16", "#10b981", "#14b8a6", "#06b6d4", "#3b82f6"];

const tooltipStyle = {
  backgroundColor: '#18181b',
  borderColor: '#27272a',
  color: '#f4f4f5',
  borderRadius: '6px',
  fontSize: '12px',
  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)',
};

export default function MyWidgetsPage() {
  const [widgets, setWidgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWidgets();
  }, []);

  const fetchWidgets = () => {
    setLoading(true);
    fetch("/api/dashboard/widgets")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch widgets");
        return res.json();
      })
      .then((data) => {
        setWidgets(data.widgets || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const deleteWidget = async (id: number) => {
    try {
      const res = await fetch(`/api/dashboard/widgets?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setWidgets((prev) => prev.filter((w) => w.id !== id));
      } else {
        alert("Failed to delete widget");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting widget");
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-[#EB0A1E]" />
        <span className="ml-3 text-sm font-medium text-zinc-400">Loading widgets...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6 min-h-[400px]">
        <div className="rounded-lg bg-red-950/30 p-4 text-red-400 border border-red-900/50 max-w-md w-full">
          <p className="font-semibold text-sm">Error loading widgets</p>
          <p className="text-xs mt-1 opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pb-32">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-zinc-500 mb-1">
            <LayoutGrid className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Analytics Workspace</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">My Custom Widgets</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Visualize your personalized layouts and pinned charts saved from the Copilot chat.
          </p>
        </div>
        <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-medium text-zinc-300">
          Total Widgets: <span className="text-white font-bold">{widgets.length}</span>
        </div>
      </header>

      {widgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10 text-center min-h-[300px]">
          <div className="w-12 h-12 bg-zinc-900/80 rounded-xl flex items-center justify-center border border-zinc-800 text-zinc-400 mb-4">
            <Bot className="w-6 h-6 text-[#EB0A1E]" />
          </div>
          <h3 className="text-base font-semibold text-zinc-200">No custom widgets yet</h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-1.5 mb-6">
            Ask Copilot to analyze data (e.g. "deliveries by model") and pin the resulting chart directly to your custom workspace.
          </p>
          <Link
            href="/dashboard/chat"
            className="px-4 py-2 bg-[#EB0A1E] text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            Open Copilot Chat
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {widgets.map((widget) => (
            <div key={widget.id} className="bg-zinc-900/50 rounded-xl border border-zinc-800/60 p-5 relative group flex flex-col">
              {/* Header block */}
              <div className="flex items-start justify-between border-b border-zinc-800/80 pb-3.5 mb-5">
                <div>
                  <h3 className="text-sm font-bold text-zinc-100 tracking-wide uppercase">{widget.title}</h3>
                  <div className="flex items-center gap-1.5 text-zinc-500 mt-1">
                    <Calendar className="w-3 h-3" />
                    <span className="text-[10px]">Pinned on {formatDate(widget.createdAt)}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteWidget(widget.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-zinc-500 hover:text-red-400 bg-zinc-950 hover:bg-red-500/10 border border-zinc-800 hover:border-red-900/30 rounded-lg"
                  title="Delete Widget"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Chart visualization */}
              <div className="h-64 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  {widget.type === "pie" ? (
                    <PieChart>
                      <Pie
                        data={widget.data}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey={widget.yKey}
                        nameKey={widget.xKey}
                        stroke="none"
                      >
                        {widget.data.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={PALETTE_PIE[index % PALETTE_PIE.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#f4f4f5' }} />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px', color: '#a1a1aa' }} />
                    </PieChart>
                  ) : widget.type === "line" ? (
                    <LineChart data={widget.data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey={widget.xKey} stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: '#3f3f46', strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Line
                        type="monotone"
                        dataKey={widget.yKey}
                        stroke={TOYOTA_RED}
                        strokeWidth={3}
                        dot={{ fill: '#09090b', stroke: TOYOTA_RED, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: TOYOTA_RED, stroke: '#09090b', strokeWidth: 2 }}
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={widget.data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis dataKey={widget.xKey} stroke="#71717a" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: '#27272a', opacity: 0.4 }} contentStyle={tooltipStyle} itemStyle={{ color: '#e4e4e7' }} />
                      <Bar dataKey={widget.yKey} radius={[4, 4, 0, 0]} barSize={20}>
                        {widget.data.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={PALETTE_BAR_1[index % PALETTE_BAR_1.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

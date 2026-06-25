"use client"

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const COLORS = [
    "#EB0A1E",
    "#475569",
    "#94a3b8",
    "#cbd5e1",
    "#1e293b",
    "#f8fafc",
    "#334155",
    "#64748b",
    "#e2e8f0",
    "#0f172a",
];

interface ChartConfig {
    type: "bar" | "pie" | "area" | "line"
    title: string
    data: Record<string, any>[]
    xKey: string
    yKey: string
}

export function ChartRender({ config }: { config: ChartConfig }) {
    const { type, title, data, xKey, yKey } = config
    const common = {
        data,
        margin: { top: 10, right: 20, left: 0, bottom: 40 }
    }
    const renderChart = () => {
        switch (type) {
            case "bar":
                return (
                    <BarChart {...common}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xKey} angle={-35} textAnchor="end" tick={{ fontSize: "12" }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey={yKey} fill="#EB0A1E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                )
            case "line":
                return (
                    <LineChart {...common}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xKey} angle={-35} textAnchor="end" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey={yKey} stroke="#E40020" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                )
            case "area":
                return (
                    <AreaChart {...common}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xKey} angle={-35} textAnchor="end" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey={yKey} stroke="#E40020" fill="#fecdd3" strokeWidth={2} />
                    </AreaChart>
                )
            case "pie":
                return (
                    <PieChart>
                        <Pie data={data} dataKey={yKey} nameKey={xKey} cx="50%" cy="50%" outerRadius={120} label>
                            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                )
        }
    }

    return (
        <div className="my-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">{title}</h3>
            <ResponsiveContainer width="100%" height={320}> {renderChart()!} </ResponsiveContainer>
        </div>
    )
}
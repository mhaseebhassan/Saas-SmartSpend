"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

// Aurora palette chart colors
const COLORS = ["#06B6D4", "#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B", "#F97316", "#6366F1"];

const CustomTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
        const displayName = payload[0].name && payload[0].name !== "amount" ? payload[0].name : label;
        return (
            <div className="relative bg-[#1A2035]/95 backdrop-blur-2xl border border-white/[0.08] p-3 rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.05)] outline-none whitespace-nowrap z-50">
                {/* Thin aurora gradient top border */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500" />
                <p className="text-xs font-semibold text-[#94A3B8] mb-1">{displayName}</p>
                <p className="text-sm font-bold text-[#F1F5F9]">
                    ${Number(payload[0].value).toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

interface ChartDataItem {
    date?: string;
    amount?: number;
    value?: number;
    name?: string;
    [key: string]: unknown;
}

export function SpendingChart({ data }: { data: ChartDataItem[] }) {
    return (
        <ResponsiveContainer width="100%" height={300} minWidth={1} minHeight={1}>
            <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 12 }}
                    dy={10}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94A3B8", fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                <Bar
                    dataKey="amount"
                    fill="#8B5CF6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}

export function CategoryPieChart({ data }: { data: ChartDataItem[] }) {
    return (
        <ResponsiveContainer width="100%" height={300} minWidth={1} minHeight={1}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
            </PieChart>
        </ResponsiveContainer>
    );
}

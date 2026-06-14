"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    BarChart,
    Bar,
    Cell,
    RadialBarChart,
    RadialBar
} from "recharts";

const RadialBarComponent = RadialBar as any;
import {
    Calendar as CalendarIcon,
    TrendingUp,
    TrendingDown,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Lock,
    Loader2,
    Crown,
    CheckCircle2,
    FileDown
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";
import DemoPaymentModal from "@/components/DemoPaymentModal";

// Refined, professional chart colors
const CHART_COLORS = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#F97316", "#06B6D4", "#84CC16", "#64748B"];

const getPastTwelveMonths = () => {
    const months = [];
    const date = new Date();
    for (let i = 0; i < 12; i++) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const monthLabel = date.toLocaleString("default", { month: "long", year: "numeric" });
        months.push({ value: `${year}-${month}`, label: monthLabel });
        date.setMonth(date.getMonth() - 1);
    }
    return months;
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const item = payload[0];
        const label = item.payload.date || item.payload.dayName || item.payload.name || item.name;
        return (
            <div className="bg-[#111111] border border-white/[0.08] p-3 rounded-lg shadow-xl">
                <p className="text-[11px] font-medium text-white/50 mb-1">{label}</p>
                <p className="text-sm font-semibold text-white">
                    ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
            </div>
        );
    }
    return null;
};

export default function AnalyticsPageClient() {
    const { data: session } = useSession();
    const months = React.useMemo(() => getPastTwelveMonths(), []);
    const [selectedMonth, setSelectedMonth] = React.useState<string>(months[0].value);
    const [disabledLines, setDisabledLines] = React.useState<Record<string, boolean>>({});
    const [upgradeLoading, setUpgradeLoading] = React.useState<boolean>(false);
    const [showPaymentModal, setShowPaymentModal] = React.useState(false);

    const { year, monthIndex, daysInMonth, firstDayIndex } = React.useMemo(() => {
        const [y, m] = selectedMonth.split("-").map(Number);
        const firstDay = new Date(y, m - 1, 1).getDay();
        const totalDays = new Date(y, m, 0).getDate();
        return {
            year: y,
            monthIndex: m - 1,
            daysInMonth: totalDays,
            firstDayIndex: firstDay
        };
    }, [selectedMonth]);

    // Compute all API URLs from selectedMonth
    const urls = React.useMemo(() => {
        const [y, m] = selectedMonth.split("-").map(Number);
        const totalDays = new Date(y, m, 0).getDate();
        const dateFrom = `${selectedMonth}-01`;
        const dateTo = `${selectedMonth}-${String(totalDays).padStart(2, "0")}`;

        const prevDate = new Date(y, m - 2, 1);
        const prevYear = prevDate.getFullYear();
        const prevMonth = String(prevDate.getMonth() + 1).padStart(2, "0");
        const prevTotalDays = new Date(prevYear, prevDate.getMonth() + 1, 0).getDate();
        const prevDateFrom = `${prevYear}-${prevMonth}-01`;
        const prevDateTo = `${prevYear}-${prevMonth}-${String(prevTotalDays).padStart(2, "0")}`;

        const trendsEndDate = new Date(y, m, 0, 23, 59, 59, 999);
        const trendsStartDate = new Date(y, m - 6, 1);
        const trendsDateFrom = trendsStartDate.toISOString().split("T")[0];
        const trendsDateTo = trendsEndDate.toISOString().split("T")[0];

        return {
            summary: `/api/analytics/summary?dateFrom=${dateFrom}&dateTo=${dateTo}`,
            prevSummary: `/api/analytics/summary?dateFrom=${prevDateFrom}&dateTo=${prevDateTo}`,
            daily: `/api/analytics/daily?dateFrom=${dateFrom}&dateTo=${dateTo}`,
            prevDaily: `/api/analytics/daily?dateFrom=${prevDateFrom}&dateTo=${prevDateTo}`,
            trends: `/api/analytics/category-trends?dateFrom=${trendsDateFrom}&dateTo=${trendsDateTo}`,
            merchants: `/api/analytics/top-descriptions?dateFrom=${dateFrom}&dateTo=${dateTo}`,
            dayOfWeek: `/api/analytics/by-day-of-week?dateFrom=${dateFrom}&dateTo=${dateTo}`,
        };
    }, [selectedMonth]);

    // SWR hooks for each analytics endpoint
    const { data: summaryData, isLoading: summaryLoading } = useSWR(urls.summary, fetcher);
    const { data: prevSummaryData, isLoading: prevSummaryLoading } = useSWR(urls.prevSummary, fetcher);
    const { data: dailyData, isLoading: dailyLoading } = useSWR(urls.daily, fetcher);
    const { data: prevDailyData, isLoading: prevDailyLoading } = useSWR(urls.prevDaily, fetcher);
    const { data: trendsData, isLoading: trendsLoading } = useSWR(urls.trends, fetcher);
    const { data: merchantsData, isLoading: merchantsLoading } = useSWR(urls.merchants, fetcher);
    const { data: dayOfWeekData, isLoading: dayOfWeekLoading } = useSWR(urls.dayOfWeek, fetcher);

    const loading = summaryLoading || prevSummaryLoading || dailyLoading || prevDailyLoading || trendsLoading || merchantsLoading || dayOfWeekLoading;

    // Derive combined data object from SWR responses (mirrors the old setState shape)
    const data = React.useMemo(() => ({
        summary: summaryData ?? { totalSpent: 0, count: 0, avgSpent: 0 },
        prevSummary: prevSummaryData ?? { totalSpent: 0, count: 0, avgSpent: 0 },
        daily: dailyData?.daily ?? [],
        prevDaily: prevDailyData?.daily ?? [],
        trends: trendsData?.trends ?? [],
        merchants: merchantsData?.topDescriptions ?? [],
        dayOfWeek: dayOfWeekData?.byDayOfWeek ?? [],
        isPro: summaryData?.isPro ?? false,
    }), [summaryData, prevSummaryData, dailyData, prevDailyData, trendsData, merchantsData, dayOfWeekData]);

    const handleUpgradeToPro = async () => {
        setShowPaymentModal(true);
    };

    const isCurrentMonth = selectedMonth === months[0].value;
    const elapsedDays = isCurrentMonth ? Math.max(1, new Date().getDate()) : daysInMonth;
    const thisMonthAvgDaily = data.summary.totalSpent / elapsedDays;

    const prevMonthElapsedDays = new Date(year, monthIndex, 0).getDate();
    const prevMonthAvgDaily = data.prevSummary.totalSpent / prevMonthElapsedDays;

    const velocityDelta = prevMonthAvgDaily > 0 
        ? ((thisMonthAvgDaily - prevMonthAvgDaily) / prevMonthAvgDaily) * 100 
        : 0;

    const calendarDays = React.useMemo(() => {
        const grid = [];
        for (let i = 0; i < firstDayIndex; i++) {
            grid.push({ isEmpty: true, key: `empty-${i}` });
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${selectedMonth}-${String(day).padStart(2, "0")}`;
            const matchedDay = data.daily.find(d => d.date === dateStr);
            grid.push({
                isEmpty: false,
                dayNum: day,
                dateStr,
                amount: matchedDay ? matchedDay.amount : 0
            });
        }
        return grid;
    }, [selectedMonth, daysInMonth, firstDayIndex, data.daily]);

    const trendChart = React.useMemo(() => {
        const monthMap = {};
        const categoriesSet = new Set();

        data.trends.forEach(item => {
            const { month, categoryName, amount } = item;
            categoriesSet.add(categoryName);

            if (!monthMap[month]) {
                monthMap[month] = { name: month };
            }
            monthMap[month][categoryName] = amount;
        });

        const sortedMonths = Object.keys(monthMap).sort();
        const chartData = sortedMonths.map(m => monthMap[m]);

        return {
            data: chartData,
            categories: Array.from(categoriesSet),
        };
    }, [data.trends]);

    const handleLegendClick = (e) => {
        const { value } = e;
        setDisabledLines(prev => ({ ...prev, [value]: !prev[value] }));
    };

    const merchantsChart = React.useMemo(() => {
        return data.merchants
            .map(m => ({
                name: m.rawDescription,
                count: m.count,
                amount: m.totalSpent
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [data.merchants]);

    const radialChartData = React.useMemo(() => {
        if (!data.summary || !data.summary.categoryBreakdown) return [];
        return data.summary.categoryBreakdown
            .slice(0, 3)
            .map((cat: any, idx: number) => ({
                name: cat.name,
                value: cat.amount,
                fill: CHART_COLORS[idx % CHART_COLORS.length],
            }));
    }, [data.summary]);

    const userIsPro = session?.user?.isPro || false;

    return (
        <div className="space-y-6 text-left select-none relative pb-20">
            <DemoPaymentModal 
                isOpen={showPaymentModal} 
                onClose={() => setShowPaymentModal(false)} 
                onSuccess={() => { 
                    setShowPaymentModal(false); 
                    window.location.reload(); 
                }} 
            />
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-white tracking-tight">Analytics</h1>
                    <p className="text-sm text-white/50 mt-1">Deep dive into your spending velocity and trends.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 p-1 bg-[#09090B] border border-white/[0.08] rounded-lg">
                        {months.slice(0, 3).map(m => {
                            const isActive = selectedMonth === m.value;
                            return (
                                <button
                                    key={m.value}
                                    onClick={() => setSelectedMonth(m.value)}
                                    className={cn(
                                        "px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer",
                                        isActive ? "bg-white text-black shadow-sm" : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                                    )}
                                >
                                    {m.label.split(" ")[0]}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.16] hover:bg-white/[0.04] transition-all cursor-pointer print:hidden"
                    >
                        <FileDown className="w-3.5 h-3.5" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Print-only report header (hidden on screen) */}
            <div className="hidden print:block print-report-header">
                <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#111' }}>SmartSpend Analytics Report</h1>
                <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                    {months.find(m => m.value === selectedMonth)?.label ?? selectedMonth}
                </p>
            </div>

            <div className="relative">
                {/* Pro Gate Overlay */}
                {!userIsPro && !loading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-20 rounded-xl border border-white/[0.04] flex items-center justify-center p-6 min-h-[500px]">
                        <div className="max-w-sm w-full bg-[#111111] border border-white/[0.08] rounded-xl p-8 text-center shadow-2xl">
                            <Lock className="w-8 h-8 text-white/50 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">Pro Analytics</h3>
                            <p className="text-sm text-white/50 mb-6">
                                Unlock heatmaps, 6-month trends, and velocity metrics to optimize your budget.
                            </p>
                            <Button
                                onClick={handleUpgradeToPro}
                                isLoading={upgradeLoading}
                                className="w-full bg-white text-black hover:bg-white/90"
                            >
                                Upgrade to Pro
                            </Button>
                        </div>
                    </div>
                )}

                <div className={cn("space-y-6", !userIsPro && "pointer-events-none filter select-none blur-sm")}>
                    
                    {/* Top Row Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-5 rounded-xl bg-[#09090B] border border-white/[0.08] shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Daily Velocity</h3>
                                <div className="text-2xl font-semibold text-white tracking-tight mb-1">
                                    ${thisMonthAvgDaily.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    <span className="text-sm font-normal text-white/40 ml-1">/ day</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs">
                                    <span className={cn(
                                        "flex items-center font-medium",
                                        velocityDelta > 0 ? "text-white" : "text-white/60"
                                    )}>
                                        {velocityDelta > 0 ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                                        {Math.abs(velocityDelta).toFixed(1)}%
                                    </span>
                                    <span className="text-white/40">vs last month</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 rounded-xl bg-[#09090B] border border-white/[0.08] shadow-sm flex flex-col justify-between items-center relative">
                            <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider absolute top-5 left-5">Top Category</h3>
                            
                            {loading ? (
                                <div className="h-24 flex items-center justify-center">
                                    <Loader2 className="w-4 h-4 animate-spin text-white/30" />
                                </div>
                            ) : radialChartData.length === 0 ? (
                                <div className="h-24 flex items-center justify-center text-xs text-white/40">No data</div>
                            ) : (
                                <div className="w-full h-24 mt-6 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadialBarChart 
                                            cx="50%" cy="50%" innerRadius="40%" outerRadius="100%" barSize={6} 
                                            data={radialChartData} startAngle={180} endAngle={0}
                                        >
                                            <RadialBarComponent background={{ fill: "rgba(255,255,255,0.05)" }} dataKey="value" cornerRadius={4} />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                                        <span className="text-xs font-semibold text-white">{radialChartData[0]?.name}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-5 rounded-xl bg-[#09090B] border border-white/[0.08] shadow-sm flex flex-col justify-between">
                            <div>
                                <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Total Volume</h3>
                                <div className="text-2xl font-semibold text-white tracking-tight mb-1">
                                    ${data.summary.totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </div>
                                <div className="text-xs text-white/40">Across {data.summary.count} transactions</div>
                            </div>
                        </div>
                    </div>

                    {/* Heatmap Section */}
                    <div className="p-5 rounded-xl bg-[#09090B] border border-white/[0.08] shadow-sm">
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-white">Intensity Heatmap</h3>
                            <p className="text-xs text-white/50 mt-1">Daily expenditure volume for the selected month.</p>
                        </div>
                        
                        {loading ? (
                            <div className="h-48 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-white/30" />
                            </div>
                        ) : (
                            <div className="mx-auto max-w-lg">
                                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-medium text-white/40 mb-2">
                                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                                </div>
                                <div className="grid grid-cols-7 gap-2 justify-items-center">
                                    {calendarDays.map((cell) => {
                                        if (cell.isEmpty) return <div key={cell.key} className="w-8 h-8 sm:w-10 sm:h-10" />;

                                        const maxAmount = Math.max(...calendarDays.map(d => d.amount || 0));
                                        const amount = cell.amount;
                                        let cellStyle = "bg-[#111111] border border-white/[0.04]";
                                        
                                        if (amount > 0) {
                                            const ratio = maxAmount > 0 ? amount / maxAmount : 0;
                                            if (ratio <= 0.2) cellStyle = "bg-cyan-500/20 border border-cyan-500/30 text-cyan-100";
                                            else if (ratio <= 0.5) cellStyle = "bg-cyan-500/40 border border-cyan-500/50 text-white";
                                            else if (ratio <= 0.8) cellStyle = "bg-cyan-500/70 border border-cyan-500/80 text-white font-medium";
                                            else cellStyle = "bg-cyan-400 border border-cyan-400 text-slate-900 font-bold shadow-[0_0_10px_rgba(34,211,238,0.4)]";
                                        }

                                        return (
                                            <Tooltip
                                                key={cell.dateStr}
                                                content={
                                                    <div className="text-xs text-left">
                                                        <span className="text-white/50 block">{new Date(cell.dateStr).toLocaleDateString()}</span>
                                                        <span className="text-white font-medium">${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                    </div>
                                                }
                                            >
                                                <div className={cn("w-8 h-8 sm:w-10 sm:h-10 rounded-md flex flex-col justify-center items-center p-1 cursor-pointer transition-colors hover:brightness-125 mx-auto", cellStyle)}>
                                                    <span className="text-[10px] sm:text-xs opacity-70 leading-none">{cell.dayNum}</span>
                                                </div>
                                            </Tooltip>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Trends & Merchants Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="p-5 rounded-xl bg-[#09090B] border border-white/[0.08] shadow-sm">
                            <h3 className="text-sm font-semibold text-white mb-6">6-Month Trends</h3>
                            <div className="h-[240px] w-full">
                                {loading ? (
                                    <div className="h-full flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-white/30" /></div>
                                ) : trendChart.data.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-xs text-white/40">No data</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trendChart.data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
                                            <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                                            {trendChart.categories.map((catName: string, idx: number) => {
                                                const catColor = CHART_COLORS[idx % CHART_COLORS.length];
                                                return (
                                                    <Area
                                                        key={catName} type="monotone" dataKey={catName}
                                                        stroke={catColor} strokeWidth={2} fill="transparent"
                                                    />
                                                );
                                            })}
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="p-5 rounded-xl bg-[#09090B] border border-white/[0.08] shadow-sm">
                            <h3 className="text-sm font-semibold text-white mb-6">Top Merchants</h3>
                            <div className="h-[240px] w-full">
                                {loading ? (
                                    <div className="h-full flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-white/30" /></div>
                                ) : merchantsChart.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-xs text-white/40">No data</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={merchantsChart} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
                                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.8)", fontSize: 11 }} width={80} />
                                            <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} content={<CustomTooltip />} />
                                            <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                                                {merchantsChart.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

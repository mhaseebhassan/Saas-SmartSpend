"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    BarChart,
    Bar,
    Cell
} from "recharts";
import {
    Calendar as CalendarIcon,
    TrendingUp,
    TrendingDown,
    Activity,
    ArrowUpRight,
    Lock,
    Sparkles,
    Loader2,
    Crown,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";

// Get past 12 months for selector dropdown
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
            <div className="bg-[#121420] border border-white/5 p-3 rounded-xl shadow-2xl backdrop-blur-xl">
                <p className="text-xs font-semibold text-muted-foreground/80 mb-1">{label}</p>
                <p className="text-sm font-bold text-primary">
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
    const [loading, setLoading] = React.useState<boolean>(true);
    
    // Dataset state
    const [data, setData] = React.useState<any>({
        summary: { totalSpent: 0, count: 0, avgSpent: 0 },
        prevSummary: { totalSpent: 0, count: 0, avgSpent: 0 },
        daily: [],
        prevDaily: [],
        trends: [],
        merchants: [],
        dayOfWeek: [],
        isPro: false
    });

    // Toggle states for Category Trend Chart legend
    const [disabledLines, setDisabledLines] = React.useState<Record<string, boolean>>({});
    const [upgradeLoading, setUpgradeLoading] = React.useState<boolean>(false);

    // Parse the selected month string to year/month details
    const { year, monthIndex, daysInMonth, firstDayIndex } = React.useMemo(() => {
        const [y, m] = selectedMonth.split("-").map(Number);
        const firstDay = new Date(y, m - 1, 1).getDay(); // Sunday=0, Monday=1, etc.
        const totalDays = new Date(y, m, 0).getDate();
        return {
            year: y,
            monthIndex: m - 1,
            daysInMonth: totalDays,
            firstDayIndex: firstDay
        };
    }, [selectedMonth]);

    // Fetch data when selected month changes
    const fetchAnalyticsData = React.useCallback(async (monthStr) => {
        setLoading(true);
        try {
            const [y, m] = monthStr.split("-").map(Number);
            const totalDays = new Date(y, m, 0).getDate();
            const dateFrom = `${monthStr}-01`;
            const dateTo = `${monthStr}-${String(totalDays).padStart(2, "0")}`;

            // Compute previous month dates for MoM velocity
            const prevDate = new Date(y, m - 2, 1);
            const prevYear = prevDate.getFullYear();
            const prevMonth = String(prevDate.getMonth() + 1).padStart(2, "0");
            const prevTotalDays = new Date(prevYear, prevDate.getMonth() + 1, 0).getDate();
            const prevDateFrom = `${prevYear}-${prevMonth}-01`;
            const prevDateTo = `${prevYear}-${prevMonth}-${String(prevTotalDays).padStart(2, "0")}`;

            // Category trends (past 6 months) date range computation
            const trendsEndDate = new Date(y, m, 0, 23, 59, 59, 999);
            const trendsStartDate = new Date(y, m - 6, 1);
            const trendsDateFrom = trendsStartDate.toISOString().split("T")[0];
            const trendsDateTo = trendsEndDate.toISOString().split("T")[0];

            const fetchJson = async (url) => {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP error ${res.status}`);
                return res.json();
            };

            const results = await Promise.all([
                fetchJson(`/api/analytics/summary?dateFrom=${dateFrom}&dateTo=${dateTo}`),
                fetchJson(`/api/analytics/summary?dateFrom=${prevDateFrom}&dateTo=${prevDateTo}`),
                fetchJson(`/api/analytics/daily?dateFrom=${dateFrom}&dateTo=${dateTo}`),
                fetchJson(`/api/analytics/daily?dateFrom=${prevDateFrom}&dateTo=${prevDateTo}`),
                fetchJson(`/api/analytics/category-trends?dateFrom=${trendsDateFrom}&dateTo=${trendsDateTo}`),
                fetchJson(`/api/analytics/top-descriptions?dateFrom=${dateFrom}&dateTo=${dateTo}`),
                fetchJson(`/api/analytics/by-day-of-week?dateFrom=${dateFrom}&dateTo=${dateTo}`)
            ]);

            setData({
                summary: results[0],
                prevSummary: results[1],
                daily: results[2].daily || [],
                prevDaily: results[3].daily || [],
                trends: results[4].trends || [],
                merchants: results[5].topDescriptions || [],
                dayOfWeek: results[6].byDayOfWeek || [],
                isPro: results[0].isPro
            });
        } catch (err) {
            console.error("Error fetching analytics datasets:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchAnalyticsData(selectedMonth);
    }, [selectedMonth, fetchAnalyticsData]);

    // Handle Pro subscription checkout redirection
    const handleUpgradeToPro = async () => {
        setUpgradeLoading(true);
        try {
            const res = await fetch("/api/stripe/create-checkout-session", {
                method: "POST"
            });
            if (res.ok) {
                const checkoutData = await res.json();
                if (checkoutData.url) {
                    window.location.href = checkoutData.url;
                }
            } else {
                alert("Stripe Integration failed to start.");
            }
        } catch (err) {
            console.error("Upgrade logic error:", err);
        } finally {
            setUpgradeLoading(false);
        }
    };

    // 1. Calculations: Spending Velocity (Daily averages)
    const isCurrentMonth = selectedMonth === months[0].value;
    const elapsedDays = isCurrentMonth ? Math.max(1, new Date().getDate()) : daysInMonth;
    const thisMonthAvgDaily = data.summary.totalSpent / elapsedDays;

    const prevMonthElapsedDays = new Date(year, monthIndex, 0).getDate();
    const prevMonthAvgDaily = data.prevSummary.totalSpent / prevMonthElapsedDays;

    const velocityDelta = prevMonthAvgDaily > 0 
        ? ((thisMonthAvgDaily - prevMonthAvgDaily) / prevMonthAvgDaily) * 100 
        : 0;

    // 2. Heatmap Calculations: Build calendar grid structure
    const calendarDays = React.useMemo(() => {
        const grid = [];
        // Add empty slots for the first day of the week padding
        for (let i = 0; i < firstDayIndex; i++) {
            grid.push({ isEmpty: true, key: `empty-${i}` });
        }
        
        // Add days of the month with matched aggregated spend
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

    // 3. Category Trends Processing: Pivoting raw category monthly outputs for Recharts
    const trendChart = React.useMemo(() => {
        const monthMap = {};
        const categoriesSet = new Set();
        const colorsMap = {};

        data.trends.forEach(item => {
            const { month, categoryName, categoryColor, amount } = item;
            categoriesSet.add(categoryName);
            colorsMap[categoryName] = categoryColor;

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
            colors: colorsMap
        };
    }, [data.trends]);

    // Toggle legend line visibilities
    const handleLegendClick = (e) => {
        const { value } = e;
        setDisabledLines(prev => ({
            ...prev,
            [value]: !prev[value]
        }));
    };

    // 4. Top Merchants frequent descriptions processing (top 5 by frequency)
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

    // User is restricted to Pro blur block if not Pro
    const userIsPro = session?.user?.isPro || false;

    return (
        <div className="space-y-8 select-none text-left">
            {/* Top Bar Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white/95">Financial Analytics</h1>
                    <p className="text-xs text-muted-foreground">In-depth insights, spending velocities, and heatmaps.</p>
                </div>

                {/* Month Dropdown Selector */}
                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4.5 h-4.5 text-muted-foreground" />
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-card border border-white/5 text-xs text-white rounded-xl py-2 px-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all select-none cursor-pointer"
                    >
                        {months.map(m => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content Container holding all metrics */}
            <div className="relative">
                {/* Pro Access Backdrop Blur Overlay */}
                {!userIsPro && !loading && (
                    <div className="absolute inset-0 bg-[#0F1117]/35 backdrop-blur-[14px] z-20 rounded-3xl border border-white/5 flex items-center justify-center p-6 min-h-[500px]">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 450, damping: 25 }}
                            className="max-w-md w-full rounded-2xl border border-white/5 bg-card/70 p-8 shadow-2xl backdrop-blur-md relative overflow-hidden"
                        >
                            {/* Accent lighting glow */}
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                            
                            <div className="flex flex-col items-center text-center space-y-5">
                                <div className="p-3.5 bg-primary/10 text-primary rounded-2xl border border-primary/20 shadow-[0_0_20px_rgba(99,102,241,0.15)] animate-pulse">
                                    <Crown className="w-8 h-8 text-indigo-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-white flex items-center justify-center gap-2">
                                        Unlock Premium Analytics <Sparkles className="w-4 h-4 text-warning animate-bounce" />
                                    </h3>
                                    <p className="text-xs text-muted-foreground max-w-sm">
                                        Level up your savings with unlimited custom dashboards, predictive analysis, and full data history.
                                    </p>
                                </div>

                                <div className="w-full text-left bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3.5">
                                    <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                                        <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                                        <span>Interactive Calendar Heatmaps showing spending intensity</span>
                                    </div>
                                    <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                                        <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                                        <span>6-Month dynamic Category trends line chart</span>
                                    </div>
                                    <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                                        <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                                        <span>Spending velocity indexes (daily MoM aggregates)</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleUpgradeToPro}
                                    isLoading={upgradeLoading}
                                    className="w-full h-11 bg-primary text-white shadow-xl hover:shadow-indigo-500/25 flex items-center justify-center text-xs font-bold shrink-0"
                                >
                                    Upgrade to Pro
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Dashboard grid layout */}
                <div className={cn("space-y-6", !userIsPro && "pointer-events-none filter select-none")}>
                    {/* Top Row: Spending Velocity Metrics (Side by Side comparison) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <Card className="md:col-span-2">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                                <div className="text-left">
                                    <CardTitle className="text-sm font-bold text-white/90">Daily Spending Velocity</CardTitle>
                                    <CardDescription>MoM mathematical averages analysis comparing daily runs.</CardDescription>
                                </div>
                                <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/15">
                                    <Activity className="w-4 h-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-2">
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">This Month Avg / Day</span>
                                        <h3 className="text-2xl font-extrabold text-white">
                                            ${thisMonthAvgDaily.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </h3>
                                    </div>
                                    <div className="h-px sm:h-10 w-full sm:w-px bg-white/5 shrink-0" />
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Last Month Avg / Day</span>
                                        <h3 className="text-2xl font-extrabold text-muted-foreground/80">
                                            ${prevMonthAvgDaily.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </h3>
                                    </div>
                                    <div className="h-px sm:h-10 w-full sm:w-px bg-white/5 shrink-0" />
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Velocity Delta</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className={cn(
                                                "text-lg font-black flex items-center",
                                                velocityDelta > 0 ? "text-destructive" : "text-success"
                                            )}>
                                                {velocityDelta > 0 ? <ArrowUpRight className="w-4.5 h-4.5" /> : <TrendingDown className="w-4.5 h-4.5" />}
                                                {Math.abs(velocityDelta).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Summary Totals */}
                        <Card>
                            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                                <div className="text-left">
                                    <CardTitle className="text-sm font-bold text-white/90">Aggregated Totals</CardTitle>
                                    <CardDescription>Total expenditure count recorded.</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col justify-center h-full pb-6">
                                <div className="flex justify-between items-baseline mb-2">
                                    <span className="text-3xl font-black text-white">${data.summary.totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    <span className="text-xs text-muted-foreground">across {data.summary.count} entries</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/[0.02] border border-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full w-3/4 shadow-[0_0_8px_rgba(99,102,241,0.2)]" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Second Row: Spending Heatmap (Interactive Calendar Calendar Grid) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-md font-bold text-white/90">Spending Intensity Heatmap</CardTitle>
                            <CardDescription>Visual tracker demonstrating daily expenditure volume for the selected month.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="h-64 w-full flex items-center justify-center text-muted-foreground">
                                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading calendar heatmaps...
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Calendar Days Headers */}
                                    <div className="grid grid-cols-7 gap-2.5 text-center text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground/80">
                                        <div>Sun</div>
                                        <div>Mon</div>
                                        <div>Tue</div>
                                        <div>Wed</div>
                                        <div>Thu</div>
                                        <div>Fri</div>
                                        <div>Sat</div>
                                    </div>

                                    {/* Grid Cells */}
                                    <div className="grid grid-cols-7 gap-2.5">
                                        {/* Blank spacing headers */}
                                        {calendarDays.map((cell) => {
                                            if (cell.isEmpty) {
                                                return <div key={cell.key} className="aspect-square bg-transparent" />;
                                            }

                                            // Determine background color intensities
                                            const amount = cell.amount;
                                            let cellStyle = "bg-white/[0.01] border-white/5 hover:bg-white/[0.03]";
                                            if (amount > 0 && amount <= 30) {
                                                cellStyle = "bg-primary/10 border-primary/20 hover:bg-primary/20 text-indigo-400";
                                            } else if (amount > 30 && amount <= 100) {
                                                cellStyle = "bg-primary/30 border-primary/40 hover:bg-primary/40 text-indigo-300";
                                            } else if (amount > 100 && amount <= 250) {
                                                cellStyle = "bg-primary/55 border-primary/60 hover:bg-primary/65 text-white";
                                            } else if (amount > 250) {
                                                cellStyle = "bg-primary border-primary shadow-[0_0_12px_rgba(99,102,241,0.25)] hover:bg-primary/95 text-white";
                                            }

                                            return (
                                                <Tooltip
                                                    key={cell.dateStr}
                                                    content={
                                                        <div className="text-[10px] flex flex-col items-start gap-0.5 text-left">
                                                            <span className="font-bold text-muted-foreground/90">
                                                                {new Date(cell.dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                                            </span>
                                                            <span className="text-white font-extrabold">
                                                                Spent: ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                            </span>
                                                        </div>
                                                    }
                                                >
                                                    <div className={cn(
                                                        "aspect-square rounded-xl border flex flex-col justify-between p-2.5 transition-all duration-200 cursor-pointer select-none",
                                                        cellStyle
                                                    )}>
                                                        <span className="text-[10px] font-bold opacity-75">{cell.dayNum}</span>
                                                        {amount > 0 && (
                                                            <span className="text-[9px] sm:text-xs font-black truncate max-w-full block">
                                                                ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </Tooltip>
                                            );
                                        })}
                                    </div>

                                    {/* Heatmap Legend indicator */}
                                    <div className="flex items-center justify-end gap-3 text-[10px] text-muted-foreground font-bold pt-2 select-none">
                                        <span>Less</span>
                                        <div className="w-3.5 h-3.5 rounded-md bg-white/[0.01] border border-white/5" />
                                        <div className="w-3.5 h-3.5 rounded-md bg-primary/10 border border-primary/20" />
                                        <div className="w-3.5 h-3.5 rounded-md bg-primary/30 border border-primary/40" />
                                        <div className="w-3.5 h-3.5 rounded-md bg-primary/55 border border-primary/60" />
                                        <div className="w-3.5 h-3.5 rounded-md bg-primary border-primary" />
                                        <span>More</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Third Row: Recharts Trends & Merchants Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                        {/* 6-Month Category Trends */}
                        <Card className="lg:col-span-4">
                            <CardHeader>
                                <CardTitle className="text-md font-bold text-white/90">6-Month Category Trends</CardTitle>
                                <CardDescription>Aggregated category trends to visualize multi-line progress trajectories.</CardDescription>
                            </CardHeader>
                            <CardContent className="pl-0 sm:pl-2">
                                {loading ? (
                                    <div className="h-[280px] w-full flex items-center justify-center text-muted-foreground">
                                        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading trends...
                                    </div>
                                ) : trendChart.data.length === 0 ? (
                                    <div className="h-[280px] flex items-center justify-center text-xs text-muted-foreground">
                                        No trends database recorded.
                                    </div>
                                ) : (
                                    <div className="w-full h-[280px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={trendChart.data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                                <XAxis
                                                    dataKey="name"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 500 }}
                                                    dy={10}
                                                />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 500 }}
                                                />
                                                <RechartsTooltip content={<CustomTooltip />} />
                                                <Legend 
                                                    onClick={handleLegendClick}
                                                    wrapperStyle={{ fontSize: 10, fontWeight: 600, cursor: "pointer", paddingTop: 10 }}
                                                />
                                                {trendChart.categories.map((catName: string) => (
                                                    <Line
                                                        key={catName}
                                                        type="monotone"
                                                        dataKey={catName}
                                                        stroke={trendChart.colors[catName] || "#6366F1"}
                                                        strokeWidth={2}
                                                        dot={{ r: 3, strokeWidth: 1 }}
                                                        activeDot={{ r: 5 }}
                                                        opacity={disabledLines[catName] ? 0.08 : 1}
                                                    />
                                                ))}
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Top Merchants / Description Frequency */}
                        <Card className="lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="text-md font-bold text-white/90">Top Merchants</CardTitle>
                                <CardDescription>Frequently logged transaction descriptions.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col justify-center">
                                {loading ? (
                                    <div className="h-[280px] w-full flex items-center justify-center text-muted-foreground">
                                        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading merchants...
                                    </div>
                                ) : merchantsChart.length === 0 ? (
                                    <div className="h-[280px] flex items-center justify-center text-xs text-muted-foreground">
                                        No merchant details recorded.
                                    </div>
                                ) : (
                                    <div className="space-y-4.5 w-full text-left">
                                        {merchantsChart.map((m, idx) => {
                                            const totalCount = merchantsChart.reduce((sum, curr) => sum + curr.count, 0) || 1;
                                            const percentage = (m.count / totalCount) * 100;
                                            const fillColors = ["#6366F1", "#8B5CF6", "#3B82F6", "#EC4899", "#10B981"];
                                            const activeColor = fillColors[idx % fillColors.length];

                                            return (
                                                <div key={m.name} className="space-y-1 text-xs">
                                                    <div className="flex justify-between items-center text-xs font-semibold">
                                                        <span className="text-white/90 font-bold truncate pr-3 max-w-[170px]">{m.name}</span>
                                                        <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground">
                                                            <span className="text-white font-extrabold">${m.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                            <span className="text-[10px]">({m.count} logs)</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Custom styled progress bars */}
                                                    <div className="h-2 w-full bg-white/[0.02] border border-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${percentage}%` }}
                                                            transition={{ duration: 1, ease: "easeOut" }}
                                                            className="h-full rounded-full"
                                                            style={{ backgroundColor: activeColor }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Day of Week spending bar charts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-md font-bold text-white/90">Spending by Day of Week</CardTitle>
                            <CardDescription>Grouped totals demonstrating daily runs within the week.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-0 sm:pl-2">
                            {loading ? (
                                <div className="h-64 w-full flex items-center justify-center text-muted-foreground">
                                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading weekly grids...
                                </div>
                            ) : data.dayOfWeek.length === 0 ? (
                                <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
                                    No day-of-week data recorded.
                                </div>
                            ) : (
                                <div className="w-full h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.dayOfWeek} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.95} />
                                                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.2} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                            <XAxis
                                                dataKey="dayName"
                                                axisLine={false}
                                                tickLine={false}
                                                tickFormatter={(v) => v.slice(0, 3)}
                                                tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 600 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: "#9CA3AF", fontSize: 10, fontWeight: 500 }}
                                            />
                                            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.015)" }} />
                                            <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                                                {data.dayOfWeek.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill="url(#barGradient)" />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

"use client";

import * as React from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { motion, AnimatePresence } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import {
    DollarSign,
    TrendingDown,
    TrendingUp,
    Wallet,
    Percent,
    Trash2,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Tag,
    Clock
} from "lucide-react";

const COLOR_PALETTE = ["#ffffff", "#e2e8f0", "#cbd5e1", "#94a3b8", "#64748b", "#475569", "#334155"];

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import OnboardingWizard from "@/components/OnboardingWizard";

// Refined, professional chart colors
const DONUT_COLORS = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#F97316", "#06B6D4", "#84CC16", "#64748B"];

function MotionCounter({ value, prefix = "", suffix = "", decimals = 2 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
    const [displayVal, setDisplayVal] = React.useState(0);
    
    React.useEffect(() => {
        let startTime: number | null = null;
        const startValue = 0;
        const endValue = value;
        const duration = 1000;
        
        let animationFrameId: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentVal = startValue + easeOutQuart * (endValue - startValue);
            
            setDisplayVal(currentVal);
            
            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                setDisplayVal(endValue);
            }
        };
        
        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [value]);

    return (
        <span>
            {prefix}
            {displayVal.toLocaleString(undefined, { 
                minimumFractionDigits: decimals, 
                maximumFractionDigits: decimals 
            })}
            {suffix}
        </span>
    );
}

function Sparkline({ data, strokeColor }: { data: any[]; strokeColor: string }) {
    return (
        <div className="relative w-full h-12 mt-4 select-none pointer-events-none opacity-100">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                    <Area
                        type="monotone"
                        dataKey="amount"
                        stroke={strokeColor}
                        strokeWidth={1.5}
                        fill="transparent"
                        dot={false}
                        activeDot={false}
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const item = payload[0];
        const label = item.payload.date || item.payload.name || item.name;
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

export interface ExpenseData {
    _id: string;
    amount: number;
    description?: string;
    date: string;
    categoryId?: { name: string; color: string };
}
export interface BudgetData {
    _id: string;
    limit: number;
    month: string;
}

export interface DashboardClientProps {
    initialData: {
        expenses: ExpenseData[];
        budgets: BudgetData[];
        recentExpenses: ExpenseData[];
        prevExpenses?: ExpenseData[];
        prevBudgets?: BudgetData[];
    };
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
    const { data, mutate } = useSWR('/api/dashboard', fetcher, { fallbackData: initialData });
    const expenses = data?.expenses || [];
    const budgets = data?.budgets || [];
    const recentExpenses = data?.recentExpenses || [];
    const [showOnboarding, setShowOnboarding] = React.useState<boolean | null>(null);

    React.useEffect(() => {
        const checkOnboardingStatus = async () => {
            try {
                const res = await fetch("/api/user/preferences");
                if (res.ok) {
                    const data = await res.json();
                    setShowOnboarding(!data.onboardingComplete);
                } else {
                    setShowOnboarding(false);
                }
            } catch (err) {
                setShowOnboarding(false);
            }
        };
        checkOnboardingStatus();
    }, []);

    const prevExpenses = data?.prevExpenses || [];
    const prevBudgets = data?.prevBudgets || [];

    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const totalBudget = budgets.reduce((acc, curr) => acc + curr.limit, 0);
    const remaining = totalBudget - totalExpenses;
    const savingsRate = totalBudget > 0 ? ((totalBudget - totalExpenses) / totalBudget) * 100 : 0;

    const prevTotalExpenses = prevExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const prevTotalBudget = prevBudgets.reduce((acc, curr) => acc + curr.limit, 0);
    const prevRemaining = prevTotalBudget - prevTotalExpenses;
    const prevSavingsRate = prevTotalBudget > 0 ? ((prevTotalBudget - prevTotalExpenses) / prevTotalBudget) * 100 : 0;

    const getMoMChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const expenseMoM = getMoMChange(totalExpenses, prevTotalExpenses);
    const budgetMoM = getMoMChange(totalBudget, prevTotalBudget);
    const remainingMoM = getMoMChange(remaining, prevRemaining);
    const savingsMoMM = savingsRate - prevSavingsRate;

    const totalTransactions = expenses.length;
    const avgTransactionAmount = totalTransactions > 0 ? totalExpenses / totalTransactions : 0;
    const prevTotalTransactions = prevExpenses.length;
    const transactionsMoM = getMoMChange(totalTransactions, prevTotalTransactions);

    const getThirtyDayData = React.useCallback(() => {
        const today = new Date();
        const dates = Array.from({ length: 30 }, (_, i) => {
            const d = new Date();
            d.setDate(today.getDate() - (29 - i));
            return d.toISOString().split("T")[0];
        });

        const dailyMap: Record<string, number> = {};
        dates.forEach(d => dailyMap[d] = 0);

        expenses.forEach(exp => {
            const d = exp.date.split("T")[0];
            if (dailyMap[d] !== undefined) {
                dailyMap[d] += exp.amount;
            }
        });

        return dates.map(d => ({
            date: d,
            value: dailyMap[d]
        }));
    }, [expenses]);

    const areaChartData = React.useMemo(() => getThirtyDayData(), [getThirtyDayData]);
    const spentSparklineData = areaChartData;

    const getDonutData = React.useCallback(() => {
        const catMap: Record<string, number> = {};
        expenses.forEach(exp => {
            const name = exp.categoryId?.name || "Uncategorized";
            catMap[name] = (catMap[name] || 0) + exp.amount;
        });

        return Object.entries(catMap).map(([name, value], i) => ({
            name, value, color: COLOR_PALETTE[i % COLOR_PALETTE.length]
        })).sort((a, b) => b.value - a.value);
    }, [expenses]);

    const donutData = React.useMemo(() => getDonutData(), [getDonutData]);
    const donutTotal = React.useMemo(() => donutData.reduce((acc, curr) => acc + curr.value, 0), [donutData]);

    const handleDeleteExpense = async (id: string) => {
        if (!confirm("Are you sure you want to delete this expense?")) return;
        try {
            const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
            if (res.ok) {
                mutate();
            }
        } catch (error) {}
    };

    if (showOnboarding === null) {
        return (
            <div className="space-y-6 w-full animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2 rounded-xl bg-white/[0.02] border border-white/[0.04] h-40" />
                    <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] h-40" />
                    <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] h-40" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full pb-10">
            {showOnboarding && <OnboardingWizard onComplete={() => window.location.reload()} />}

            {/* Top Stat Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Available Balance */}
                <div className="lg:col-span-2 p-5 rounded-xl bg-[#09090B] border border-white/[0.08] shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Wallet className="w-4 h-4 text-white/50" />
                            <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider">Remaining Budget</h3>
                        </div>
                        <div className="text-3xl font-semibold text-white tracking-tight mb-1">
                            <MotionCounter value={remaining} prefix="$" />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                            <span className={cn(
                                "flex items-center font-medium",
                                remainingMoM >= 0 ? "text-white" : "text-white/60"
                            )}>
                                {remainingMoM >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                                {Math.abs(remainingMoM).toFixed(1)}%
                            </span>
                            <span className="text-white/40">vs last month</span>
                        </div>
                    </div>
                    <div className="mt-6 w-full">
                        <div className="flex justify-between text-[10px] text-white/50 mb-1.5 font-medium">
                            <span>SPENT</span>
                            <span>AVAILABLE</span>
                        </div>
                        <div className="w-full h-1 bg-white/[0.08] rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((totalExpenses / (totalBudget || 1)) * 100, 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Total Spent */}
                <div className="p-5 rounded-xl bg-[#09090B] border border-white/[0.08] shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className="w-4 h-4 text-white/50" />
                            <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider">Total Spent</h3>
                        </div>
                        <div className="text-2xl font-semibold text-white tracking-tight mb-1">
                            <MotionCounter value={totalExpenses} prefix="$" />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                            <span className={cn(
                                "flex items-center font-medium",
                                expenseMoM > 0 ? "text-white" : "text-white/60"
                            )}>
                                {expenseMoM > 0 ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                                {Math.abs(expenseMoM).toFixed(1)}%
                            </span>
                        </div>
                    </div>
                    <Sparkline data={spentSparklineData} strokeColor="#FFFFFF" />
                </div>

                {/* Total Budget */}
                <div className="p-5 rounded-xl bg-[#09090B] border border-white/[0.08] shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="w-4 h-4 text-white/50" />
                            <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider">Total Budget</h3>
                        </div>
                        <div className="text-2xl font-semibold text-white tracking-tight mb-1">
                            <MotionCounter value={totalBudget} prefix="$" />
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                            <span className={cn(
                                "flex items-center font-medium",
                                budgetMoM >= 0 ? "text-white" : "text-white/60"
                            )}>
                                {budgetMoM >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                                {Math.abs(budgetMoM).toFixed(1)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Chart */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-5 rounded-xl bg-[#09090B] border border-white/[0.08] shadow-sm">
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-white">Spending Trends</h3>
                            <p className="text-xs text-white/50 mt-1">Daily expense breakdown over the last 30 days.</p>
                        </div>
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={areaChartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                                        dy={10}
                                        minTickGap={20}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                                        tickFormatter={(val) => `$${val}`}
                                    />
                                    <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="value" 
                                        stroke="#FFFFFF" 
                                        strokeWidth={2}
                                        fillOpacity={1} 
                                        fill="url(#colorAmount)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* Right Column: Allocation Donut & Other Widgets */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-5 rounded-xl bg-[#09090B] border border-white/[0.08] shadow-sm">
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-white">Allocation</h3>
                            <p className="text-xs text-white/50 mt-1">Distribution of expenses by category.</p>
                        </div>
                        
                        {donutData.length === 0 ? (
                            <div className="flex items-center justify-center h-48 text-white/40 text-xs">
                                No data available
                            </div>
                        ) : (
                            <>
                                <div className="h-48 w-full relative mb-6">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={donutData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={2}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {donutData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-[10px] text-white/50 font-medium">TOTAL</span>
                                        <span className="text-lg font-semibold text-white">${donutTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {donutData.slice(0, 5).map((item, index) => {
                                        const percentage = donutTotal > 0 ? (item.value / donutTotal) * 100 : 0;
                                        return (
                                            <div key={item.name} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className="w-2.5 h-2.5 rounded-sm"
                                                        style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
                                                    />
                                                    <span className="text-xs font-medium text-white/80">{item.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-white/50">{percentage.toFixed(0)}%</span>
                                                    <span className="text-xs font-semibold text-white">${item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

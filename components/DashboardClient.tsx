"use client";

import * as React from "react";
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
    Tag,
    Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import OnboardingWizard from "@/components/OnboardingWizard";
import { TableSkeleton } from "@/components/ui/Skeleton";

// Chart Colors matching the custom aurora palette
const DONUT_COLORS = ["#06B6D4", "#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B", "#F97316", "#6366F1"];

// Custom high-performance count-up component using requestAnimationFrame
function MotionCounter({ value, prefix = "", suffix = "", decimals = 2 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
    const [displayVal, setDisplayVal] = React.useState(0);
    
    React.useEffect(() => {
        let startTime: number | null = null;
        const startValue = 0;
        const endValue = value;
        const duration = 1200; // ms
        
        let animationFrameId: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            // Easing: Premium cubic-out curve
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const currentVal = startValue + easeOutCubic * (endValue - startValue);
            
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

// Premium micro-sparkline component
function Sparkline({ data, strokeColor }: { data: any[]; strokeColor: string }) {
    return (
        <div className="relative w-full h-10 mt-3 select-none pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
                    <defs>
                        <linearGradient id={`sparkGlow-${strokeColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={strokeColor} stopOpacity={0.15} />
                            <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                        </linearGradient>
                    </defs>
                    <YAxis hide domain={[(min: number) => min * 0.95 - 5, (max: number) => max * 1.05 + 5]} />
                    <Area
                        type="monotone"
                        dataKey="amount"
                        stroke={strokeColor}
                        strokeWidth={1.5}
                        fill={`url(#sparkGlow-${strokeColor.replace('#', '')})`}
                        dot={false}
                        activeDot={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

// Premium Aurora Tooltip for Recharts
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const item = payload[0];
        const label = item.payload.date || item.payload.name || item.name;
        return (
            <div className="bg-[#0A0E1A]/95 border border-white/[0.08] p-3 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
                <p className="text-xs font-semibold text-slate-400 mb-1">{label}</p>
                <p className="text-sm font-bold text-white">
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
    const [expenses, setExpenses] = React.useState<ExpenseData[]>(initialData.expenses || []);
    const [budgets, setBudgets] = React.useState<BudgetData[]>(initialData.budgets || []);
    const [recentExpenses, setRecentExpenses] = React.useState<ExpenseData[]>(initialData.recentExpenses || []);
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
                console.error("Failed to check onboarding:", err);
                setShowOnboarding(false);
            }
        };
        checkOnboardingStatus();
    }, []);

    const prevExpenses = initialData.prevExpenses || [];
    const prevBudgets = initialData.prevBudgets || [];

    // 1. Core financial calculations
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const totalBudget = budgets.reduce((acc, curr) => acc + curr.limit, 0);
    const remaining = totalBudget - totalExpenses;
    const savingsRate = totalBudget > 0 ? ((totalBudget - totalExpenses) / totalBudget) * 100 : 0;

    // Previous month values for MoM comparison
    const prevTotalExpenses = prevExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const prevTotalBudget = prevBudgets.reduce((acc, curr) => acc + curr.limit, 0);
    const prevRemaining = prevTotalBudget - prevTotalExpenses;
    const prevSavingsRate = prevTotalBudget > 0 ? ((prevTotalBudget - prevTotalExpenses) / prevTotalBudget) * 100 : 0;

    // MoM Percentages
    const getMoMChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const expenseMoM = getMoMChange(totalExpenses, prevTotalExpenses);
    const budgetMoM = getMoMChange(totalBudget, prevTotalBudget);
    const remainingMoM = getMoMChange(remaining, prevRemaining);
    const savingsMoMM = savingsRate - prevSavingsRate; // Direct percentage points change

    // New metrics: Transactions calculations for Bento Grid Card
    const totalTransactions = expenses.length;
    const avgTransactionAmount = totalTransactions > 0 ? totalExpenses / totalTransactions : 0;
    const prevTotalTransactions = prevExpenses.length;
    const transactionsMoM = getMoMChange(totalTransactions, prevTotalTransactions);

    // 2. 30-Day trends calculations for main chart & sparklines
    const getThirtyDayData = () => {
        const dataMap: { [key: string]: number } = {};
        // Seed last 30 days
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
            dataMap[dateStr] = 0;
        }

        // Fill with actual expenses from DB
        expenses.forEach(exp => {
            const dateStr = new Date(exp.date).toLocaleDateString("en-US", { day: "numeric", month: "short" });
            if (dataMap[dateStr] !== undefined) {
                dataMap[dateStr] += exp.amount;
            }
        });

        return Object.keys(dataMap).map(key => ({
            date: key,
            amount: dataMap[key]
        }));
    };

    const areaChartData = React.useMemo(() => getThirtyDayData(), [expenses]);

    // 3. Memoized Sparkline datasets to optimize rendering
    const spentSparklineData = areaChartData;

    const budgetSparklineData = React.useMemo(() => {
        return areaChartData.map(d => ({ date: d.date, amount: totalBudget }));
    }, [areaChartData, totalBudget]);

    const balanceSparklineData = React.useMemo(() => {
        let accumulatedSpent = 0;
        return areaChartData.map(d => {
            accumulatedSpent += d.amount;
            const balance = totalBudget - accumulatedSpent;
            return { date: d.date, amount: balance > 0 ? balance : 0 };
        });
    }, [areaChartData, totalBudget]);

    const transactionsSparklineData = React.useMemo(() => {
        const dataMap: { [key: string]: number } = {};
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
            dataMap[dateStr] = 0;
        }
        expenses.forEach(exp => {
            const dateStr = new Date(exp.date).toLocaleDateString("en-US", { day: "numeric", month: "short" });
            if (dataMap[dateStr] !== undefined) {
                dataMap[dateStr] += 1;
            }
        });
        return Object.keys(dataMap).map(key => ({
            date: key,
            amount: dataMap[key]
        }));
    }, [expenses]);

    const savingsRateSparklineData = React.useMemo(() => {
        let accumulatedSpent = 0;
        return areaChartData.map(d => {
            accumulatedSpent += d.amount;
            const rate = totalBudget > 0 ? ((totalBudget - accumulatedSpent) / totalBudget) * 100 : 0;
            return { date: d.date, amount: rate > 0 ? rate : 0 };
        });
    }, [areaChartData, totalBudget]);

    // 4. Categories data compilation for animated donut chart
    const getDonutData = () => {
        const categoryMap: { [key: string]: number } = {};
        expenses.forEach(exp => {
            const catName = exp.categoryId?.name || "Uncategorized";
            categoryMap[catName] = (categoryMap[catName] || 0) + exp.amount;
        });

        return Object.keys(categoryMap).map(key => ({
            name: key,
            value: categoryMap[key]
        })).sort((a, b) => b.value - a.value);
    };

    const donutData = React.useMemo(() => getDonutData(), [expenses]);
    const donutTotal = React.useMemo(() => donutData.reduce((acc, curr) => acc + curr.value, 0), [donutData]);

    // 5. Delete Expense action
    const handleDeleteExpense = async (id: string) => {
        if (!confirm("Are you sure you want to delete this expense?")) return;
        
        try {
            const res = await fetch(`/api/expenses/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setExpenses(prev => prev.filter(e => e._id !== id));
                setRecentExpenses(prev => prev.filter(e => e._id !== id));
            } else {
                alert("Failed to delete expense.");
            }
        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    };

        // Premium Skeleton Loader layout matching the Bento Grid structure
    if (showOnboarding === null) {
        return (
            <div className="space-y-8 select-none p-4 md:p-8 bg-[#05070F]/20 min-h-screen">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Card 1 Skeleton */}
                    <div className="lg:col-span-2 md:col-span-2 rounded-2xl border border-white/[0.06] bg-[#111827]/60 backdrop-blur-xl h-48 animate-pulse" />
                    {/* Card 2 Skeleton */}
                    <div className="lg:col-span-1 md:col-span-1 rounded-2xl border border-white/[0.06] bg-[#111827]/60 backdrop-blur-xl h-48 animate-pulse" />
                    {/* Card 3 Skeleton */}
                    <div className="lg:col-span-1 md:col-span-1 rounded-2xl border border-white/[0.06] bg-[#111827]/60 backdrop-blur-xl h-48 animate-pulse" />
                    {/* Card 4 Skeleton */}
                    <div className="lg:col-span-2 md:col-span-2 rounded-2xl border border-white/[0.06] bg-[#111827]/60 backdrop-blur-xl h-48 animate-pulse" />
                    {/* Card 5 Skeleton */}
                    <div className="lg:col-span-2 md:col-span-2 rounded-2xl border border-white/[0.06] bg-[#111827]/60 backdrop-blur-xl h-48 animate-pulse" />
                    {/* Card 6 Skeleton */}
                    <div className="lg:col-span-4 md:col-span-2 rounded-2xl border border-white/[0.06] bg-[#111827]/60 backdrop-blur-xl h-[380px] animate-pulse" />
                    {/* Card 7 Skeleton */}
                    <div className="lg:col-span-2 md:col-span-2 rounded-2xl border border-white/[0.06] bg-[#111827]/60 backdrop-blur-xl h-80 animate-pulse" />
                    {/* Card 8 Skeleton */}
                    <div className="lg:col-span-2 md:col-span-2 rounded-2xl border border-white/[0.06] bg-[#111827]/60 backdrop-blur-xl h-80 animate-pulse" />
                </div>
            </div>
        );
    }

    const spentPercent = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

    return (
        <div className="space-y-8 select-none">
            {showOnboarding && (
                <OnboardingWizard onComplete={() => window.location.reload()} />
            )}

            {/* Asymmetric Bento Grid Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Hero Stat Card: Balance (Remaining Budget) - spans 2 columns */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="lg:col-span-2 md:col-span-2 relative p-6 rounded-2xl border border-white/[0.06] bg-[#111827]/60 backdrop-blur-xl overflow-hidden group transition-all duration-300 hover:border-cyan-400/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] flex flex-col justify-between"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Available Balance</span>
                                <h3 className="text-slate-500 text-[10px] uppercase font-semibold tracking-wide mt-0.5">Remaining Budget</h3>
                            </div>
                            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/15">
                                <Wallet className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                            <MotionCounter value={remaining} prefix="$" />
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] mb-4">
                            <span className={cn(
                                "font-bold flex items-center gap-0.5",
                                remainingMoM >= 0 ? "text-emerald-400" : "text-rose-400"
                            )}>
                                {remainingMoM >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                {Math.abs(remainingMoM).toFixed(1)}%
                            </span>
                            <span className="text-slate-400/60">vs last month</span>
                        </div>
                    </div>

                    {/* Spent vs Budget mini-bar indicator */}
                    <div className="w-full mb-3">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1.5">
                            <span>SPENT ({spentPercent.toFixed(0)}%)</span>
                            <span>AVAILABLE ({(100 - spentPercent).toFixed(0)}%)</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/[0.04] overflow-hidden border border-white/[0.02]">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(spentPercent, 100)}%` }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-cyan-500 to-violet-500"
                            />
                        </div>
                    </div>

                    <Sparkline data={balanceSparklineData} strokeColor="#06B6D4" />
                </motion.div>

                {/* 2. Stat Card: Total Spent - spans 1 column */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.05 }}
                    className="lg:col-span-1 md:col-span-1 relative p-6 rounded-2xl border border-white/[0.06] bg-[#111827]/60 backdrop-blur-xl overflow-hidden group transition-all duration-300 hover:border-pink-500/20 hover:shadow-[0_0_30px_rgba(236,72,153,0.1)] flex flex-col justify-between"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Spent</span>
                            <div className="p-3 bg-pink-500/10 text-pink-400 rounded-xl border border-pink-500/15">
                                <TrendingDown className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                            <MotionCounter value={totalExpenses} prefix="$" />
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] mb-3">
                            <span className={cn(
                                "font-bold flex items-center gap-0.5",
                                expenseMoM > 0 ? "text-rose-400" : "text-emerald-400"
                            )}>
                                {expenseMoM > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                {Math.abs(expenseMoM).toFixed(1)}%
                            </span>
                            <span className="text-slate-400/60">vs last month</span>
                        </div>
                    </div>
                    <Sparkline data={spentSparklineData} strokeColor="#EC4899" />
                </motion.div>

                {/* 3. Stat Card: Total Budget - spans 1 column */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 }}
                    className="lg:col-span-1 md:col-span-1 relative p-6 rounded-2xl border border-white/[0.06] bg-[#111827]/60 backdrop-blur-xl overflow-hidden group transition-all duration-300 hover:border-violet-500/20 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)] flex flex-col justify-between"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Budget</span>
                            <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/15">
                                <DollarSign className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                            <MotionCounter value={totalBudget} prefix="$" />
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] mb-3">
                            <span className={cn(
                                "font-bold flex items-center gap-0.5",
                                budgetMoM >= 0 ? "text-emerald-400" : "text-rose-400"
                            )}>
                                {budgetMoM >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                {Math.abs(budgetMoM).toFixed(1)}%
                            </span>
                            <span className="text-slate-400/60">vs last month</span>
                        </div>
                    </div>
                    <Sparkline data={budgetSparklineData} strokeColor="#8B5CF6" />
                </motion.div>

                {/* 4. Stat Card: Transactions Activity - spans 2 columns */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.15 }}
                    className="lg:col-span-2 md:col-span-2 relative p-6 rounded-2xl border border-white/[0.06] bg-[#111827]/60 backdrop-blur-xl overflow-hidden group transition-all duration-300 hover:border-blue-500/20 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] flex flex-col justify-between"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Transactions Activity</span>
                                <h3 className="text-slate-500 text-[10px] uppercase font-semibold tracking-wide mt-0.5">Entries Recorded</h3>
                            </div>
                            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/15">
                                <Tag className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                            <MotionCounter value={totalTransactions} decimals={0} />
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] mb-4">
                            <span className={cn(
                                "font-bold flex items-center gap-0.5",
                                transactionsMoM >= 0 ? "text-emerald-400" : "text-rose-400"
                            )}>
                                {transactionsMoM >= 0 ? "+" : ""}
                                {transactionsMoM.toFixed(1)}%
                            </span>
                            <span className="text-slate-400/60">MoM change</span>
                        </div>
                    </div>

                    {/* Quick transactional sub-stats */}
                    <div className="w-full flex gap-4 mb-3">
                        <div className="flex-1 bg-white/[0.02] border border-white/[0.04] rounded-xl p-2.5 text-center">
                            <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">Average Spend</span>
                            <span className="text-sm font-extrabold text-white">
                                <MotionCounter value={avgTransactionAmount} prefix="$" decimals={2} />
                            </span>
                        </div>
                        <div className="flex-1 bg-white/[0.02] border border-white/[0.04] rounded-xl p-2.5 text-center">
                            <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">MoM Transactions</span>
                            <span className="text-sm font-extrabold text-white">
                                <MotionCounter value={prevTotalTransactions} decimals={0} />
                                <span className="text-[10px] text-slate-400 font-semibold ml-1">last mo.</span>
                            </span>
                        </div>
                    </div>

                    <Sparkline data={transactionsSparklineData} strokeColor="#3B82F6" />
                </motion.div>

                {/* 5. Stat Card: Savings Rate Indicator - spans 2 columns */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.2 }}
                    className="lg:col-span-2 md:col-span-2 relative p-6 rounded-2xl border border-white/[0.06] bg-[#111827]/60 backdrop-blur-xl overflow-hidden group transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] flex flex-col justify-between"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Savings Metrics</span>
                                <h3 className="text-slate-500 text-[10px] uppercase font-semibold tracking-wide mt-0.5">Budget Preservation</h3>
                            </div>
                            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/15">
                                <Percent className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">
                            <MotionCounter value={savingsRate} suffix="%" />
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] mb-4">
                            <span className={cn(
                                "font-bold flex items-center gap-0.5",
                                savingsMoMM >= 0 ? "text-emerald-400" : "text-rose-400"
                            )}>
                                {savingsMoMM >= 0 ? "+" : ""}
                                {savingsMoMM.toFixed(1)}%
                            </span>
                            <span className="text-slate-400/60">MoM change</span>
                        </div>
                    </div>

                    {/* Savings Rate Goal Bar */}
                    <div className="w-full mb-3">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold mb-1.5">
                            <span>CURRENT PROGRESS</span>
                            <span>{savingsRate.toFixed(0)}% RATE</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/[0.04] overflow-hidden border border-white/[0.02]">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                            />
                        </div>
                    </div>

                    <Sparkline data={savingsRateSparklineData} strokeColor="#10B981" />
                </motion.div>

                {/* 6. Spending Trends Area Chart - spans full 4 columns */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.25 }}
                    className="lg:col-span-4 md:col-span-2"
                >
                    <Card className="bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] hover:border-cyan-400/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all duration-300 overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-md font-bold text-white/90">Spending Trends</CardTitle>
                                <CardDescription className="text-xs text-slate-400">Visual tracker of your last 30 days of expenses.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="pl-0 sm:pl-2">
                            <div className="w-full h-[320px]">
                                <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                    <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="auroraArea" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#06B6D4" />
                                                <stop offset="50%" stopColor="#8B5CF6" />
                                                <stop offset="100%" stopColor="#EC4899" />
                                            </linearGradient>
                                            <linearGradient id="auroraAreaFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2} />
                                                <stop offset="50%" stopColor="#8B5CF6" stopOpacity={0.1} />
                                                <stop offset="100%" stopColor="#EC4899" stopOpacity={0.0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 500 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 500 }}
                                        />
                                        <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(99,102,241,0.15)", strokeWidth: 1 }} />
                                        <Area
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="url(#auroraArea)"
                                            strokeWidth={2.5}
                                            fillOpacity={1}
                                            fill="url(#auroraAreaFill)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* 7. Donut Distribution & Recent Transactions - spans side-by-side (2 columns each) */}
                
                {/* Donut Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.3 }}
                    className="lg:col-span-2 md:col-span-2"
                >
                    <Card className="bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] hover:border-cyan-400/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all duration-300 h-full flex flex-col justify-between">
                        <CardHeader>
                            <CardTitle className="text-md font-bold text-white/90">Category Distribution</CardTitle>
                            <CardDescription className="text-xs text-slate-400">Where your funds have been allocated.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center flex-1 py-4">
                            {donutData.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-[240px] text-slate-400/60 text-sm w-full">
                                    <Clock className="w-10 h-10 mb-2 opacity-40" />
                                    No category data found
                                </div>
                            ) : (
                                <div className="relative w-full flex flex-col sm:flex-row items-center gap-6">
                                    <div className="w-full sm:w-1/2 min-w-[180px] h-[180px] relative flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={donutData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={62}
                                                    outerRadius={78}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                    stroke="none"
                                                    animationBegin={0}
                                                    animationDuration={1000}
                                                >
                                                    {donutData.map((entry, index) => (
                                                        <Cell 
                                                            key={`cell-${index}`} 
                                                            fill={DONUT_COLORS[index % DONUT_COLORS.length]} 
                                                        />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip content={<CustomTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Spent</span>
                                            <span className="text-xl font-extrabold text-white">
                                                <MotionCounter value={totalExpenses} prefix="$" decimals={0} />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 w-full flex flex-col space-y-2 text-left justify-center">
                                        {donutData.slice(0, 5).map((item, index) => {
                                            const percentage = donutTotal > 0 ? (item.value / donutTotal) * 100 : 0;
                                            return (
                                                <div key={item.name} className="flex items-center justify-between text-xs py-1 border-b border-white/[0.02] last:border-0 hover:bg-white/[0.01] px-1 rounded transition-colors">
                                                    <div className="flex items-center gap-2 truncate pr-2">
                                                        <span 
                                                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_6px_var(--color-bg)]" 
                                                            style={{ 
                                                                backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length],
                                                                // @ts-ignore
                                                                "--color-bg": DONUT_COLORS[index % DONUT_COLORS.length]
                                                            }} 
                                                        />
                                                        <span className="text-slate-300 font-medium truncate">{item.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <span className="font-bold text-white">${item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                        <span className="text-[10px] text-slate-400 font-semibold">({percentage.toFixed(0)}%)</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Recent Transactions List */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.35 }}
                    className="lg:col-span-2 md:col-span-2"
                >
                    <Card className="bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] hover:border-cyan-400/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all duration-300 h-full flex flex-col justify-between overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-md font-bold text-white/90">Recent Transactions</CardTitle>
                                <CardDescription className="text-xs text-slate-400">Review and manage your last 10 entries.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 flex flex-col justify-center">
                            {recentExpenses.length === 0 ? (
                                <div className="p-10 flex flex-col items-center justify-center text-slate-400/60 text-sm">
                                    <Tag className="w-10 h-10 mb-2 opacity-40 animate-pulse" />
                                    No transactions recorded this month.
                                </div>
                            ) : (
                                <div className="overflow-x-auto w-full">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/[0.04] text-[10px] font-bold uppercase tracking-wider text-slate-400/80">
                                                <th className="py-3 px-5">Description</th>
                                                <th className="py-3 px-5">Category</th>
                                                <th className="py-3 px-5">Date</th>
                                                <th className="py-3 px-5 text-right">Amount</th>
                                                <th className="py-3 px-5 w-14"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <AnimatePresence>
                                                {recentExpenses.map((exp) => {
                                                    const category = exp.categoryId || { name: "Uncategorized", color: "#6B7280" };
                                                    return (
                                                        <motion.tr
                                                            key={exp._id}
                                                            initial={{ opacity: 1 }}
                                                            exit={{ opacity: 0, x: -20, height: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="border-b border-white/[0.04] hover:bg-white/[0.015] group transition-all"
                                                        >
                                                            <td className="py-3 px-5 font-semibold text-slate-200">
                                                                {exp.description}
                                                            </td>
                                                            <td className="py-3 px-5">
                                                                <div className="flex items-center gap-2">
                                                                    <span 
                                                                        className="w-2 h-2 rounded-full shrink-0" 
                                                                        style={{ backgroundColor: category.color || "#6B7280" }} 
                                                                    />
                                                                    <span className="text-slate-400 font-medium text-xs">{category.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-5 text-slate-400 text-xs">
                                                                {new Date(exp.date).toLocaleDateString("en-US", { 
                                                                    year: "numeric", 
                                                                    month: "short", 
                                                                    day: "numeric" 
                                                                })}
                                                            </td>
                                                            <td className="py-3 px-5 text-right font-bold text-white">
                                                                ${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                            </td>
                                                            <td className="py-1.5 px-3 text-center">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDeleteExpense(exp._id)}
                                                                    className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 p-1.5 rounded-xl h-8 w-8 flex items-center justify-center"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </td>
                                                        </motion.tr>
                                                    );
                                                })}
                                            </AnimatePresence>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

            </div>
        </div>
    );
}

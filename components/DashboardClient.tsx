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
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import OnboardingWizard from "@/components/OnboardingWizard";
import { TableSkeleton } from "@/components/ui/Skeleton";

// Preset colors for donut charts
const DONUT_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6", "#14B8A6", "#F43F5E"];

// Micro-animation for stats numbers
function AnimatedNumber({ value, prefix = "", suffix = "" }) {
    const [displayVal, setDisplayVal] = React.useState(0);
    
    React.useEffect(() => {
        let start = 0;
        const end = parseFloat(value);
        if (isNaN(end)) {
            setDisplayVal(value);
            return;
        }
        if (end === 0) {
            setDisplayVal(0);
            return;
        }
        
        const duration = 1200; // ms
        const steps = 60;
        const stepTime = duration / steps;
        const increment = end / steps;
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                clearInterval(timer);
                setDisplayVal(end);
            } else {
                setDisplayVal(start);
            }
        }, stepTime);
        
        return () => clearInterval(timer);
    }, [value]);

    return (
        <span>
            {prefix}
            {displayVal.toLocaleString(undefined, { 
                minimumFractionDigits: 0, 
                maximumFractionDigits: 2 
            })}
            {suffix}
        </span>
    );
}
const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const item = payload[0];
        const label = item.payload.date || item.payload.name || item.name;
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

    const [showOnboarding, setShowOnboarding] = React.useState(null);

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

    // 1. Calculations
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const totalBudget = budgets.reduce((acc, curr) => acc + curr.limit, 0);
    const remaining = totalBudget - totalExpenses;
    const savingsRate = totalBudget > 0 ? ((totalBudget - totalExpenses) / totalBudget) * 100 : 0;

    // Previous month values for MoM
    const prevTotalExpenses = prevExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const prevTotalBudget = prevBudgets.reduce((acc, curr) => acc + curr.limit, 0);
    const prevRemaining = prevTotalBudget - prevTotalExpenses;
    const prevSavingsRate = prevTotalBudget > 0 ? ((prevTotalBudget - prevTotalExpenses) / prevTotalBudget) * 100 : 0;

    // MoM Percentages
    const getMoMChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    };

    const expenseMoM = getMoMChange(totalExpenses, prevTotalExpenses);
    const budgetMoM = getMoMChange(totalBudget, prevTotalBudget);
    const remainingMoM = getMoMChange(remaining, prevRemaining);
    const savingsMoMM = savingsRate - prevSavingsRate; // direct percentage points difference

    // 2. Prepare 30-day Area Chart Data
    const getThirtyDayData = () => {
        const dataMap = {};
        // Seed last 30 days
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
            dataMap[dateStr] = 0;
        }

        // Fill with actual database expenses
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

    const areaChartData = getThirtyDayData();

    // 3. Prepare Donut Chart Data (Categories)
    const getDonutData = () => {
        const categoryMap = {};
        expenses.forEach(exp => {
            const catName = exp.categoryId?.name || "Uncategorized";
            categoryMap[catName] = (categoryMap[catName] || 0) + exp.amount;
        });

        return Object.keys(categoryMap).map(key => ({
            name: key,
            value: categoryMap[key]
        })).sort((a, b) => b.value - a.value);
    };

    const donutData = getDonutData();
    const donutTotal = donutData.reduce((acc, curr) => acc + curr.value, 0);

    // 4. Handle expense deletion
    const handleDeleteExpense = async (id) => {
        if (!confirm("Are you sure you want to delete this expense?")) return;
        
        try {
            const res = await fetch(`/api/expenses/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                // Instantly remove from local states
                setExpenses(prev => prev.filter(e => e._id !== id));
                setRecentExpenses(prev => prev.filter(e => e._id !== id));
            } else {
                alert("Failed to delete expense.");
            }
        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    };

    if (showOnboarding === null) {
        return (
            <div className="space-y-8 select-none p-4 md:p-8 animate-pulse">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="rounded-2xl border border-[#2A2D3E] bg-[#1A1D2E] p-6 space-y-4">
                            <div className="h-4 bg-[#2A2D3E] w-1/3 rounded" />
                            <div className="h-8 bg-[#2A2D3E] w-2/3 rounded" />
                            <div className="h-3 bg-[#2A2D3E] w-1/2 rounded" />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                    <div className="lg:col-span-4 h-80 rounded-2xl border border-[#2A2D3E] bg-[#1A1D2E]" />
                    <div className="lg:col-span-3 h-80 rounded-2xl border border-[#2A2D3E] bg-[#1A1D2E]" />
                </div>
                <TableSkeleton rows={5} />
            </div>
        );
    }

    return (
        <div className="space-y-8 select-none">
            {showOnboarding && (
                <OnboardingWizard onComplete={() => window.location.reload()} />
            )}
            {/* 1. Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Card 1: Total Spent */}
                <motion.div
                    whileHover={{ y: -4 }}
                    className="relative p-5 rounded-2xl border border-white/5 bg-card/60 backdrop-blur-xl overflow-hidden group transition-all duration-300 hover:border-primary/20 hover:shadow-[0_0_20px_rgba(99,102,241,0.05)]"
                >
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Spent</span>
                        <div className="p-2.5 bg-destructive/10 text-destructive rounded-xl border border-destructive/15">
                            <TrendingDown className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-2">
                        <AnimatedNumber value={totalExpenses} prefix="$" />
                    </div>
                    <div className="flex items-center gap-1 text-[11px]">
                        <span className={cn(
                            "font-bold flex items-center",
                            expenseMoM > 0 ? "text-destructive" : "text-success"
                        )}>
                            {expenseMoM > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                            {Math.abs(expenseMoM).toFixed(1)}%
                        </span>
                        <span className="text-muted-foreground/60">vs last month</span>
                    </div>
                </motion.div>

                {/* Card 2: Total Budget */}
                <motion.div
                    whileHover={{ y: -4 }}
                    className="relative p-5 rounded-2xl border border-white/5 bg-card/60 backdrop-blur-xl overflow-hidden group transition-all duration-300 hover:border-primary/20 hover:shadow-[0_0_20px_rgba(99,102,241,0.05)]"
                >
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Budget</span>
                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/15">
                            <Wallet className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-2">
                        <AnimatedNumber value={totalBudget} prefix="$" />
                    </div>
                    <div className="flex items-center gap-1 text-[11px]">
                        <span className={cn(
                            "font-bold flex items-center",
                            budgetMoM >= 0 ? "text-success" : "text-destructive"
                        )}>
                            {budgetMoM >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 text-success" /> : <TrendingDown className="w-3.5 h-3.5 text-destructive" />}
                            {Math.abs(budgetMoM).toFixed(1)}%
                        </span>
                        <span className="text-muted-foreground/60">vs last month</span>
                    </div>
                </motion.div>

                {/* Card 3: Remaining Budget */}
                <motion.div
                    whileHover={{ y: -4 }}
                    className="relative p-5 rounded-2xl border border-white/5 bg-card/60 backdrop-blur-xl overflow-hidden group transition-all duration-300 hover:border-primary/20 hover:shadow-[0_0_20px_rgba(99,102,241,0.05)]"
                >
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Remaining</span>
                        <div className="p-2.5 bg-success/10 text-success rounded-xl border border-success/15">
                            <DollarSign className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-2">
                        <AnimatedNumber value={remaining} prefix="$" />
                    </div>
                    <div className="flex items-center gap-1 text-[11px]">
                        <span className={cn(
                            "font-bold flex items-center",
                            remainingMoM >= 0 ? "text-success" : "text-destructive"
                        )}>
                            {remainingMoM >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                            {Math.abs(remainingMoM).toFixed(1)}%
                        </span>
                        <span className="text-muted-foreground/60">vs last month</span>
                    </div>
                </motion.div>

                {/* Card 4: Savings Rate */}
                <motion.div
                    whileHover={{ y: -4 }}
                    className="relative p-5 rounded-2xl border border-white/5 bg-card/60 backdrop-blur-xl overflow-hidden group transition-all duration-300 hover:border-primary/20 hover:shadow-[0_0_20px_rgba(99,102,241,0.05)]"
                >
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Savings Rate</span>
                        <div className="p-2.5 bg-warning/10 text-warning rounded-xl border border-warning/15">
                            <Percent className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-2">
                        <AnimatedNumber value={savingsRate} suffix="%" />
                    </div>
                    <div className="flex items-center gap-1 text-[11px]">
                        <span className={cn(
                            "font-bold flex items-center",
                            savingsMoMM >= 0 ? "text-success" : "text-destructive"
                        )}>
                            {savingsMoMM >= 0 ? "+" : ""}
                            {savingsMoMM.toFixed(1)}%
                        </span>
                        <span className="text-muted-foreground/60">MoM change</span>
                    </div>
                </motion.div>
            </div>

            {/* 2. Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                {/* 30-Day spending Line/Area Chart */}
                <Card className="lg:col-span-4 hover:border-white/10 transition-colors">
                    <CardHeader>
                        <CardTitle className="text-md font-bold text-white/90">Spending Trends</CardTitle>
                        <CardDescription>Visual tracker of your last 30 days of expenses.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0 sm:pl-2">
                        <div className="w-full h-[320px]">
                            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                <AreaChart data={areaChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="indigoGlow" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                    <XAxis
                                        dataKey="date"
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
                                    <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(99,102,241,0.2)", strokeWidth: 1 }} />
                                    <Area
                                        type="monotone"
                                        dataKey="amount"
                                        stroke="#6366F1"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#indigoGlow)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Donut Distribution Chart */}
                <Card className="lg:col-span-3 hover:border-white/10 transition-colors">
                    <CardHeader>
                        <CardTitle className="text-md font-bold text-white/90">Category Distribution</CardTitle>
                        <CardDescription>Where your funds have been allocated.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center">
                        {donutData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[280px] text-muted-foreground/60 text-sm">
                                <Clock className="w-10 h-10 mb-2 opacity-40" />
                                No category data found
                            </div>
                        ) : (
                            <div className="w-full flex flex-col sm:flex-row items-center gap-6">
                                <div className="w-1/2 min-w-[150px] h-[160px] relative flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                                        <PieChart>
                                            <Pie
                                                data={donutData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={65}
                                                paddingAngle={4}
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
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total</span>
                                        <span className="text-lg font-extrabold text-white">${totalExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    </div>
                                </div>
                                <div className="flex-1 w-full flex flex-col space-y-2 text-left">
                                    {donutData.slice(0, 5).map((item, index) => {
                                        const percentage = donutTotal > 0 ? (item.value / donutTotal) * 100 : 0;
                                        return (
                                            <div key={item.name} className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2 truncate pr-2">
                                                    <span 
                                                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                                                        style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }} 
                                                    />
                                                    <span className="text-muted-foreground font-medium truncate">{item.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <span className="font-semibold text-white/95">${item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                    <span className="text-[10px] text-muted-foreground/60">({percentage.toFixed(0)}%)</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* 3. Recent Expenses Section */}
            <Card className="hover:border-white/10 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="text-left">
                        <CardTitle className="text-md font-bold text-white/90">Recent Transactions</CardTitle>
                        <CardDescription>Review and manage your last 10 entries.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {recentExpenses.length === 0 ? (
                        <div className="p-10 flex flex-col items-center justify-center text-muted-foreground/60 text-sm">
                            <Tag className="w-10 h-10 mb-2 opacity-40 animate-pulse" />
                            No transactions recorded this month.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                                        <th className="py-4 px-6">Description</th>
                                        <th className="py-4 px-6">Category</th>
                                        <th className="py-4 px-6">Date</th>
                                        <th className="py-4 px-6 text-right">Amount</th>
                                        <th className="py-4 px-6 w-16"></th>
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
                                                    className="border-b border-white/5 hover:bg-white/[0.015] group transition-all"
                                                >
                                                    <td className="py-4 px-6 font-semibold text-white/90">
                                                        {exp.description}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <span 
                                                                className="w-2.5 h-2.5 rounded-full shrink-0" 
                                                                style={{ backgroundColor: category.color || "#6B7280" }} 
                                                            />
                                                            <span className="text-muted-foreground font-medium">{category.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-muted-foreground/85">
                                                        {new Date(exp.date).toLocaleDateString("en-US", { 
                                                            year: "numeric", 
                                                            month: "short", 
                                                            day: "numeric" 
                                                        })}
                                                    </td>
                                                    <td className="py-4 px-6 text-right font-bold text-white/95">
                                                        ${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </td>
                                                    <td className="py-2 px-4 text-center">
                                                        {/* Hover Trashcan Deletion Button */}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleDeleteExpense(exp._id)}
                                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100 p-2 rounded-xl"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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
        </div>
    );
}

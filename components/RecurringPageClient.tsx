"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Repeat,
    Plus,
    Trash2,
    Calendar,
    DollarSign,
    AlertCircle,
    Play,
    Pause,
    X,
    Clock,
    Tag,
    ChevronDown,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Toggle } from "@/components/ui/Toggle";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/lib/toast-context";
import { cn } from "@/lib/utils";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function RecurringPageClient() {
    const { success, error, info } = useToast();
    const [expenses, setExpenses] = React.useState<any[]>([]);
    const [categories, setCategories] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [userCurrency, setUserCurrency] = React.useState("USD");

    // Search & filters
    const [searchTerm, setSearchTerm] = React.useState("");

    // Drawer States
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
    const [formSubmitting, setFormSubmitting] = React.useState(false);
    const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
    const [formData, setFormData] = React.useState({
        description: "",
        amount: "",
        categoryId: "",
        date: new Date().toISOString().slice(0, 10),
        recurrenceInterval: "monthly",
        note: ""
    });

    // Fetch user preferences for currency
    const fetchPreferences = React.useCallback(async () => {
        try {
            const res = await fetch("/api/user/preferences");
            if (res.ok) {
                const data = await res.json();
                if (data.currency) {
                    setUserCurrency(data.currency);
                }
            }
        } catch (err) {
            console.error("Error fetching preferences:", err);
        }
    }, []);

    // Fetch all expenses and filter recurring templates client-side
    const fetchExpenses = React.useCallback(async () => {
        setLoading(true);
        try {
            // Get a batch of expenses
            const res = await fetch("/api/expenses?limit=1000");
            if (res.ok) {
                const data = await res.json();
                // Filter where isRecurring is true
                const recurringItems = (data.expenses || []).filter((item: any) => item.isRecurring === true);
                setExpenses(recurringItems);
            }
        } catch (err) {
            console.error("Error fetching recurring expenses:", err);
            error("Failed to load recurring transactions.");
        } finally {
            setLoading(false);
        }
    }, [error]);

    // Fetch categories for form
    const fetchCategories = React.useCallback(async () => {
        try {
            const res = await fetch("/api/categories");
            if (res.ok) {
                const data = await res.json();
                setCategories(data || []);
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    }, []);

    React.useEffect(() => {
        Promise.all([
            fetchPreferences(),
            fetchExpenses(),
            fetchCategories()
        ]);
    }, [fetchPreferences, fetchExpenses, fetchCategories]);

    // Helper functions for next due date maths
    const getNextDueDate = (expense: any) => {
        const baseDate = new Date(expense.lastProcessedAt || expense.date);
        const nextDate = new Date(baseDate);
        if (expense.recurrenceInterval === "weekly") {
            nextDate.setDate(nextDate.getDate() + 7);
        } else if (expense.recurrenceInterval === "monthly") {
            nextDate.setMonth(nextDate.getMonth() + 1);
        }
        return nextDate;
    };

    const getDaysRemaining = (nextDueDate: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(nextDueDate);
        due.setHours(0, 0, 0, 0);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Format currency helper
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: userCurrency,
        }).format(val);
    };

    // Format Date helper
    const formatDate = (dateString: string | Date) => {
        const dateObj = new Date(dateString);
        return dateObj.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    // Toggle Pause/Active status switch
    const handleStatusToggle = async (expense: any) => {
        const updatedIsPaused = !expense.isPaused;
        try {
            const res = await fetch(`/api/expenses/${expense._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isPaused: updatedIsPaused })
            });

            if (res.ok) {
                // Update state
                setExpenses(prev =>
                    prev.map(item =>
                        item._id === expense._id ? { ...item, isPaused: updatedIsPaused } : item
                    )
                );
                success(
                    updatedIsPaused
                        ? `Paused recurring expense "${expense.description}"`
                        : `Activated recurring expense "${expense.description}"`
                );
            } else {
                error("Failed to update status.");
            }
        } catch (err) {
            console.error("Error toggling recurring status:", err);
            error("Something went wrong updating status.");
        }
    };

    // Individual Delete template handler
    const handleDeleteTemplate = async (expense: any) => {
        if (!confirm(`Are you sure you want to cancel and delete the recurring schedule for "${expense.description}"?`)) return;

        try {
            const res = await fetch(`/api/expenses/${expense._id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                setExpenses(prev => prev.filter(item => item._id !== expense._id));
                success("Successfully removed recurring schedule.");
            } else {
                error("Failed to delete recurring expense.");
            }
        } catch (err) {
            console.error("Error deleting template:", err);
            error("Something went wrong.");
        }
    };

    // Form submit handler
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors: Record<string, string> = {};

        if (!formData.description.trim()) {
            errors.description = "Description is required.";
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            errors.amount = "Amount must be greater than zero.";
        }
        if (!formData.categoryId) {
            errors.categoryId = "Please select a category.";
        }
        if (!formData.date) {
            errors.date = "Anchor date is required.";
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setFormErrors({});
        setFormSubmitting(true);

        try {
            const res = await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: parseFloat(formData.amount),
                    categoryId: formData.categoryId,
                    description: formData.description,
                    date: new Date(formData.date),
                    note: formData.note,
                    isRecurring: true,
                    recurrenceInterval: formData.recurrenceInterval,
                    isPaused: false
                })
            });

            if (res.ok) {
                setIsDrawerOpen(false);
                // Reset form fields
                setFormData({
                    description: "",
                    amount: "",
                    categoryId: "",
                    date: new Date().toISOString().slice(0, 10),
                    recurrenceInterval: "monthly",
                    note: ""
                });
                success("Successfully created recurring schedule!");
                fetchExpenses();
            } else {
                const data = await res.json();
                error(data.message || "Failed to create recurring expense.");
            }
        } catch (err) {
            console.error("Error submitting recurring expense:", err);
            error("Failed to create recurring expense.");
        } finally {
            setFormSubmitting(false);
        }
    };

    // Search filtering
    const filteredExpenses = expenses.filter(item =>
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.note && item.note.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Bento commitment metrics logic
    const activeExpenses = expenses.filter(e => !e.isPaused);
    const pausedExpenses = expenses.filter(e => e.isPaused);

    const monthlyTotal = activeExpenses.reduce((acc, curr) => {
        const mult = curr.recurrenceInterval === "weekly" ? 4.33 : 1;
        return acc + (curr.amount * mult);
    }, 0);

    const weeklyTotal = activeExpenses.reduce((acc, curr) => {
        const mult = curr.recurrenceInterval === "monthly" ? 0.23 : 1;
        return acc + (curr.amount * mult);
    }, 0);

    const annualTotal = monthlyTotal * 12;

    // Upcoming subscriptions (top 3 closest due)
    const upcomingExpenses = expenses
        .map(exp => {
            const nextDue = getNextDueDate(exp);
            const daysRemaining = getDaysRemaining(nextDue);
            return { ...exp, nextDue, daysRemaining };
        })
        .sort((a, b) => {
            if (a.isPaused && !b.isPaused) return 1;
            if (!a.isPaused && b.isPaused) return -1;
            return a.daysRemaining - b.daysRemaining;
        })
        .slice(0, 3);

    // Estimation Radial Chart Data
    const hasCommitments = weeklyTotal > 0 || monthlyTotal > 0;
    const radialData = [
        { name: "Weekly", value: weeklyTotal, color: "#06B6D4" },
        { name: "Monthly", value: monthlyTotal, color: "#8B5CF6" }
    ];
    const processedRadialData = hasCommitments
        ? radialData.filter(d => d.value > 0)
        : [{ name: "No Commitments", value: 1, color: "rgba(255, 255, 255, 0.06)" }];

    return (
        <div className="space-y-8 text-left select-none relative">
            {/* Header section with Aurora Gradient button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-[#F1F5F9] bg-clip-text">
                        Recurring Commitments
                    </h1>
                    <p className="text-sm text-[#94A3B8] mt-1">
                        Automate subscriptions, monitor ongoing schedules, and foresee projected cash flows.
                    </p>
                </div>
                <Button 
                    onClick={() => setIsDrawerOpen(true)}
                    className="bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.35)]"
                >
                    <Plus className="w-4.5 h-4.5 mr-2" /> Add Recurring
                </Button>
            </div>

            {/* Premium Bento Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Bento Card 1: Cost Estimation Overview */}
                <Card className="bg-[#111827]/60 backdrop-blur-xl border-white/[0.06] overflow-hidden flex flex-col justify-between">
                    <CardContent className="p-6 h-full flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Monthly Commitment</p>
                                    <h3 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 mt-1.5 drop-shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                                        {formatCurrency(monthlyTotal)}
                                    </h3>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="p-3.5 rounded-xl bg-[#0A0E1A]/40 border border-white/[0.04]">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">Weekly Commitment</p>
                                    <p className="text-base font-bold text-[#F1F5F9] mt-0.5">{formatCurrency(weeklyTotal)}</p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-[#0A0E1A]/40 border border-white/[0.04]">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">Annual Commitment</p>
                                    <p className="text-base font-bold text-[#F1F5F9] mt-0.5">{formatCurrency(annualTotal)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mt-6 border-t border-white/[0.04] pt-4">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
                                <span className="text-xs text-[#94A3B8]">
                                    <strong className="text-[#F1F5F9]">{activeExpenses.length}</strong> Active
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                                <span className="text-xs text-[#94A3B8]">
                                    <strong className="text-[#F1F5F9]">{pausedExpenses.length}</strong> Paused
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bento Card 2: Next Payments Timeline Countdown */}
                <Card className="bg-[#111827]/60 backdrop-blur-xl border-white/[0.06] flex flex-col justify-between">
                    <CardContent className="p-6 h-full flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-violet-400" /> Upcoming Invoices
                                </h4>
                                <Badge variant="neutral" className="text-[9px] px-2 py-0">Timeline</Badge>
                            </div>
                            
                            {upcomingExpenses.length === 0 ? (
                                <div className="py-10 text-center text-xs text-[#64748B]">
                                    No active commitments.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {upcomingExpenses.map((exp) => {
                                        const isDueSoon = exp.daysRemaining <= 7;
                                        return (
                                            <div 
                                                key={exp._id}
                                                className={cn(
                                                    "flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 gap-4",
                                                    exp.isPaused 
                                                        ? "bg-white/[0.01] border-white/[0.02] opacity-50"
                                                        : isDueSoon
                                                        ? "bg-amber-500/[0.03] border-amber-500/20 hover:border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.04)]"
                                                        : "bg-white/[0.02] border-white/[0.04] hover:border-cyan-500/20"
                                                )}
                                            >
                                                <div className="flex flex-col text-left min-w-0 flex-1">
                                                    <span className="text-xs font-bold text-[#F1F5F9] truncate">{exp.description}</span>
                                                    <span className="text-[10px] text-[#64748B] mt-1 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 text-violet-400/80 shrink-0" />
                                                        {formatDate(exp.nextDue)}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center gap-3 shrink-0 ml-2">
                                                    {!exp.isPaused ? (
                                                        isDueSoon ? (
                                                            <Badge variant="warning" dot className="text-[9px] px-2 py-0.5 font-bold">
                                                                {exp.daysRemaining === 0
                                                                    ? "Today"
                                                                    : exp.daysRemaining === 1
                                                                    ? "Tomorrow"
                                                                    : `${exp.daysRemaining}d`}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="neutral" className="text-[9px] px-2 py-0.5 font-semibold">
                                                                {exp.daysRemaining}d
                                                            </Badge>
                                                        )
                                                    ) : (
                                                        <Badge variant="neutral" className="text-[9px] px-2 py-0.5 opacity-60">
                                                            Paused
                                                        </Badge>
                                                    )}
                                                    
                                                    <Toggle
                                                        className="scale-75 origin-right shrink-0"
                                                        checked={!exp.isPaused}
                                                        onChange={() => handleStatusToggle(exp)}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Bento Card 3: Commitment Estimation Radial Ring Chart */}
                <Card className="bg-[#111827]/60 backdrop-blur-xl border-white/[0.06] overflow-hidden flex flex-col justify-between">
                    <CardContent className="p-6 flex flex-col justify-between h-full relative">
                        <div className="w-full flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] flex items-center gap-1.5">
                                <Repeat className="w-4 h-4 text-cyan-400" /> Estimation Radial
                            </h4>
                        </div>
                        
                        <div className="flex flex-row items-center justify-between w-full mt-2 gap-4 flex-1">
                            <div className="relative w-[130px] h-[130px] shrink-0">
                                {/* Centered Ring Text Overlay */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1 z-10">
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-[#64748B]">Projected</span>
                                    <span className="text-base font-black text-[#F1F5F9] mt-0.5">{formatCurrency(monthlyTotal)}</span>
                                    <span className="text-[9px] text-[#94A3B8]">/ mo</span>
                                </div>
                                
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={processedRadialData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={42}
                                            outerRadius={56}
                                            paddingAngle={hasCommitments ? 8 : 0}
                                            dataKey="value"
                                            stroke="none"
                                            startAngle={90}
                                            endAngle={-270}
                                        >
                                            {processedRadialData.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={entry.color}
                                                    className="transition-all duration-300 hover:opacity-85"
                                                />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Chart Legend cleanly aligned next to chart */}
                            <div className="flex flex-col gap-3 justify-center flex-1 min-w-0">
                                <div className="flex items-start gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4] mt-1 shrink-0 animate-pulse" />
                                    <div className="flex flex-col text-left min-w-0">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">Weekly</span>
                                        <span className="text-xs font-extrabold text-[#F1F5F9] truncate">
                                            {formatCurrency(weeklyTotal)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] mt-1 shrink-0" />
                                    <div className="flex flex-col text-left min-w-0">
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">Monthly</span>
                                        <span className="text-xs font-extrabold text-[#F1F5F9] truncate">
                                            {formatCurrency(monthlyTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter, Search & Count Indicator */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] p-4 rounded-2xl">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                    <input
                        type="text"
                        placeholder="Search schedules or notes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10 w-full rounded-xl border border-white/[0.08] bg-[#0A0E1A]/80 pl-10 pr-4 text-xs text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 transition-all duration-200"
                    />
                </div>
                <div className="text-xs text-[#94A3B8] font-semibold">
                    Found {filteredExpenses.length} recurring item{filteredExpenses.length !== 1 && "s"}
                </div>
            </div>

            {/* Main Interactive Subscriptions Content */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-400" />
                    <p className="text-sm text-[#94A3B8]">Refining automated templates...</p>
                </div>
            ) : filteredExpenses.length === 0 ? (
                <Card className="py-16 text-center border-dashed border-white/[0.06] bg-[#111827]/30">
                    <CardContent className="flex flex-col items-center max-w-sm mx-auto space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-[#94A3B8]/60 shadow-lg">
                            <Repeat className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white">No Commitments Active</h3>
                            <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                                {searchTerm ? "No schedules match your search filters." : "Automate bills, software licensing, or repeated obligations to foresee impending costs."}
                            </p>
                        </div>
                        {!searchTerm && (
                            <Button 
                                size="sm" 
                                onClick={() => setIsDrawerOpen(true)}
                                className="bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500"
                            >
                                <Plus className="w-4 h-4 mr-1.5" /> Setup Recurring
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                /* Subscriptions: Beautiful interactive list items with glowing active states and paused/alert variants */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredExpenses.map((expense) => {
                            const nextDue = getNextDueDate(expense);
                            const daysRemaining = getDaysRemaining(nextDue);
                            const isDueSoon = daysRemaining <= 7;

                            return (
                                <motion.div
                                    key={expense._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ type: "spring", stiffness: 450, damping: 28 }}
                                >
                                    <Card
                                        hoverGlow={!expense.isPaused}
                                        className={cn(
                                            "transition-all duration-300 relative overflow-hidden h-full flex flex-col justify-between min-h-[175px]",
                                            expense.isPaused 
                                                ? "bg-[#111827]/20 border-white/[0.03] opacity-60" 
                                                : isDueSoon
                                                ? "border-amber-500/30 bg-amber-500/[0.02] shadow-[0_0_20px_rgba(245,158,11,0.06)] hover:border-amber-500/50" 
                                                : "bg-[#111827]/60 border-white/[0.06] hover:border-cyan-500/20 hover:shadow-[0_0_25px_rgba(6,182,212,0.08)]"
                                        )}
                                    >
                                        {/* Status Accent Bar */}
                                        <div 
                                            className={cn(
                                                "absolute top-0 left-0 bottom-0 w-[4px]",
                                                expense.isPaused 
                                                    ? "bg-[#64748B]" 
                                                    : isDueSoon
                                                    ? "bg-[#F59E0B]" 
                                                    : "bg-gradient-to-b from-[#06B6D4] to-[#8B5CF6]"
                                            )}
                                        />

                                        <CardContent className="p-5 pl-6 flex flex-col justify-between h-full space-y-4">
                                            {/* Top Line: Description & Delete action */}
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="text-left flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-[#F1F5F9] truncate">{expense.description}</h4>
                                                    {expense.note && (
                                                        <p className="text-[11px] text-[#64748B] mt-0.5 truncate max-w-[220px]">
                                                            {expense.note}
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteTemplate(expense)}
                                                    className="p-1.5 rounded-lg text-[#64748B] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors shrink-0 cursor-pointer"
                                                    title="Cancel recurring schedule"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Mid Section: Category & Amount */}
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                                        style={{ backgroundColor: expense.categoryId?.color || "#8B5CF6" }}
                                                    />
                                                    <span className="text-xs font-semibold text-[#94A3B8]">
                                                        {expense.categoryId?.name || "Uncategorized"}
                                                    </span>
                                                </div>
                                                
                                                <div className="text-right">
                                                    <span className="text-lg font-black text-[#F1F5F9]">{formatCurrency(expense.amount)}</span>
                                                    <span className="text-[9px] text-[#64748B] block -mt-1 capitalize font-bold">
                                                        / {expense.recurrenceInterval === "weekly" ? "wk" : "mo"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Bottom Bar: Due dates, interactive toggle & countdown badges */}
                                            <div className="flex items-center justify-between border-t border-white/[0.04] pt-3.5 mt-2 gap-2">
                                                <div className="flex flex-col text-left min-w-0 flex-1">
                                                    <span className="text-[9px] text-[#64748B] uppercase tracking-wider font-bold">Next payment</span>
                                                    <span className="text-xs font-medium text-[#94A3B8] flex items-center gap-1.5 mt-0.5 truncate">
                                                        <Calendar className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                                                        <span className="truncate">{formatDate(nextDue)}</span>
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center gap-3 shrink-0 ml-2">
                                                    {/* Glowing badges */}
                                                    {!expense.isPaused ? (
                                                        isDueSoon ? (
                                                            <Badge variant="warning" dot className="text-[9px] font-bold">
                                                                {daysRemaining === 0
                                                                    ? "Today"
                                                                    : daysRemaining === 1
                                                                    ? "Tomorrow"
                                                                    : `In ${daysRemaining}d`}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="neutral" className="text-[9px]">
                                                                In {daysRemaining} days
                                                            </Badge>
                                                        )
                                                    ) : (
                                                        <Badge variant="neutral" className="text-[9px] opacity-60">
                                                            Paused
                                                        </Badge>
                                                    )}

                                                    <Toggle
                                                        checked={!expense.isPaused}
                                                        onChange={() => handleStatusToggle(expense)}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Premium Sliding Form Drawer overlay */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        {/* Backdrop overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.7 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDrawerOpen(false)}
                            className="fixed inset-0 bg-[#05070F]/80 backdrop-blur-sm z-40"
                        />

                        {/* Drawer Content */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 380, damping: 28 }}
                            className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-[#0A0E1A]/95 backdrop-blur-2xl border-l border-white/[0.08] shadow-[0_0_50px_rgba(6,182,212,0.15)] z-50 p-6 flex flex-col min-h-0"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center border-b border-white/[0.06] pb-4 mb-6 shrink-0">
                                <div className="text-left">
                                    <h2 className="text-lg font-bold text-[#F1F5F9] flex items-center gap-2">
                                        <Repeat className="w-5 h-5 text-cyan-400" /> Setup Recurring
                                    </h2>
                                    <p className="text-xs text-[#94A3B8] mt-0.5">Automate repeat invoices, software licenses, or repeated schedules.</p>
                                </div>
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="p-1.5 rounded-lg text-[#64748B] hover:text-[#F1F5F9] hover:bg-white/[0.06] transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form fields */}
                            <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col min-h-0">
                                {/* Scrollable fields container */}
                                <div className="flex-1 overflow-y-auto pr-1 space-y-5">
                                    {/* Description */}
                                    <Input
                                        label="Description / Name"
                                        placeholder="e.g. Netflix Premium Plan"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        error={formErrors.description}
                                    />

                                    {/* Amount */}
                                    <Input
                                        label={`Amount (${userCurrency})`}
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                        error={formErrors.amount}
                                    />

                                    {/* Category Selector */}
                                    <Select
                                        label="Category"
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                                        error={formErrors.categoryId}
                                    >
                                        <option value="">Choose Category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </Select>

                                    {/* Anchor starting Date */}
                                    <Input
                                        label="Schedule Anchor Date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                        error={formErrors.date}
                                        helperText="Subsequent occurrences will be projected from this anchor date."
                                    />

                                    {/* Interval dropdown */}
                                    <Select
                                        label="Interval / Period"
                                        value={formData.recurrenceInterval}
                                        onChange={(e) => setFormData(prev => ({ ...prev, recurrenceInterval: e.target.value }))}
                                    >
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </Select>

                                    {/* Note */}
                                    <Input
                                        label="Extra Notes"
                                        placeholder="Credentials, account references, or custom descriptions..."
                                        value={formData.note}
                                        onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                                    />
                                </div>

                                {/* Form buttons - Sticky / Pinned to bottom */}
                                <div className="mt-6 border-t border-white/[0.06] pt-4 flex items-center justify-end gap-3 shrink-0 bg-[#0A0E1A]/95">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsDrawerOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        isLoading={formSubmitting}
                                        className="px-6 bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.35)]"
                                    >
                                        Start Schedule
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

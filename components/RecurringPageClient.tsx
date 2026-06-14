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
    X,
    Clock,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Toggle } from "@/components/ui/Toggle";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/lib/toast-context";
import { cn } from "@/lib/utils";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export default function RecurringPageClient() {
    const { success, error, info } = useToast();

    const [searchTerm, setSearchTerm] = React.useState("");

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

    const { data: preferencesData } = useSWR("/api/user/preferences", fetcher);
    const { data: expensesData, isLoading: expensesLoading, mutate: mutateExpenses } = useSWR("/api/expenses?limit=1000", fetcher, {
        onError: () => error("Failed to load recurring transactions.")
    });
    const { data: categoriesData } = useSWR("/api/categories", fetcher);

    const userCurrency = preferencesData?.currency || "USD";
    const expenses = React.useMemo(
        () => (expensesData?.expenses || []).filter((item: any) => item.isRecurring === true),
        [expensesData]
    );
    const categories: any[] = categoriesData || [];
    const loading = expensesLoading;

    const getNextDueDate = (expense: any) => {
        const baseDate = new Date(expense.lastProcessedAt || expense.date);
        let nextDate = new Date(baseDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Keep incrementing until nextDate is >= today
        while (nextDate < today) {
            if (expense.recurrenceInterval === "weekly") {
                nextDate.setDate(nextDate.getDate() + 7);
            } else if (expense.recurrenceInterval === "monthly" || !expense.recurrenceInterval) { // Default to monthly
                nextDate.setMonth(nextDate.getMonth() + 1);
            }
        }
        return nextDate;
    };

    const getDaysRemaining = (nextDueDate: Date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(nextDueDate);
        due.setHours(0, 0, 0, 0);
        const diffTime = due.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: userCurrency }).format(val);
    };

    const formatDate = (dateString: string | Date) => {
        return new Date(dateString).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    };

    const handleStatusToggle = async (expense: any) => {
        const updatedIsPaused = !expense.isPaused;
        try {
            const res = await fetch(`/api/expenses/${expense._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isPaused: updatedIsPaused })
            });

            if (res.ok) {
                mutateExpenses();
            } else {
                error("Failed to update status.");
            }
        } catch (err) {
            error("Something went wrong updating status.");
        }
    };

    const handleDeleteTemplate = async (expense: any) => {
        if (!confirm(`Cancel and delete recurring schedule for "${expense.description}"?`)) return;

        try {
            const res = await fetch(`/api/expenses/${expense._id}`, { method: "DELETE" });
            if (res.ok) {
                mutateExpenses();
            } else {
                error("Failed to delete recurring expense.");
            }
        } catch (err) {}
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errors: Record<string, string> = {};

        if (!formData.description.trim()) errors.description = "Description is required.";
        if (!formData.amount || parseFloat(formData.amount) <= 0) errors.amount = "Amount must be greater than zero.";
        if (!formData.categoryId) errors.categoryId = "Please select a category.";
        if (!formData.date) errors.date = "Anchor date is required.";

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
                setFormData({
                    description: "", amount: "", categoryId: "", date: new Date().toISOString().slice(0, 10), recurrenceInterval: "monthly", note: ""
                });
                mutateExpenses();
            } else {
                error("Failed to create recurring expense.");
            }
        } catch (err) {
            error("Failed to create recurring expense.");
        } finally {
            setFormSubmitting(false);
        }
    };

    const filteredExpenses = expenses.filter(item =>
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.note && item.note.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const activeExpenses = expenses.filter(e => !e.isPaused);
    const pausedExpenses = expenses.filter(e => e.isPaused);

    const monthlyTotal = activeExpenses.reduce((acc, curr) => acc + (curr.amount * (curr.recurrenceInterval === "weekly" ? 4.33 : 1)), 0);
    const weeklyTotal = activeExpenses.reduce((acc, curr) => acc + (curr.amount * (curr.recurrenceInterval === "monthly" ? 0.23 : 1)), 0);
    const annualTotal = monthlyTotal * 12;

    const upcomingExpenses = expenses
        .map(exp => ({ ...exp, nextDue: getNextDueDate(exp), daysRemaining: getDaysRemaining(getNextDueDate(exp)) }))
        .sort((a, b) => {
            if (a.isPaused && !b.isPaused) return 1;
            if (!a.isPaused && b.isPaused) return -1;
            return a.daysRemaining - b.daysRemaining;
        })
        .slice(0, 3);

    const hasCommitments = weeklyTotal > 0 || monthlyTotal > 0;
    const radialData = [
        { name: "Weekly", value: weeklyTotal, color: "#64748B" },
        { name: "Monthly", value: monthlyTotal, color: "#F1F5F9" }
    ];
    const processedRadialData = hasCommitments ? radialData.filter(d => d.value > 0) : [{ name: "No Commitments", value: 1, color: "rgba(255, 255, 255, 0.05)" }];

    return (
        <div className="space-y-6 text-left select-none pb-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-white tracking-tight">Recurring</h1>
                    <p className="text-sm text-white/50 mt-1">Automate and track your continuous commitments.</p>
                </div>
                <Button onClick={() => setIsDrawerOpen(true)} className="bg-white text-black hover:bg-white/90 font-medium">
                    <Plus className="w-4 h-4 mr-2" /> Add Recurring
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-xl border border-white/[0.08] bg-[#09090B] p-6 flex flex-col justify-between">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1">Monthly Commitment</p>
                        <h3 className="text-3xl font-semibold text-white">{formatCurrency(monthlyTotal)}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="p-3 rounded-lg border border-white/[0.08] bg-white/[0.02]">
                            <p className="text-[9px] uppercase font-semibold text-white/40">Weekly</p>
                            <p className="text-sm font-medium text-white">{formatCurrency(weeklyTotal)}</p>
                        </div>
                        <div className="p-3 rounded-lg border border-white/[0.08] bg-white/[0.02]">
                            <p className="text-[9px] uppercase font-semibold text-white/40">Annual</p>
                            <p className="text-sm font-medium text-white">{formatCurrency(annualTotal)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/[0.08]">
                        <div className="flex items-center gap-1.5 text-xs text-white/60">
                            <span className="w-2 h-2 rounded-full bg-white/80" /> {activeExpenses.length} Active
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-white/60">
                            <span className="w-2 h-2 rounded-full bg-white/20" /> {pausedExpenses.length} Paused
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-[#09090B] p-6 flex flex-col justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" /> Upcoming Invoices
                    </h4>
                    {upcomingExpenses.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center text-xs text-white/40">No active commitments.</div>
                    ) : (
                        <div className="space-y-3">
                            {upcomingExpenses.map((exp) => (
                                <div key={exp._id} className={cn("flex items-center justify-between p-3 rounded-lg border", exp.isPaused ? "bg-transparent border-white/[0.04] opacity-50" : "bg-white/[0.02] border-white/[0.08]")}>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium text-white truncate">{exp.description}</span>
                                        <span className="text-[10px] text-white/40 mt-0.5">{formatDate(exp.nextDue)}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {!exp.isPaused ? (
                                            <span className="text-[10px] text-white/60 font-medium">{exp.daysRemaining === 0 ? "Today" : `${exp.daysRemaining}d`}</span>
                                        ) : (
                                            <span className="text-[10px] text-white/40">Paused</span>
                                        )}
                                        <Toggle className="scale-75 origin-right" checked={!exp.isPaused} onChange={() => handleStatusToggle(exp)} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-[#09090B] p-6 flex flex-col">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 flex items-center gap-1.5 mb-4">
                        <Repeat className="w-3.5 h-3.5" /> Breakdowns
                    </h4>
                    <div className="flex-1 flex items-center justify-between gap-4">
                        <div className="relative w-28 h-28 shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={processedRadialData} cx="50%" cy="50%" innerRadius={35} outerRadius={50} paddingAngle={2} dataKey="value" stroke="none">
                                        {processedRadialData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col gap-3 flex-1 min-w-0 justify-center">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-semibold text-white/40 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-white/40" /> Weekly
                                </span>
                                <span className="text-sm font-medium text-white ml-3.5 mt-0.5">{formatCurrency(weeklyTotal)}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-semibold text-white/40 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-white" /> Monthly
                                </span>
                                <span className="text-sm font-medium text-white ml-3.5 mt-0.5">{formatCurrency(monthlyTotal)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                    type="text" placeholder="Search schedules..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-10 w-full rounded-lg border border-white/[0.08] bg-transparent pl-9 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/20"
                />
            </div>

            {loading ? (
                <div className="py-20 text-center text-sm text-white/40">Loading...</div>
            ) : filteredExpenses.length === 0 ? (
                <div className="py-20 text-center border border-white/[0.08] rounded-xl bg-[#09090B] flex flex-col items-center">
                    <Repeat className="w-8 h-8 text-white/20 mb-3" />
                    <h3 className="text-sm font-medium text-white">No Commitments</h3>
                    <p className="text-xs text-white/40 mt-1">Setup schedules for your recurring payments.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {filteredExpenses.map((expense) => {
                            const nextDue = getNextDueDate(expense);
                            const daysRemaining = getDaysRemaining(nextDue);

                            return (
                                <motion.div key={expense._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={cn("rounded-xl border border-white/[0.08] p-5 flex flex-col justify-between min-h-[160px] transition-all", expense.isPaused ? "bg-transparent opacity-60" : "bg-[#09090B]")}>
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-medium text-white truncate">{expense.description}</h4>
                                            {expense.note && <p className="text-[10px] text-white/40 mt-0.5 truncate">{expense.note}</p>}
                                        </div>
                                        <button onClick={() => handleDeleteTemplate(expense)} className="p-1.5 rounded-md text-white/40 hover:text-red-400 hover:bg-white/[0.04]">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-end my-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-white/20" />
                                            <span className="text-xs text-white/60">{expense.categoryId?.name || "Uncategorized"}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-semibold text-white">{formatCurrency(expense.amount)}</span>
                                            <span className="text-[10px] text-white/40 block">/ {expense.recurrenceInterval === "weekly" ? "wk" : "mo"}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-white/[0.08] pt-3">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] uppercase font-semibold text-white/40">Next</span>
                                            <span className="text-[11px] text-white/80">{formatDate(nextDue)}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] text-white/60">{expense.isPaused ? "Paused" : `In ${daysRemaining}d`}</span>
                                            <Toggle checked={!expense.isPaused} onChange={() => handleStatusToggle(expense)} className="scale-75 origin-right" />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {isDrawerOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
                    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="relative w-full max-w-sm bg-[#09090B] border-l border-white/[0.08] p-6 shadow-2xl flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-medium text-white flex items-center gap-2">Setup Recurring</h2>
                            <button onClick={() => setIsDrawerOpen(false)} className="p-1 text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto space-y-4">
                            <Input label="Description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} error={formErrors.description} className="bg-transparent border-white/[0.08]" />
                            <Input label="Amount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))} error={formErrors.amount} className="bg-transparent border-white/[0.08]" />
                            <Select label="Category" value={formData.categoryId} onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))} error={formErrors.categoryId} className="bg-transparent border-white/[0.08]">
                                <option value="">Choose Category</option>
                                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                            </Select>
                            <Input label="Anchor Date" type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} error={formErrors.date} className="bg-transparent border-white/[0.08]" />
                            <Select label="Interval" value={formData.recurrenceInterval} onChange={(e) => setFormData(prev => ({ ...prev, recurrenceInterval: e.target.value }))} className="bg-transparent border-white/[0.08]">
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </Select>
                            <Input label="Note" value={formData.note} onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))} className="bg-transparent border-white/[0.08]" />
                            <div className="pt-6 mt-auto">
                                <Button type="submit" isLoading={formSubmitting} className="w-full bg-white text-black hover:bg-white/90">Save Schedule</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

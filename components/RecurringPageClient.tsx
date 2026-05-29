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

export default function RecurringPageClient() {
    const { success, error, info } = useToast();
    const [expenses, setExpenses] = React.useState([]);
    const [categories, setCategories] = React.useState([]);
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
                const recurringItems = (data.expenses || []).filter(item => item.isRecurring === true);
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
    const getNextDueDate = (expense) => {
        const baseDate = new Date(expense.lastProcessedAt || expense.date);
        const nextDate = new Date(baseDate);
        if (expense.recurrenceInterval === "weekly") {
            nextDate.setDate(nextDate.getDate() + 7);
        } else if (expense.recurrenceInterval === "monthly") {
            nextDate.setMonth(nextDate.getMonth() + 1);
        }
        return nextDate;
    };

    const getDaysRemaining = (nextDueDate) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(nextDueDate);
        due.setHours(0, 0, 0, 0);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Format currency helper
    const formatCurrency = (val) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: userCurrency,
        }).format(val);
    };

    // Format Date helper
    const formatDate = (dateString) => {
        const dateObj = new Date(dateString);
        return dateObj.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    // Toggle Pause/Active status switch
    const handleStatusToggle = async (expense) => {
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
    const handleDeleteTemplate = async (expense) => {
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
    const handleFormSubmit = async (e) => {
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

    return (
        <div className="space-y-6 text-left select-none relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white/95">Recurring Expenses</h1>
                    <p className="text-xs text-muted-foreground">Manage ongoing automated schedules, subscriptions, and recurring invoices.</p>
                </div>
                <Button onClick={() => setIsDrawerOpen(true)}>
                    <Plus className="w-4.5 h-4.5 mr-2" /> Add Recurring
                </Button>
            </div>

            {/* Stats Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Card className="bg-card/40 border-white/5">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Schedules</p>
                            <h3 className="text-2xl font-black text-white mt-1">
                                {expenses.filter(e => !e.isPaused).length}
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center text-success">
                            <Play className="w-5 h-5 fill-current" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-white/5">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Paused Schedules</p>
                            <h3 className="text-2xl font-black text-amber-500 mt-1">
                                {expenses.filter(e => e.isPaused).length}
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                            <Pause className="w-5 h-5 fill-current" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/40 border-white/5">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Estimate</p>
                            <h3 className="text-2xl font-black text-primary mt-1">
                                {formatCurrency(
                                    expenses.reduce((acc, curr) => {
                                        if (curr.isPaused) return acc;
                                        // Monthly approximation: weekly is * 4.33
                                        const mult = curr.recurrenceInterval === "weekly" ? 4.33 : 1;
                                        return acc + (curr.amount * mult);
                                    }, 0)
                                )}
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <Repeat className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter / Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#1A1D2E]/40 border border-white/5 p-4 rounded-2xl backdrop-blur-md">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search recurring..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10 w-full rounded-xl border border-white/5 bg-secondary/30 pl-10 pr-4 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <div className="text-xs text-muted-foreground font-semibold">
                    Showing {filteredExpenses.length} recurring item{filteredExpenses.length !== 1 && "s"}
                </div>
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
                    <p className="text-sm text-muted-foreground">Loading active schedules...</p>
                </div>
            ) : filteredExpenses.length === 0 ? (
                /* Empty state */
                <Card className="py-16 text-center border-dashed border-white/5">
                    <CardContent className="flex flex-col items-center max-w-sm mx-auto space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground/60 shadow-lg">
                            <Repeat className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white">No Recurring Schedules</h3>
                            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                                {searchTerm ? "No recurring schedules match your search term." : "Automate bills, subscriptions, or repeated transfers and get alerted before they deduct."}
                            </p>
                        </div>
                        {!searchTerm && (
                            <Button size="sm" onClick={() => setIsDrawerOpen(true)}>
                                <Plus className="w-4 h-4 mr-1.5" /> Setup Recurring
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                /* Interactive list table */
                <Card className="border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/2 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                    <th className="p-4 pl-6">Subscription / Bill</th>
                                    <th className="p-4">Category</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Frequency</th>
                                    <th className="p-4">Next Due Date</th>
                                    <th className="p-4">Timeline</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 pr-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm text-gray-300">
                                {filteredExpenses.map((expense) => {
                                    const nextDue = getNextDueDate(expense);
                                    const daysRemaining = getDaysRemaining(nextDue);
                                    const isDueSoon = daysRemaining <= 7;

                                    return (
                                        <motion.tr
                                            key={expense._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className={cn(
                                                "hover:bg-white/2 transition-colors group",
                                                expense.isPaused && "opacity-60"
                                            )}
                                        >
                                            {/* Description */}
                                            <td className="p-4 pl-6 font-semibold text-white">
                                                <div className="flex flex-col">
                                                    <span>{expense.description}</span>
                                                    {expense.note && (
                                                        <span className="text-[10px] font-normal text-muted-foreground/80 mt-0.5 max-w-[200px] truncate">
                                                            {expense.note}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="w-2.5 h-2.5 rounded-full shrink-0"
                                                        style={{ backgroundColor: expense.categoryId?.color || "#6366F1" }}
                                                    />
                                                    <span className="text-xs font-semibold text-white/80">
                                                        {expense.categoryId?.name || "Uncategorized"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Amount */}
                                            <td className="p-4 font-bold text-white">
                                                {formatCurrency(expense.amount)}
                                            </td>

                                            {/* Frequency */}
                                            <td className="p-4">
                                                <Badge className="capitalize px-2 py-0.5 text-[10px] font-bold">
                                                    {expense.recurrenceInterval}
                                                </Badge>
                                            </td>

                                            {/* Next Due Date */}
                                            <td className="p-4 text-xs font-mono text-muted-foreground">
                                                {formatDate(nextDue)}
                                            </td>

                                            {/* Countdown badge */}
                                            <td className="p-4">
                                                {!expense.isPaused ? (
                                                    isDueSoon ? (
                                                        <Badge variant="warning" dot className="text-[10px] font-bold">
                                                            {daysRemaining === 0
                                                                ? "Today"
                                                                : daysRemaining === 1
                                                                ? "Tomorrow"
                                                                : `Due in ${daysRemaining} days`}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="neutral" className="text-[10px]">
                                                            In {daysRemaining} days
                                                        </Badge>
                                                    )
                                                ) : (
                                                    <Badge variant="neutral" className="text-[10px] opacity-50">
                                                        Paused
                                                    </Badge>
                                                )}
                                            </td>

                                            {/* Status Switch */}
                                            <td className="p-4">
                                                <Toggle
                                                    checked={!expense.isPaused}
                                                    onChange={() => handleStatusToggle(expense)}
                                                />
                                            </td>

                                            {/* Delete Trashcan Action */}
                                            <td className="p-4 pr-6 text-right">
                                                <button
                                                    onClick={() => handleDeleteTemplate(expense)}
                                                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                                    title="Cancel recurring schedule"
                                                >
                                                    <Trash2 className="w-4.5 h-4.5" />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

            {/* Slide-out Drawer Panel overlay */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        {/* Backdrop overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDrawerOpen(false)}
                            className="fixed inset-0 bg-black z-40"
                        />

                        {/* Drawer content pane */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring" as const, stiffness: 350, damping: 30 }}
                            className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-[#161824] border-l border-white/5 shadow-2xl z-50 p-6 flex flex-col justify-between"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                                <div className="text-left">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Repeat className="w-5 h-5 text-primary" /> Setup Recurring
                                    </h2>
                                    <p className="text-xs text-muted-foreground/80">Automate repeat invoices, subscriptions or regular transactions.</p>
                                </div>
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form fields */}
                            <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col justify-between overflow-y-auto pr-1">
                                <div className="space-y-5">
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
                                        helperText="We'll project subsequent occurrences based on this starting point."
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
                                        placeholder="Add confirmation codes, credentials, custom details..."
                                        value={formData.note}
                                        onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                                    />
                                </div>

                                {/* Form buttons */}
                                <div className="mt-8 border-t border-white/5 pt-4 flex items-center justify-end gap-3 shrink-0">
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
                                        className="px-6"
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

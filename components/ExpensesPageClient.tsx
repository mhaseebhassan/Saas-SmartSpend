"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    ChevronUp,
    ChevronDown,
    Plus,
    X,
    Filter,
    Trash2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Edit2,
    DollarSign,
    TrendingUp,
    Layers
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export default function ExpensesPageClient() {
    // 1. Data States
    interface Expense {
        _id: string;
        description: string;
        amount: number;
        categoryId?: {
            _id: string;
            name: string;
            color: string;
        } | string;
        date: string;
        isRecurring?: boolean;
        recurrenceInterval?: string;
        note?: string;
    }

    interface Category {
        _id: string;
        name: string;
        color: string;
    }

    const [expenses, setExpenses] = React.useState<Expense[]>([]);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [formSubmitting, setFormSubmitting] = React.useState(false);

    // 2. Filter & Sort States
    const [search, setSearch] = React.useState("");
    const [categoryFilter, setCategoryFilter] = React.useState("");
    const [dateFrom, setDateFrom] = React.useState("");
    const [dateTo, setDateTo] = React.useState("");
    const [minAmount, setMinAmount] = React.useState("");
    const [maxAmount, setMaxAmount] = React.useState("");

    const [sortBy, setSortBy] = React.useState("date");
    const [sortOrder, setSortOrder] = React.useState("desc");

    // 3. Pagination States
    const [page, setPage] = React.useState(1);
    const [totalPages, setTotalPages] = React.useState(1);
    const [totalItems, setTotalItems] = React.useState(0);

    // 4. Selection States (Bulk actions)
    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

    // 5. Drawer & Custom States
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
    const [editingExpenseId, setEditingExpenseId] = React.useState<string | null>(null);
    const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = React.useState(false);
    const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
    const [formData, setFormData] = React.useState({
        description: "",
        amount: "",
        categoryId: "",
        date: new Date().toISOString().slice(0, 10),
        isRecurring: false,
        recurrenceInterval: "monthly",
        note: ""
    });

    // 6. Fetch Expenses from API
    const fetchExpenses = React.useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                sortBy,
                sortOrder
            });

            if (search) params.append("search", search);
            if (categoryFilter) params.append("categoryId", categoryFilter);
            if (dateFrom) params.append("dateFrom", dateFrom);
            if (dateTo) params.append("dateTo", dateTo);
            if (minAmount) params.append("minAmount", minAmount);
            if (maxAmount) params.append("maxAmount", maxAmount);

            const res = await fetch(`/api/expenses?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setExpenses(data.expenses || []);
                setTotalPages(data.pagination?.pages || 1);
                setTotalItems(data.pagination?.total || 0);
            }
        } catch (err) {
            console.error("Error fetching expenses:", err);
        } finally {
            setLoading(false);
        }
    }, [page, search, categoryFilter, dateFrom, dateTo, minAmount, maxAmount, sortBy, sortOrder]);

    // 7. Fetch Categories (for filter dropdown and right drawer form)
    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/categories");
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data || []);
                }
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };

        fetchCategories();
    }, []);

    // Trigger Fetch on parameter changes
    React.useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    // Reset page to 1 when filters change
    React.useEffect(() => {
        setPage(1);
    }, [search, categoryFilter, dateFrom, dateTo, minAmount, maxAmount]);

    // 8. Sorting Handler
    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("desc");
        }
        setPage(1);
    };

    // 9. Checkbox selection
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(expenses.map(exp => exp._id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // 10. Bulk Deletion Handler
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Are you sure you want to delete the ${selectedIds.length} selected expenses?`)) return;

        try {
            const res = await fetch("/api/expenses/bulk", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedIds })
            });

            if (res.ok) {
                setSelectedIds([]);
                fetchExpenses();
            } else {
                alert("Failed to delete selected expenses.");
            }
        } catch (err) {
            console.error("Error deleting bulk:", err);
        }
    };

    // 11. Individual Deletion Handler
    const handleDeleteExpense = async (id: string) => {
        if (!confirm("Are you sure you want to delete this expense?")) return;

        try {
            const res = await fetch(`/api/expenses/${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                fetchExpenses();
            } else {
                alert("Failed to delete expense.");
            }
        } catch (err) {
            console.error("Error deleting expense:", err);
        }
    };

    // 12. Add/Edit Expense Handlers
    const handleOpenAddDrawer = () => {
        setEditingExpenseId(null);
        setFormData({
            description: "",
            amount: "",
            categoryId: "",
            date: new Date().toISOString().slice(0, 10),
            isRecurring: false,
            recurrenceInterval: "monthly",
            note: ""
        });
        setFormErrors({});
        setIsDrawerOpen(true);
    };

    const handleOpenEditDrawer = (exp: any) => {
        setEditingExpenseId(exp._id);
        setFormData({
            description: exp.description || "",
            amount: exp.amount?.toString() || "",
            categoryId: exp.categoryId?._id || exp.categoryId || "",
            date: exp.date ? new Date(exp.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            isRecurring: exp.isRecurring || false,
            recurrenceInterval: exp.recurrenceInterval || "monthly",
            note: exp.note || ""
        });
        setFormErrors({});
        setIsDrawerOpen(true);
    };

    const handleAddExpenseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Form validations
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
            errors.date = "Date is required.";
        } else {
            const selectedDate = new Date(formData.date);
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            if (selectedDate > today) {
                errors.date = "Expense date cannot be in the future.";
            }
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setFormErrors({});
        setFormSubmitting(true);

        try {
            let res;
            if (editingExpenseId) {
                res = await fetch(`/api/expenses/${editingExpenseId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount: parseFloat(formData.amount),
                        categoryId: formData.categoryId,
                        description: formData.description,
                        date: new Date(formData.date),
                        note: formData.note,
                        isRecurring: formData.isRecurring,
                        recurrenceInterval: formData.isRecurring ? formData.recurrenceInterval : null
                    })
                });
            } else {
                res = await fetch("/api/expenses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount: parseFloat(formData.amount),
                        categoryId: formData.categoryId,
                        description: formData.description,
                        date: new Date(formData.date),
                        note: formData.note,
                        isRecurring: formData.isRecurring,
                        recurrenceInterval: formData.isRecurring ? formData.recurrenceInterval : null
                    })
                });
            }

            if (res.ok) {
                setIsDrawerOpen(false);
                setEditingExpenseId(null);
                // Reset form fields
                setFormData({
                    description: "",
                    amount: "",
                    categoryId: "",
                    date: new Date().toISOString().slice(0, 10),
                    isRecurring: false,
                    recurrenceInterval: "monthly",
                    note: ""
                });
                fetchExpenses();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to save expense.");
            }
        } catch (err) {
            console.error("Error submitting expense:", err);
        } finally {
            setFormSubmitting(false);
        }
    };

    // Calculate dynamic stats
    const totalSpent = React.useMemo(() => {
        return expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
    }, [expenses]);

    const avgDailySpend = React.useMemo(() => {
        if (expenses.length === 0) return 0;
        const uniqueDates = new Set(expenses.map(e => {
            try {
                return new Date(e.date).toISOString().slice(0, 10);
            } catch {
                return e.date;
            }
        }));
        return totalSpent / Math.max(1, uniqueDates.size);
    }, [expenses, totalSpent]);

    const transactionCount = totalItems;

    // staggered animation definitions
    const cardContainerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    } as const;

    const cardItemVariants: any = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 25 } }
    };

    return (
        <div className="space-y-6 text-left select-none relative pb-16">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white/95 bg-gradient-to-r from-[#F1F5F9] to-[#94A3B8] bg-clip-text text-transparent">
                        Expenses
                    </h1>
                    <p className="text-xs text-slate-400">List, filter, and audit your personal expenditures.</p>
                </div>
                <Button 
                    onClick={handleOpenAddDrawer}
                    className="bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 hover:opacity-90 border-0 text-white font-medium shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all duration-300"
                >
                    <Plus className="w-4.5 h-4.5 mr-2" /> Add Expense
                </Button>
            </div>

            {/* Staggered Entry Cards Grid for Total, Avg and Count */}
            <motion.div 
                variants={cardContainerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-5"
            >
                {/* Total Spent Card */}
                <motion.div 
                    variants={cardItemVariants}
                    className="relative overflow-hidden group bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 hover:border-cyan-400/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all duration-300"
                >
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-cyan-500/10 via-violet-500/5 to-pink-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Page Spent</span>
                            <h2 className="text-2xl font-extrabold text-[#F1F5F9]">${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                </motion.div>

                {/* Avg Daily Spend Card */}
                <motion.div 
                    variants={cardItemVariants}
                    className="relative overflow-hidden group bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 hover:border-cyan-400/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all duration-300"
                >
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-violet-500/10 via-pink-500/5 to-cyan-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Daily Spend</span>
                            <h2 className="text-2xl font-extrabold text-[#F1F5F9]">${avgDailySpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                </motion.div>

                {/* Transaction Count Card */}
                <motion.div 
                    variants={cardItemVariants}
                    className="relative overflow-hidden group bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 hover:border-cyan-400/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all duration-300"
                >
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-pink-500/10 via-cyan-500/5 to-violet-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Transactions</span>
                            <h2 className="text-2xl font-extrabold text-[#F1F5F9]">{transactionCount.toLocaleString()}</h2>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                            <Layers className="w-5 h-5" />
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Filter Bar with aurora glowing focus rings and collapsible filters */}
            <div className="relative w-full z-20">
                <div className="flex flex-col gap-3 p-4 rounded-2xl border border-white/[0.06] bg-[#111827]/60 backdrop-blur-xl shadow-xl">
                    <div className="flex flex-col md:flex-row items-center gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1 w-full group">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-cyan-400" />
                            <input
                                type="text"
                                placeholder="Search description..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-11 w-full rounded-xl border border-white/[0.06] bg-[#0A0E1A]/80 pl-10 pr-4 text-sm text-[#F1F5F9] placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 transition-all duration-200"
                            />
                        </div>

                        {/* Category Select Filter */}
                        <div className="w-full md:w-64">
                            <Select 
                                value={categoryFilter} 
                                onChange={(e) => setCategoryFilter(e.target.value)} 
                                className="h-11 text-sm rounded-xl"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </Select>
                        </div>

                        {/* Collapsible Trigger */}
                        <Button 
                            variant="secondary"
                            onClick={() => setIsAdvancedFiltersOpen(prev => !prev)}
                            className="w-full md:w-auto h-11"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            {isAdvancedFiltersOpen ? "Hide Filters" : "Advanced Filters"}
                        </Button>
                    </div>

                    <AnimatePresence>
                        {isAdvancedFiltersOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 pt-3.5 border-t border-white/[0.06]"
                            >
                                {/* Date From */}
                                <div>
                                    <label className="text-[10px] uppercase font-semibold text-slate-400 mb-1.5 block">From Date</label>
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="h-11 w-full rounded-xl border border-white/[0.06] bg-[#0A0E1A]/80 px-3.5 text-xs text-[#F1F5F9] focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 transition-all cursor-pointer"
                                    />
                                </div>

                                {/* Date To */}
                                <div>
                                    <label className="text-[10px] uppercase font-semibold text-slate-400 mb-1.5 block">To Date</label>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="h-11 w-full rounded-xl border border-white/[0.06] bg-[#0A0E1A]/80 px-3.5 text-xs text-[#F1F5F9] focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 transition-all cursor-pointer"
                                    />
                                </div>

                                {/* Min Amount */}
                                <div>
                                    <label className="text-[10px] uppercase font-semibold text-slate-400 mb-1.5 block">Min Amount</label>
                                    <input
                                        type="number"
                                        placeholder="Min ($)"
                                        value={minAmount}
                                        onChange={(e) => setMinAmount(e.target.value)}
                                        className="h-11 w-full rounded-xl border border-white/[0.06] bg-[#0A0E1A]/80 px-3.5 text-xs text-[#F1F5F9] focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 transition-all"
                                    />
                                </div>

                                {/* Max Amount */}
                                <div>
                                    <label className="text-[10px] uppercase font-semibold text-slate-400 mb-1.5 block">Max Amount</label>
                                    <input
                                        type="number"
                                        placeholder="Max ($)"
                                        value={maxAmount}
                                        onChange={(e) => setMaxAmount(e.target.value)}
                                        className="h-11 w-full rounded-xl border border-white/[0.06] bg-[#0A0E1A]/80 px-3.5 text-xs text-[#F1F5F9] focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 transition-all"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Expenses Table in a Clean Glass Card */}
            <div className="bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
                <div className="overflow-x-auto min-h-[300px] scrollbar-thin scrollbar-thumb-white/[0.08] scrollbar-track-transparent">
                    <table className="w-full text-sm text-left border-collapse min-w-[850px]">
                        <thead>
                            <tr className="border-b border-white/[0.06] text-[11px] font-bold uppercase tracking-wider text-[#94A3B8] bg-white/[0.01]">
                                <th className="py-4 px-6 w-12 text-center select-none">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={expenses.length > 0 && selectedIds.length === expenses.length}
                                        className="h-4 w-4 rounded border-white/[0.08] bg-[#0A0E1A] text-cyan-500 focus:ring-cyan-400/40 cursor-pointer"
                                    />
                                </th>
                                <th className="py-4 px-6 w-[35%] min-w-[200px] cursor-pointer hover:text-white transition-colors select-none" onClick={() => handleSort("description")}>
                                    <div className="flex items-center gap-1.5">
                                        Description
                                        {sortBy === "description" && (sortOrder === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />)}
                                    </div>
                                </th>
                                <th className="py-4 px-6 w-[20%] min-w-[140px] cursor-pointer hover:text-white transition-colors select-none" onClick={() => handleSort("categoryId")}>
                                    <div className="flex items-center gap-1.5">
                                        Category
                                        {sortBy === "categoryId" && (sortOrder === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />)}
                                    </div>
                                </th>
                                <th className="py-4 px-6 w-[20%] min-w-[120px] cursor-pointer hover:text-white transition-colors select-none" onClick={() => handleSort("date")}>
                                    <div className="flex items-center gap-1.5">
                                        Date
                                        {sortBy === "date" && (sortOrder === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />)}
                                    </div>
                                </th>
                                <th className="py-4 px-6 w-[15%] min-w-[110px] text-right cursor-pointer hover:text-white transition-colors select-none" onClick={() => handleSort("amount")}>
                                    <div className="flex items-center justify-end gap-1.5">
                                        Amount
                                        {sortBy === "amount" && (sortOrder === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />)}
                                    </div>
                                </th>
                                <th className="py-4 px-6 w-24 text-center select-none"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                /* Skeleton Loading State with beautiful Aurora directional sweeps */
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={`skeleton-${idx}`} className="border-b border-white/[0.06]">
                                        <td className="py-4 px-6 w-12 text-center"><div className="h-4 w-4 bg-[#1A2035] rounded mx-auto animate-pulse" /></td>
                                        <td className="py-4 px-6 w-[35%] min-w-[200px]"><div className="h-4 w-32 bg-[#1A2035] rounded animate-pulse" /></td>
                                        <td className="py-4 px-6 w-[20%] min-w-[140px]"><div className="h-5 w-20 bg-[#1A2035] rounded-full animate-pulse" /></td>
                                        <td className="py-4 px-6 w-[20%] min-w-[120px]"><div className="h-4 w-24 bg-[#1A2035] rounded animate-pulse" /></td>
                                        <td className="py-4 px-6 w-[15%] min-w-[110px] text-right"><div className="h-4 w-16 bg-[#1A2035] rounded ml-auto animate-pulse" /></td>
                                        <td className="py-4 px-6 w-24"></td>
                                    </tr>
                                ))
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-slate-500 font-medium">
                                        No expenses found. Add some or clear filters.
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((exp) => {
                                    const isRowSelected = selectedIds.includes(exp._id);
                                    const category = (exp.categoryId && typeof exp.categoryId === "object")
                                        ? exp.categoryId
                                        : categories.find(c => c._id === exp.categoryId) || { name: "Uncategorized", color: "#6B7280" };

                                    return (
                                        <tr
                                            key={exp._id}
                                            className={cn(
                                                "border-b border-white/[0.06] hover:bg-white/[0.02] hover:shadow-[inset_0_0_20px_rgba(139,92,246,0.02)] group transition-all duration-200",
                                                isRowSelected && "bg-cyan-500/5 hover:bg-cyan-500/10"
                                            )}
                                        >
                                            <td className="py-4 px-6 w-12 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isRowSelected}
                                                    onChange={() => handleSelectRow(exp._id)}
                                                    className="h-4 w-4 rounded border-white/[0.08] bg-[#0A0E1A] text-cyan-500 focus:ring-cyan-400/40 cursor-pointer"
                                                />
                                            </td>
                                            <td className="py-4 px-6 w-[35%] min-w-[200px]">
                                                <div className="flex flex-col text-left">
                                                    <span className="font-semibold text-[#F1F5F9]">{exp.description}</span>
                                                    {exp.note && <span className="text-[10px] text-slate-400 mt-0.5 max-w-[250px] truncate">{exp.note}</span>}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 w-[20%] min-w-[140px]">
                                                <Badge variant="neutral" style={{ backgroundColor: `${category.color}15`, borderColor: `${category.color}30`, color: category.color }} className="capitalize font-semibold">
                                                    {category.name}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-6 w-[20%] min-w-[120px] text-[#94A3B8]">
                                                {new Date(exp.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                            </td>
                                            <td className="py-4 px-6 w-[15%] min-w-[110px] text-right font-bold text-[#F1F5F9]">
                                                ${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-4 px-6 w-24 text-center">
                                                <div className="flex items-center justify-center gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-200">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenEditDrawer(exp)}
                                                        className="text-[#94A3B8] hover:text-cyan-400 hover:bg-cyan-500/10 p-2 rounded-xl h-9 w-9"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDeleteExpense(exp._id)}
                                                        className="text-[#94A3B8] hover:text-red-400 hover:bg-red-500/10 p-2 rounded-xl h-9 w-9"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {!loading && totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 border-t border-white/[0.06] bg-white/[0.005]">
                        <span className="text-xs text-slate-400">
                            Showing page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong> ({totalItems} total records)
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={page === totalPages}
                                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                            >
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Glass Capsule Bulk Selection Bar */}
            <AnimatePresence>
                {selectedIds.length > 0 && (
                    <motion.div
                        initial={{ y: 50, x: "-50%", opacity: 0 }}
                        animate={{ y: 0, x: "-50%", opacity: 1 }}
                        exit={{ y: 50, x: "-50%", opacity: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className="fixed bottom-6 left-1/2 z-50 flex items-center justify-between gap-6 px-6 py-3.5 rounded-full border border-white/[0.08] bg-[#0A0E1A]/85 backdrop-blur-2xl shadow-[0_10px_50px_rgba(0,0,0,0.6)] w-[90%] max-w-md"
                    >
                        <span className="text-xs font-semibold text-[#F1F5F9]">
                            {selectedIds.length} select{selectedIds.length > 1 ? "s" : "ed"}
                        </span>
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setSelectedIds([])}
                                className="text-slate-400 hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={handleBulkDelete}
                                className="shadow-md shadow-red-500/25 bg-red-500/80 hover:bg-red-500 text-white rounded-full px-4"
                            >
                                <Trash2 className="w-4 h-4 mr-1.5 inline" /> Delete Selected
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add/Edit Expense Right-Side Drawer Form */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        {/* Drawer Backdrop Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDrawerOpen(false)}
                            className="fixed inset-0 bg-[#05070F]/80 backdrop-blur-sm z-40 cursor-pointer"
                        />

                        {/* Drawer Body Panel */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-[#0A0E1A]/95 border-l border-white/[0.08] z-50 p-5 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col h-full animate-in fade-in"
                        >
                            {/* Drawer Header */}
                            <div className="flex justify-between items-center border-b border-white/[0.06] pb-4 mb-6">
                                <div className="text-left">
                                    <h2 className="text-lg font-bold text-[#F1F5F9]">
                                        {editingExpenseId ? "Edit Expense" : "Add New Expense"}
                                    </h2>
                                    <p className="text-xs text-[#94A3B8]">
                                        {editingExpenseId ? "Modify your transaction details with instant syncing." : "Log your transaction detail with auto alerts."}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Drawer Form fields */}
                            <form onSubmit={handleAddExpenseSubmit} className="flex-1 flex flex-col justify-between overflow-y-auto pr-1">
                                <div className="space-y-5">
                                    {/* Description */}
                                    <Input
                                        label="Description"
                                        placeholder="e.g. Whole Foods Groceries"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        error={formErrors.description}
                                    />

                                    {/* Amount */}
                                    <Input
                                        label="Amount ($)"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                                        error={formErrors.amount}
                                    />

                                    {/* Category Select */}
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

                                    {/* Date */}
                                    <Input
                                        label="Date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                        error={formErrors.date}
                                    />

                                    {/* Note */}
                                    <Input
                                        label="Note / Details"
                                        placeholder="Optional extra remarks..."
                                        value={formData.note}
                                        onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                                    />

                                    {/* Recurring switch triggers */}
                                    <div className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.06] space-y-4">
                                        <Toggle
                                            label="Recurring Expense"
                                            description="Process automatically on set intervals"
                                            checked={formData.isRecurring}
                                            onChange={(checked) => setFormData(prev => ({ ...prev, isRecurring: checked }))}
                                        />

                                        <AnimatePresence>
                                            {formData.isRecurring && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden pt-1"
                                                >
                                                    <Select
                                                        label="Recurrence Interval"
                                                        value={formData.recurrenceInterval}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, recurrenceInterval: e.target.value }))}
                                                    >
                                                        <option value="weekly">Weekly</option>
                                                        <option value="monthly">Monthly</option>
                                                    </Select>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Form Action Buttons */}
                                <div className="mt-8 border-t border-white/[0.06] pt-4 flex items-center justify-end gap-3 shrink-0">
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
                                        className="px-6 bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 hover:opacity-90 border-0"
                                    >
                                        Save Transaction
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

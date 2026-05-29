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
    Loader2
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
    const [expenses, setExpenses] = React.useState([]);
    const [categories, setCategories] = React.useState([]);
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
    const [selectedIds, setSelectedIds] = React.useState([]);

    // 5. Drawer Drawer States
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
    const [formErrors, setFormErrors] = React.useState({});
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
    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("desc");
        }
        setPage(1);
    };

    // 9. Checkbox selection
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(expenses.map(exp => exp._id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id) => {
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
    const handleDeleteExpense = async (id) => {
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

    // 12. Add Expense Submit Handler
    const handleAddExpenseSubmit = async (e) => {
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
            const res = await fetch("/api/expenses", {
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

            if (res.ok) {
                setIsDrawerOpen(false);
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
                alert(data.message || "Failed to create expense.");
            }
        } catch (err) {
            console.error("Error submitting expense:", err);
        } finally {
            setFormSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 text-left select-none relative">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white/95">Expenses</h1>
                    <p className="text-xs text-muted-foreground">List, filter, and audit your personal expenditures.</p>
                </div>
                <Button onClick={() => setIsDrawerOpen(true)}>
                    <Plus className="w-4.5 h-4.5 mr-2" /> Add Expense
                </Button>
            </div>

            {/* Filter Bar with sliding action elements */}
            <div className="relative w-full z-20">
                <AnimatePresence mode="wait">
                    {selectedIds.length > 0 ? (
                        /* Bulk delete drawer */
                        <motion.div
                            key="bulk-bar"
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-between p-3.5 rounded-xl border border-destructive/20 bg-destructive/10 backdrop-blur-md shadow-md"
                        >
                            <span className="text-xs font-semibold text-destructive-foreground">
                                {selectedIds.length} transaction{selectedIds.length > 1 ? "s" : ""} selected for deletion
                            </span>
                            <div className="flex items-center gap-3">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setSelectedIds([])}
                                    className="text-muted-foreground hover:text-white hover:bg-white/5"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    variant="danger" 
                                    size="sm" 
                                    onClick={handleBulkDelete}
                                    className="shadow-md shadow-destructive/20"
                                >
                                    <Trash2 className="w-4 h-4 mr-1.5" /> Delete Selected
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        /* Filters top bar grid */
                        <motion.div
                            key="filter-bar"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 p-4 rounded-2xl border border-white/5 bg-card/45 backdrop-blur-md"
                        >
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                                <input
                                    type="text"
                                    placeholder="Search description..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="h-10 w-full rounded-xl border border-white/5 bg-secondary/30 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>

                            {/* Category Filter */}
                            <Select 
                                value={categoryFilter} 
                                onChange={(e) => setCategoryFilter(e.target.value)} 
                                className="h-10 text-xs py-1 rounded-xl"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </Select>

                            {/* Date From */}
                            <input
                                type="date"
                                placeholder="From Date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="h-10 w-full rounded-xl border border-white/5 bg-secondary/30 px-3.5 text-xs text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                            />

                            {/* Date To */}
                            <input
                                type="date"
                                placeholder="To Date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="h-10 w-full rounded-xl border border-white/5 bg-secondary/30 px-3.5 text-xs text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                            />

                            {/* Min Amount */}
                            <input
                                type="number"
                                placeholder="Min Amount"
                                value={minAmount}
                                onChange={(e) => setMinAmount(e.target.value)}
                                className="h-10 w-full rounded-xl border border-white/5 bg-secondary/30 px-3.5 text-xs text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                            />

                            {/* Max Amount */}
                            <input
                                type="number"
                                placeholder="Max Amount"
                                value={maxAmount}
                                onChange={(e) => setMaxAmount(e.target.value)}
                                className="h-10 w-full rounded-xl border border-white/5 bg-secondary/30 px-3.5 text-xs text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Expenses Table */}
            <Card className="hover:border-white/5 transition-colors overflow-hidden">
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 bg-white/[0.01]">
                                <th className="py-4 px-6 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={expenses.length > 0 && selectedIds.length === expenses.length}
                                        className="h-4 w-4 rounded border-white/10 bg-secondary text-primary focus:ring-primary cursor-pointer"
                                    />
                                </th>
                                <th className="py-4 px-6 cursor-pointer hover:text-white" onClick={() => handleSort("description")}>
                                    <div className="flex items-center gap-1.5">
                                        Description
                                        {sortBy === "description" && (sortOrder === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-primary" /> : <ChevronDown className="w-3.5 h-3.5 text-primary" />)}
                                    </div>
                                </th>
                                <th className="py-4 px-6 cursor-pointer hover:text-white" onClick={() => handleSort("categoryId")}>
                                    <div className="flex items-center gap-1.5">
                                        Category
                                        {sortBy === "categoryId" && (sortOrder === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-primary" /> : <ChevronDown className="w-3.5 h-3.5 text-primary" />)}
                                    </div>
                                </th>
                                <th className="py-4 px-6 cursor-pointer hover:text-white" onClick={() => handleSort("date")}>
                                    <div className="flex items-center gap-1.5">
                                        Date
                                        {sortBy === "date" && (sortOrder === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-primary" /> : <ChevronDown className="w-3.5 h-3.5 text-primary" />)}
                                    </div>
                                </th>
                                <th className="py-4 px-6 text-right cursor-pointer hover:text-white" onClick={() => handleSort("amount")}>
                                    <div className="flex items-center justify-end gap-1.5">
                                        Amount
                                        {sortBy === "amount" && (sortOrder === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-primary" /> : <ChevronDown className="w-3.5 h-3.5 text-primary" />)}
                                    </div>
                                </th>
                                <th className="py-4 px-6 w-16"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                /* Skeleton Loading State */
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={`skeleton-${idx}`} className="border-b border-white/5 animate-pulse">
                                        <td className="py-4 px-6 text-center"><div className="h-4 w-4 bg-white/5 rounded mx-auto" /></td>
                                        <td className="py-4 px-6"><div className="h-4 w-32 bg-white/5 rounded" /></td>
                                        <td className="py-4 px-6"><div className="h-4.5 w-20 bg-white/5 rounded-full" /></td>
                                        <td className="py-4 px-6"><div className="h-4 w-24 bg-white/5 rounded" /></td>
                                        <td className="py-4 px-6 text-right"><div className="h-4 w-16 bg-white/5 rounded ml-auto" /></td>
                                        <td className="py-4 px-6"></td>
                                    </tr>
                                ))
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-muted-foreground/60 font-medium">
                                        No expenses found. Add some or clear filters.
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((exp) => {
                                    const isRowSelected = selectedIds.includes(exp._id);
                                    const category = exp.categoryId || { name: "Uncategorized", color: "#6B7280" };

                                    return (
                                        <tr
                                            key={exp._id}
                                            className={cn(
                                                "border-b border-white/5 hover:bg-white/[0.015] group transition-colors",
                                                isRowSelected && "bg-primary/5 hover:bg-primary/8"
                                            )}
                                        >
                                            <td className="py-4 px-6 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isRowSelected}
                                                    onChange={() => handleSelectRow(exp._id)}
                                                    className="h-4 w-4 rounded border-white/10 bg-secondary text-primary focus:ring-primary cursor-pointer"
                                                />
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col text-left">
                                                    <span className="font-semibold text-white/90">{exp.description}</span>
                                                    {exp.note && <span className="text-[10px] text-muted-foreground/80 mt-0.5 max-w-[250px] truncate">{exp.note}</span>}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <Badge variant="neutral" style={{ backgroundColor: `${category.color}15`, borderColor: `${category.color}30`, color: category.color }} className="capitalize">
                                                    {category.name}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-6 text-muted-foreground">
                                                {new Date(exp.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                            </td>
                                            <td className="py-4 px-6 text-right font-bold text-white/95">
                                                ${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-2 px-4 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteExpense(exp._id)}
                                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 p-2 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
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
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 border-t border-white/5 bg-white/[0.005]">
                        <span className="text-xs text-muted-foreground">
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
            </Card>

            {/* Add Expense Right-Side Drawer Form */}
            <AnimatePresence>
                {isDrawerOpen && (
                    <>
                        {/* Drawer Backdrop Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDrawerOpen(false)}
                            className="fixed inset-0 bg-black z-40 cursor-pointer"
                        />

                        {/* Drawer Body Panel */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-card/95 border-l border-white/5 z-50 p-6 shadow-2xl backdrop-blur-xl flex flex-col h-full"
                        >
                            {/* Drawer Header */}
                            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                                <div className="text-left">
                                    <h2 className="text-lg font-bold text-white">Add New Expense</h2>
                                    <p className="text-xs text-muted-foreground/80">Log your transaction detail with auto alerts.</p>
                                </div>
                                <button
                                    onClick={() => setIsDrawerOpen(false)}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
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

                                    {/* Category Select Swatches */}
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
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-4">
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

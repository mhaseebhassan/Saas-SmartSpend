"use client";

import * as React from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    ChevronUp,
    ChevronDown,
    Plus,
    X,
    Filter,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Edit2,
    DollarSign,
    TrendingUp,
    Layers,
    Receipt
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Toggle } from "@/components/ui/Toggle";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { SkeletonLine } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

export default function ExpensesPageClient() {
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

    const [formSubmitting, setFormSubmitting] = React.useState(false);

    const [search, setSearch] = React.useState("");
    const [categoryFilter, setCategoryFilter] = React.useState("");
    const [dateFrom, setDateFrom] = React.useState("");
    const [dateTo, setDateTo] = React.useState("");
    const [minAmount, setMinAmount] = React.useState("");
    const [maxAmount, setMaxAmount] = React.useState("");

    const [sortBy, setSortBy] = React.useState("date");
    const [sortOrder, setSortOrder] = React.useState("desc");

    const [page, setPage] = React.useState(1);

    const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

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

    // --- SWR: Categories ---
    const { data: categoriesData } = useSWR<Category[]>('/api/categories', fetcher);
    const categories = categoriesData || [];

    // --- SWR: Expenses (dynamic key from filters/sort/page) ---
    const expensesKey = React.useMemo(() => {
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
        return `/api/expenses?${params.toString()}`;
    }, [page, search, categoryFilter, dateFrom, dateTo, minAmount, maxAmount, sortBy, sortOrder]);

    const { data: expensesData, isLoading: loading } = useSWR(expensesKey, fetcher);
    const expenses: Expense[] = React.useMemo(() => expensesData?.expenses || [], [expensesData?.expenses]);
    const totalPages = expensesData?.pagination?.pages || 1;
    const totalItems = expensesData?.pagination?.total || 0;

    React.useEffect(() => {
        setPage(1);
    }, [search, categoryFilter, dateFrom, dateTo, minAmount, maxAmount]);

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("desc");
        }
        setPage(1);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedIds(expenses.map(exp => exp._id));
        else setSelectedIds([]);
    };

    const handleSelectRow = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Delete ${selectedIds.length} selected expenses?`)) return;

        try {
            const res = await fetch("/api/expenses/bulk", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedIds })
            });

            if (res.ok) {
                setSelectedIds([]);
                mutate(expensesKey);
            }
        } catch (err) {}
    };

    const handleDeleteExpense = async (id: string) => {
        if (!confirm("Delete this expense?")) return;

        try {
            const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
            if (res.ok) mutate(expensesKey);
        } catch (err) {}
    };

    const handleOpenAddDrawer = () => {
        setEditingExpenseId(null);
        setFormData({
            description: "", amount: "", categoryId: "", date: new Date().toISOString().slice(0, 10),
            isRecurring: false, recurrenceInterval: "monthly", note: ""
        });
        setFormErrors({});
        setIsDrawerOpen(true);
    };

    const handleOpenEditDrawer = (exp: any) => {
        setEditingExpenseId(exp._id);
        setFormData({
            description: exp.description || "", amount: exp.amount?.toString() || "",
            categoryId: exp.categoryId?._id || exp.categoryId || "",
            date: exp.date ? new Date(exp.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            isRecurring: exp.isRecurring || false, recurrenceInterval: exp.recurrenceInterval || "monthly",
            note: exp.note || ""
        });
        setFormErrors({});
        setIsDrawerOpen(true);
    };

    const handleAddExpenseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const errors: Record<string, string> = {};
        if (!formData.description.trim()) errors.description = "Required.";
        if (!formData.amount || parseFloat(formData.amount) <= 0) errors.amount = "Must be > 0.";
        if (!formData.categoryId) errors.categoryId = "Required.";
        if (!formData.date) errors.date = "Required.";

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setFormErrors({});
        setFormSubmitting(true);

        const payload = {
            amount: parseFloat(formData.amount), categoryId: formData.categoryId,
            description: formData.description, date: new Date(formData.date), note: formData.note,
            isRecurring: formData.isRecurring, recurrenceInterval: formData.isRecurring ? formData.recurrenceInterval : null
        };

        try {
            let res;
            if (editingExpenseId) {
                res = await fetch(`/api/expenses/${editingExpenseId}`, {
                    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
                });
            } else {
                res = await fetch("/api/expenses", {
                    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
                });
            }

            if (res.ok) {
                setIsDrawerOpen(false);
                setEditingExpenseId(null);
                mutate(expensesKey);
            }
        } catch (err) {} finally {
            setFormSubmitting(false);
        }
    };

    const totalSpent = React.useMemo(() => expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0), [expenses]);
    const avgDailySpend = React.useMemo(() => {
        if (expenses.length === 0) return 0;
        const uniqueDates = new Set(expenses.map(e => {
            try { return new Date(e.date).toISOString().slice(0, 10); } catch { return e.date; }
        }));
        return totalSpent / Math.max(1, uniqueDates.size);
    }, [expenses, totalSpent]);

    return (
        <div className="space-y-6 text-left select-none pb-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-white tracking-tight">Expenses</h1>
                    <p className="text-sm text-white/50 mt-1">List, filter, and audit your personal expenditures.</p>
                </div>
                <Button onClick={handleOpenAddDrawer} className="bg-white text-black hover:bg-white/90 font-medium">
                    <Plus className="w-4 h-4 mr-2" /> Add Expense
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-white/[0.08] bg-[#09090B] p-5 flex items-center justify-between">
                    <div>
                        <div className="text-[10px] uppercase font-semibold text-white/40 tracking-wider mb-1">Total Page Spent</div>
                        <div className="text-xl font-semibold text-white">${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-white/[0.02] border border-white/[0.08] flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-white/60" />
                    </div>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-[#09090B] p-5 flex items-center justify-between">
                    <div>
                        <div className="text-[10px] uppercase font-semibold text-white/40 tracking-wider mb-1">Avg Daily Spend</div>
                        <div className="text-xl font-semibold text-white">${avgDailySpend.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-white/[0.02] border border-white/[0.08] flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white/60" />
                    </div>
                </div>
                <div className="rounded-xl border border-white/[0.08] bg-[#09090B] p-5 flex items-center justify-between">
                    <div>
                        <div className="text-[10px] uppercase font-semibold text-white/40 tracking-wider mb-1">Total Transactions</div>
                        <div className="text-xl font-semibold text-white">{totalItems.toLocaleString()}</div>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-white/[0.02] border border-white/[0.08] flex items-center justify-center">
                        <Layers className="w-4 h-4 text-white/60" />
                    </div>
                </div>
            </div>

            <div className="p-4 rounded-xl border border-white/[0.08] bg-[#09090B] shadow-sm">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                            type="text" placeholder="Search description..." value={search} onChange={(e) => setSearch(e.target.value)}
                            className="h-10 w-full rounded-lg border border-white/[0.08] bg-transparent pl-9 pr-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/20"
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="h-10 text-sm bg-transparent border-white/[0.08]">
                            <option value="">All Categories</option>
                            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                        </Select>
                    </div>
                    <Button variant="secondary" onClick={() => setIsAdvancedFiltersOpen(!isAdvancedFiltersOpen)} className="h-10">
                        <Filter className="w-4 h-4 mr-2" />
                        {isAdvancedFiltersOpen ? "Hide" : "More"}
                    </Button>
                </div>

                {isAdvancedFiltersOpen && (
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-white/[0.08]">
                        <div>
                            <label className="text-[10px] uppercase font-medium text-white/40 block mb-1">From Date</label>
                            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-9 w-full rounded-lg border border-white/[0.08] bg-transparent px-3 text-xs text-white" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-medium text-white/40 block mb-1">To Date</label>
                            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-9 w-full rounded-lg border border-white/[0.08] bg-transparent px-3 text-xs text-white" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-medium text-white/40 block mb-1">Min Amount</label>
                            <input type="number" placeholder="Min" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className="h-9 w-full rounded-lg border border-white/[0.08] bg-transparent px-3 text-xs text-white" />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-medium text-white/40 block mb-1">Max Amount</label>
                            <input type="number" placeholder="Max" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} className="h-9 w-full rounded-lg border border-white/[0.08] bg-transparent px-3 text-xs text-white" />
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-[#09090B] border border-white/[0.08] rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="border-b border-white/[0.08] text-[10px] font-medium uppercase tracking-wider text-white/40 bg-white/[0.02]">
                                <th className="py-3 px-4 w-12 text-center">
                                    <input type="checkbox" onChange={handleSelectAll} checked={expenses.length > 0 && selectedIds.length === expenses.length} className="rounded border-white/[0.08] bg-transparent" />
                                </th>
                                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort("description")}>
                                    <div className="flex items-center gap-1">Description {sortBy === "description" && (sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}</div>
                                </th>
                                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort("categoryId")}>
                                    <div className="flex items-center gap-1">Category {sortBy === "categoryId" && (sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}</div>
                                </th>
                                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort("date")}>
                                    <div className="flex items-center gap-1">Date {sortBy === "date" && (sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}</div>
                                </th>
                                <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort("amount")}>
                                    <div className="flex items-center justify-end gap-1">Amount {sortBy === "amount" && (sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}</div>
                                </th>
                                <th className="py-3 px-4 w-20"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <>{Array.from({ length: 7 }).map((_, i) => (
                                    <tr key={`skel-${i}`} className="border-b border-white/[0.08]">
                                        <td className="py-3 px-4 w-12 text-center"><SkeletonLine className="h-4 w-4 mx-auto rounded" /></td>
                                        <td className="py-3 px-4"><SkeletonLine className="h-4 w-36" /></td>
                                        <td className="py-3 px-4"><SkeletonLine className="h-5 w-20 rounded-full" /></td>
                                        <td className="py-3 px-4"><SkeletonLine className="h-4 w-24" /></td>
                                        <td className="py-3 px-4 text-right"><SkeletonLine className="h-4 w-16 ml-auto" /></td>
                                        <td className="py-3 px-4 w-20" />
                                    </tr>
                                ))}</>
                            ) : expenses.length === 0 ? (
                                <tr><td colSpan={6} className="p-0"><EmptyState icon={Receipt} title="No expenses found" description="Start tracking your spending by adding your first expense." actionLabel="Add Expense" onAction={handleOpenAddDrawer} /></td></tr>
                            ) : (
                                expenses.map((exp) => {
                                    const isRowSelected = selectedIds.includes(exp._id);
                                    const category = (exp.categoryId && typeof exp.categoryId === "object") ? exp.categoryId : categories.find(c => c._id === exp.categoryId) || { name: "Uncategorized" };

                                    return (
                                        <tr key={exp._id} className={cn("border-b border-white/[0.08] hover:bg-white/[0.02] group", isRowSelected && "bg-white/[0.04]")}>
                                            <td className="py-3 px-4 w-12 text-center">
                                                <input type="checkbox" checked={isRowSelected} onChange={() => handleSelectRow(exp._id)} className="rounded border-white/[0.08] bg-transparent" />
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-white">{exp.description}</div>
                                                {exp.note && <div className="text-[10px] text-white/40 mt-0.5 truncate max-w-[200px]">{exp.note}</div>}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge variant="neutral" className="text-[10px] font-normal border-white/[0.08] text-white/60">{category.name}</Badge>
                                            </td>
                                            <td className="py-3 px-4 text-white/60 text-xs">
                                                {new Date(exp.date).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4 text-right font-medium text-white">
                                                ${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-3 px-4 w-20 text-center">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100">
                                                    <button onClick={() => handleOpenEditDrawer(exp)} className="p-1 text-white/40 hover:text-white rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleDeleteExpense(exp._id)} className="p-1 text-white/40 hover:text-red-400 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && totalPages > 1 && (
                    <div className="flex justify-between items-center px-4 py-3 border-t border-white/[0.08] bg-white/[0.01]">
                        <span className="text-[11px] text-white/40">Page {page} of {totalPages} ({totalItems} total)</span>
                        <div className="flex gap-2">
                            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(prev => Math.max(prev - 1, 1))} className="h-7 text-[10px]"><ChevronLeft className="w-3 h-3 mr-1" /> Prev</Button>
                            <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} className="h-7 text-[10px]">Next <ChevronRight className="w-3 h-3 ml-1" /></Button>
                        </div>
                    </div>
                )}
            </div>

            {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-4 py-2 rounded-full border border-white/[0.08] bg-[#111111] shadow-2xl">
                    <span className="text-xs font-medium text-white">{selectedIds.length} selected</span>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])} className="h-7 text-xs text-white/40 hover:text-white">Cancel</Button>
                    <Button variant="danger" size="sm" onClick={handleBulkDelete} className="h-7 text-xs bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white">Delete</Button>
                </div>
            )}

            {isDrawerOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
                    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="relative w-full max-w-sm bg-[#09090B] border-l border-white/[0.08] p-6 shadow-2xl flex flex-col h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-medium text-white">{editingExpenseId ? "Edit Expense" : "New Expense"}</h2>
                            <button onClick={() => setIsDrawerOpen(false)} className="p-1 text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleAddExpenseSubmit} className="flex-1 overflow-y-auto space-y-4">
                            <Input label="Description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} error={formErrors.description} className="bg-transparent border-white/[0.08]" />
                            <Input label="Amount ($)" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))} error={formErrors.amount} className="bg-transparent border-white/[0.08]" />
                            <Select label="Category" value={formData.categoryId} onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))} error={formErrors.categoryId} className="bg-transparent border-white/[0.08]">
                                <option value="">Select Category</option>
                                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                            </Select>
                            <Input label="Date" type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} error={formErrors.date} className="bg-transparent border-white/[0.08]" />
                            <Input label="Note" value={formData.note} onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))} className="bg-transparent border-white/[0.08]" />

                            <div className="p-4 rounded-lg border border-white/[0.08] bg-white/[0.02]">
                                <Toggle label="Recurring" description="Repeat this expense" checked={formData.isRecurring} onChange={(checked) => setFormData(prev => ({ ...prev, isRecurring: checked }))} />
                                {formData.isRecurring && (
                                    <div className="mt-4">
                                        <Select label="Interval" value={formData.recurrenceInterval} onChange={(e) => setFormData(prev => ({ ...prev, recurrenceInterval: e.target.value }))} className="bg-transparent border-white/[0.08]">
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 mt-auto">
                                <Button type="submit" isLoading={formSubmitting} className="w-full bg-white text-black hover:bg-white/90">Save</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

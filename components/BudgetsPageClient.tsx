"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingCart,
    Car,
    Home,
    Coffee,
    Tv,
    Activity,
    Plane,
    BookOpen,
    Gift,
    TrendingUp,
    Smartphone,
    HelpCircle,
    Plus,
    Edit2,
    Trash2,
    Sparkles,
    AlertCircle,
    Info,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

// Icon Map for Dynamic Lucide Rendering
const ICON_MAP = {
    shopping: ShoppingCart,
    transport: Car,
    housing: Home,
    food: Coffee,
    entertainment: Tv,
    health: Activity,
    travel: Plane,
    education: BookOpen,
    gifts: Gift,
    investments: TrendingUp,
    utilities: Smartphone,
    other: HelpCircle
};

// Colors preset swatches
const COLOR_PRESETS = [
    { name: "Indigo", value: "#6366F1" },
    { name: "Emerald", value: "#10B981" },
    { name: "Amber", value: "#F59E0B" },
    { name: "Red", value: "#EF4444" },
    { name: "Blue", value: "#3B82F6" },
    { name: "Pink", value: "#EC4899" },
    { name: "Purple", value: "#8B5CF6" },
    { name: "Cyan", value: "#06B6D4" }
];

export default function BudgetsPageClient() {
    const [categories, setCategories] = React.useState([]);
    const [expenses, setExpenses] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    
    // Month Navigation State
    const [selectedDate, setSelectedDate] = React.useState(() => new Date());
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingCategory, setEditingCategory] = React.useState(null);
    const [modalSubmitting, setModalSubmitting] = React.useState(false);

    // Modal Form States
    const [name, setName] = React.useState("");
    const [limit, setLimit] = React.useState("");
    const [selectedColor, setSelectedColor] = React.useState(COLOR_PRESETS[0].value);
    const [selectedIcon, setSelectedIcon] = React.useState("other");
    const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

    // Fetch initial datasets filtered by the selected month/year
    const fetchData = async () => {
        setLoading(true);
        try {
            const year = selectedDate.getFullYear();
            const month = selectedDate.getMonth();
            const dateFrom = new Date(year, month, 1).toISOString();
            const dateTo = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();

            const [catRes, expRes] = await Promise.all([
                fetch("/api/categories"),
                fetch(`/api/expenses?limit=1000&dateFrom=${dateFrom}&dateTo=${dateTo}`)
            ]);

            if (catRes.ok && expRes.ok) {
                const catData = await catRes.json();
                const expData = await expRes.json();
                setCategories(catData || []);
                setExpenses(expData.expenses || []);
            }
        } catch (err) {
            console.error("Error fetching datasets:", err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, [selectedDate]);

    // Prev / Next Month Helpers
    const handlePrevMonth = () => {
        setSelectedDate(prev => {
            const next = new Date(prev);
            next.setMonth(next.getMonth() - 1);
            return next;
        });
    };

    const handleNextMonth = () => {
        setSelectedDate(prev => {
            const next = new Date(prev);
            next.setMonth(next.getMonth() + 1);
            return next;
        });
    };

    // 1. Expense calculation per category
    const getSpentForCategory = (catId) => {
        return expenses
            .filter(exp => exp.categoryId?._id === catId || exp.categoryId === catId)
            .reduce((sum, curr) => sum + curr.amount, 0);
    };

    // 2. Global statistics
    const totalSpent = expenses.reduce((sum, curr) => sum + curr.amount, 0);
    const totalBudget = categories.reduce((sum, curr) => sum + (curr.monthlyLimit || 0), 0);
    const budgetPercentage = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;

    // Determine overall glowing color gradient for the header progress bar
    let overallGradient = "bg-gradient-to-r from-cyan-400 to-teal-500";
    if (budgetPercentage > 85) {
        overallGradient = "bg-gradient-to-r from-pink-500 to-rose-500";
    } else if (budgetPercentage > 50) {
        overallGradient = "bg-gradient-to-r from-violet-500 to-purple-500";
    }

    // 3. Open modal handler (Add mode)
    const handleOpenAddModal = () => {
        setEditingCategory(null);
        setName("");
        setLimit("");
        setSelectedColor(COLOR_PRESETS[0].value);
        setSelectedIcon("other");
        setFormErrors({});
        setIsModalOpen(true);
    };

    // 4. Open modal handler (Edit mode)
    const handleOpenEditModal = (cat) => {
        setEditingCategory(cat);
        setName(cat.name);
        setLimit(cat.monthlyLimit ? cat.monthlyLimit.toString() : "");
        setSelectedColor(cat.color || COLOR_PRESETS[0].value);
        setSelectedIcon(cat.icon || "other");
        setFormErrors({});
        setIsModalOpen(true);
    };

    // 5. Delete category handler
    const handleDeleteCategory = async (id) => {
        if (!confirm("Are you sure you want to delete this category budget? This will remove the budget card, but all past transaction lists remain preserved as uncategorized.")) return;

        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                fetchData();
            } else {
                alert("Failed to delete category.");
            }
        } catch (err) {
            console.error("Error deleting category:", err);
        }
    };

    // 6. Submit modal handler (Create/Update)
    const handleModalSubmit = async (e) => {
        e.preventDefault();
        
        // Validations
        const errors: Record<string, string> = {};
        if (!name.trim()) errors.name = "Category name is required.";
        if (!limit || parseFloat(limit) < 0) errors.limit = "Limit must be a positive number.";

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setFormErrors({});
        setModalSubmitting(true);

        const payload = {
            name: name.trim(),
            color: selectedColor,
            icon: selectedIcon,
            monthlyLimit: parseFloat(limit)
        };

        try {
            let res;
            if (editingCategory) {
                // Update
                res = await fetch(`/api/categories/${editingCategory._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            } else {
                // Create
                res = await fetch("/api/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            }

            if (res.ok) {
                setIsModalOpen(false);
                fetchData();
            } else {
                const data = await res.json();
                alert(data.message || "Failed to save category budget.");
            }
        } catch (err) {
            console.error("Error saving category:", err);
        } finally {
            setModalSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 text-left select-none relative">
            {/* Header with Integrated Month Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white/95">Budget Planner</h1>
                    <p className="text-xs text-[#94A3B8]">Define monthly category allocations and audit limits.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    {/* Styled Month Control Widget */}
                    <div className="flex items-center justify-between sm:justify-start bg-[#111827]/60 backdrop-blur-xl border border-white/[0.06] rounded-xl p-1 shadow-md w-full sm:w-auto">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePrevMonth}
                            className="h-8 w-8 text-[#94A3B8] hover:text-white hover:bg-white/[0.04] transition-all shrink-0"
                            aria-label="Previous Month"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-xs font-bold text-white px-3 flex-1 sm:flex-initial min-w-[110px] text-center select-none tracking-wider uppercase">
                            {selectedDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleNextMonth}
                            className="h-8 w-8 text-[#94A3B8] hover:text-white hover:bg-white/[0.04] transition-all shrink-0"
                            aria-label="Next Month"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <Button 
                        onClick={handleOpenAddModal}
                        className="bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 text-white font-bold border-0 hover:opacity-90 shadow-[0_0_20px_rgba(6,182,212,0.25)] h-10 px-4 rounded-xl ml-auto sm:ml-0 w-full sm:w-auto"
                    >
                        <Plus className="w-4.5 h-4.5 mr-1.5" /> Add Budget
                    </Button>
                </div>
            </div>

            {/* Overall Top Banner */}
            {!loading && categories.length > 0 && (
                <div className="relative p-6 rounded-2xl border border-white/[0.06] bg-[#111827]/40 backdrop-blur-xl overflow-hidden group hover:border-cyan-400/20 transition-all duration-300 shadow-xl">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-full blur-[80px] opacity-10 pointer-events-none group-hover:opacity-15 transition-opacity" />
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-[#0A0E1A]/80 text-[#06B6D4] rounded-xl border border-white/[0.06] relative shadow-md">
                                <Sparkles className="w-5 h-5 relative z-10" />
                                <div className="absolute inset-0 bg-cyan-500/10 blur-sm rounded-xl" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-sm font-bold text-white tracking-wide">Overall Monthly Spending</h3>
                                <p className="text-[11px] text-[#94A3B8]">Aggregated category targets for this month.</p>
                            </div>
                        </div>
                        <div className="text-left sm:text-right">
                            <span className="text-2xl font-extrabold text-white tracking-tight">
                                ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-xs text-[#94A3B8] font-medium"> of ${totalBudget.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Progress Bar overall */}
                    <div className="space-y-3">
                        <div className="relative h-3.5 w-full bg-[#0A0E1A]/60 rounded-full border border-white/[0.04] p-[1px]">
                            {/* Glowing effect inside a custom backdrop */}
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${budgetPercentage}%` }}
                                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                className={cn(
                                    "absolute inset-y-0 left-0 rounded-full blur-md opacity-60 transition-all duration-500 ease-out",
                                    overallGradient
                                )}
                            />
                            {/* actual progress fill */}
                            <div className="absolute inset-0 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${budgetPercentage}%` }}
                                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                    className={cn(
                                        "h-full rounded-full transition-all duration-500 ease-out",
                                        overallGradient
                                    )}
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-[#94A3B8] font-semibold">
                            <span>0%</span>
                            <span className="text-[#F1F5F9] bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-md backdrop-blur-sm shadow-sm font-bold">
                                {budgetPercentage.toFixed(1)}% Limit Used
                            </span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Grid of Bento Budget Cards */}
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    /* Skeletons load grid */
                    Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="h-48 w-full rounded-2xl bg-[#1A2035]/40 border border-white/[0.06] animate-pulse overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                        </div>
                    ))
                ) : categories.length === 0 ? (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-[#94A3B8]/60 text-sm p-6 bg-[#111827]/40 border border-white/[0.06] rounded-2xl backdrop-blur-xl">
                        <AlertCircle className="w-10 h-10 mb-2 text-cyan-400 animate-pulse" />
                        <span>No monthly budgets established for this period. Create one above!</span>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {categories.map((cat) => {
                            const spent = getSpentForCategory(cat._id);
                            const limitVal = cat.monthlyLimit || 0;
                            const percentage = limitVal > 0 ? (spent / limitVal) * 100 : 0;
                            const progressWidth = Math.min(100, percentage);
                            const remaining = limitVal - spent;
                            const isOver = spent > limitVal;

                            // Dynamic Lucide rendering
                            const Icon = ICON_MAP[cat.icon || "other"] || HelpCircle;

                            // Smooth filling glows based on utilization levels
                            let barGradient = "bg-gradient-to-r from-cyan-400 to-teal-500";
                            if (percentage > 85) {
                                barGradient = "bg-gradient-to-r from-pink-500 to-rose-500";
                            } else if (percentage > 50) {
                                barGradient = "bg-gradient-to-r from-violet-500 to-purple-500";
                            }

                            return (
                                <motion.div
                                    key={cat._id}
                                    layout
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    className="relative rounded-2xl border border-white/[0.06] bg-[#111827]/60 backdrop-blur-xl overflow-hidden group hover:border-cyan-400/20 hover:shadow-[0_0_30px_rgba(6,182,212,0.08)] transition-all duration-300 flex flex-col justify-between p-5 min-h-[220px] shadow-lg"
                                >
                                    {/* Subtle backdrop color glow based on category color swatch */}
                                    <div 
                                        className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-3xl opacity-[0.02] group-hover:opacity-[0.08] transition-opacity duration-300 pointer-events-none animate-none"
                                        style={{ backgroundColor: cat.color || "#6366F1" }}
                                    />

                                    {/* Card Header */}
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex items-center gap-3">
                                            {/* Circular container for icon with subtle aurora backlighting */}
                                            <div className="relative flex items-center justify-center w-12 h-12 rounded-full border border-white/[0.08] bg-[#0A0E1A]/80 shadow-[0_0_15px_rgba(0,0,0,0.2)] shrink-0">
                                                {/* Subtle aurora gradient background glow inside the icon container */}
                                                <div 
                                                    className="absolute inset-0 rounded-full blur-sm opacity-15"
                                                    style={{
                                                        background: `radial-gradient(circle, ${cat.color || "#6366F1"} 0%, transparent 70%)`
                                                    }}
                                                />
                                                {/* Subtle outer backlight shadow halo */}
                                                <div 
                                                    className="absolute -inset-1 rounded-full blur-md opacity-25"
                                                    style={{
                                                        background: `radial-gradient(circle, ${cat.color || "#6366F1"} 0%, transparent 80%)`
                                                    }}
                                                />
                                                <Icon className="w-5 h-5 relative z-10" style={{ color: cat.color || "#6366F1" }} />
                                            </div>
                                            
                                            <div className="text-left flex flex-col min-w-0">
                                                <span className="font-bold text-white/95 truncate text-sm tracking-wide">{cat.name}</span>
                                                {limitVal > 0 ? (
                                                    <span className="text-[10px] text-[#94A3B8]/80 mt-0.5 font-medium">
                                                        Limit: ${limitVal.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-[#64748B] mt-0.5 flex items-center gap-1">
                                                        <Info className="w-3 h-3 shrink-0" /> Set Limit
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Controls */}
                                        <div className="flex items-center gap-1 bg-[#0A0E1A]/50 backdrop-blur-md rounded-lg p-0.5 border border-white/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button 
                                                onClick={() => handleOpenEditModal(cat)}
                                                className="p-1.5 rounded-md text-[#94A3B8] hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                                                aria-label="Edit budget"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteCategory(cat._id)}
                                                className="p-1.5 rounded-md text-[#94A3B8] hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                                aria-label="Delete budget"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Card Content & Spend Analytics */}
                                    <div className="mt-6 space-y-4">
                                        <div className="flex justify-between items-end">
                                            <div className="text-left">
                                                <span className="text-xl font-extrabold text-white tracking-tight">
                                                    ${spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                                <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider block mt-0.5">Spent overall</span>
                                            </div>
                                            
                                            {limitVal > 0 && (
                                                <div className="text-right">
                                                    <span className={cn(
                                                        "text-xs font-bold block tracking-tight",
                                                        isOver ? "text-red-400" : "text-[#10B981]"
                                                    )}>
                                                        {isOver ? "-" : ""}${Math.abs(remaining).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                    </span>
                                                    <span className="text-[9px] text-[#64748B] font-bold uppercase tracking-wider block mt-0.5">
                                                        {isOver ? "Over Budget" : "Remaining"}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Animated Progress Indicator */}
                                        {limitVal > 0 && (
                                            <div className="space-y-2">
                                                <div className="relative h-3 w-full bg-[#0A0E1A]/60 rounded-full border border-white/[0.04] p-[1px]">
                                                    {/* Glow layer */}
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progressWidth}%` }}
                                                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                                        className={cn(
                                                            "absolute inset-y-0 left-0 rounded-full blur-sm opacity-50 transition-all duration-500 ease-out",
                                                            barGradient
                                                        )}
                                                    />
                                                    {/* actual progress fill */}
                                                    <div className="absolute inset-0 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progressWidth}%` }}
                                                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                                            className={cn("h-full rounded-full transition-all duration-500 ease-out", barGradient)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] text-[#94A3B8] font-bold">
                                                    <span className="text-[#F1F5F9]">{percentage.toFixed(0)}% Used</span>
                                                    {isOver && (
                                                        <span className="text-red-400 animate-pulse flex items-center gap-1 font-extrabold">
                                                            <AlertCircle className="w-2.5 h-2.5" /> Exceeded!
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>

            {/* Add/Edit Budget Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCategory ? "Update Budget Settings" : "Configure Category Budget"}
                description="Set individual expenditure controls with category branding."
                className="bg-[#0A0E1A]/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl"
            >
                <form onSubmit={handleModalSubmit} className="space-y-5">
                    {/* Category Name */}
                    <Input
                        label="Category Name"
                        placeholder="e.g. Health & Fitness"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={formErrors.name}
                        className="focus:border-cyan-400/50 focus:ring-cyan-400/10 focus:ring-2 bg-[#0A0E1A]/60 border-white/[0.06] text-white/95 placeholder:text-muted-foreground/45"
                    />

                    {/* Limit */}
                    <Input
                        label="Monthly Budget Limit ($)"
                        placeholder="0.00"
                        type="number"
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
                        error={formErrors.limit}
                        className="focus:border-cyan-400/50 focus:ring-cyan-400/10 focus:ring-2 bg-[#0A0E1A]/60 border-white/[0.06] text-white/95 placeholder:text-muted-foreground/45"
                    />

                    {/* Preset Color Swatches */}
                    <div className="flex flex-col space-y-2 text-left">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Select Theme Color</span>
                        <div className="grid grid-cols-8 gap-2.5">
                            {COLOR_PRESETS.map((color) => (
                                <button
                                    key={color.name}
                                    type="button"
                                    onClick={() => setSelectedColor(color.value)}
                                    className={cn(
                                        "h-9 w-full rounded-xl border border-white/[0.06] transition-all cursor-pointer relative flex items-center justify-center hover:scale-110 active:scale-95 shadow-inner",
                                        selectedColor === color.value && "ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-[#0A0E1A] scale-105"
                                    )}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                >
                                    {selectedColor === color.value && (
                                        <span className="h-1.5 w-1.5 bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preset Icons Selection grid (12 Icons) */}
                    <div className="flex flex-col space-y-2 text-left">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">Select Icon Swatch</span>
                        <div className="grid grid-cols-6 gap-3">
                            {Object.keys(ICON_MAP).map((iconKey) => {
                                const IconComp = ICON_MAP[iconKey];
                                const isSelected = selectedIcon === iconKey;
                                return (
                                    <button
                                        key={iconKey}
                                        type="button"
                                        onClick={() => setSelectedIcon(iconKey)}
                                        className={cn(
                                            "h-10 rounded-xl border border-white/[0.06] bg-[#111827]/40 flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer relative hover:scale-105 active:scale-95 animate-none",
                                            isSelected && "border-cyan-400/50 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 text-cyan-400 hover:text-cyan-400 hover:bg-cyan-500/10"
                                        )}
                                        title={iconKey}
                                    >
                                        <IconComp className="w-5 h-5" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Form Controls */}
                    <div className="mt-8 border-t border-white/[0.06] pt-5 flex items-center justify-end gap-3 shrink-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsModalOpen(false)}
                            className="text-[#94A3B8] hover:text-white hover:bg-white/[0.04]"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isLoading={modalSubmitting}
                            className="px-6 bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 text-white border-0 hover:opacity-90 shadow-[0_0_20px_rgba(6,182,212,0.25)] font-bold rounded-xl"
                        >
                            {editingCategory ? "Update Budget" : "Create Budget"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

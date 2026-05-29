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
    Info
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
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingCategory, setEditingCategory] = React.useState(null);
    const [modalSubmitting, setModalSubmitting] = React.useState(false);

    // Modal Form States
    const [name, setName] = React.useState("");
    const [limit, setLimit] = React.useState("");
    const [selectedColor, setSelectedColor] = React.useState(COLOR_PRESETS[0].value);
    const [selectedIcon, setSelectedIcon] = React.useState("other");
    const [formErrors, setFormErrors] = React.useState({});

    // Fetch initial datasets
    const fetchData = async () => {
        setLoading(true);
        try {
            const [catRes, expRes] = await Promise.all([
                fetch("/api/categories"),
                fetch("/api/expenses?limit=1000") // Get all current month expenses
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
    }, []);

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
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white/95">Budget Planner</h1>
                    <p className="text-xs text-muted-foreground">Define monthly category allocations and audit limits.</p>
                </div>
                <Button onClick={handleOpenAddModal}>
                    <Plus className="w-4.5 h-4.5 mr-2" /> Add Budget
                </Button>
            </div>

            {/* Overall Top Banner */}
            {!loading && categories.length > 0 && (
                <div className="relative p-6 rounded-2xl border border-white/5 bg-card/45 backdrop-blur-md overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/15">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-sm font-bold text-white">Overall Monthly Spending</h3>
                                <p className="text-[11px] text-muted-foreground">Aggregated category targets for this month.</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-extrabold text-white">
                                ${totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                            </span>
                            <span className="text-xs text-muted-foreground"> of ${totalBudget.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Progress Bar overall */}
                    <div className="space-y-2">
                        <div className="h-3 w-full bg-secondary/30 rounded-full overflow-hidden relative">
                            {/* Inner progress fill animates on load */}
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${budgetPercentage}%` }}
                                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                className={cn(
                                    "h-full rounded-full transition-all duration-300",
                                    budgetPercentage > 90 ? "bg-destructive shadow-[0_0_12px_rgba(239,68,68,0.3)]" : 
                                    budgetPercentage > 70 ? "bg-warning shadow-[0_0_12px_rgba(245,158,11,0.3)]" : 
                                    "bg-primary shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                                )}
                            />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold">
                            <span>0%</span>
                            <span className="text-white bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                                {budgetPercentage.toFixed(1)}% Limit Used
                            </span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Grid of Budget Cards */}
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    /* Skeletons load grid */
                    Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="h-44 w-full rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
                    ))
                ) : categories.length === 0 ? (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-muted-foreground/60 text-sm p-6 bg-white/[0.01] border border-white/5 rounded-2xl">
                        <AlertCircle className="w-10 h-10 mb-2 text-muted-foreground/40 animate-pulse" />
                        <span>No monthly budgets established. Create one above!</span>
                    </div>
                ) : (
                    categories.map((cat) => {
                        const spent = getSpentForCategory(cat._id);
                        const limitVal = cat.monthlyLimit || 0;
                        const percentage = limitVal > 0 ? Math.min(120, (spent / limitVal) * 100) : 0;
                        const remaining = limitVal - spent;
                        const isOver = spent > limitVal;

                        // Dynamic Lucide rendering
                        const Icon = ICON_MAP[cat.icon || "other"] || HelpCircle;

                        // Progress colors matching threshold
                        const barColors = {
                            normal: "bg-primary shadow-[0_0_8px_rgba(99,102,241,0.15)]",
                            warning: "bg-warning shadow-[0_0_8px_rgba(245,158,11,0.15)]",
                            danger: "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.15)]"
                        };

                        let currentBarColor = barColors.normal;
                        if (percentage > 90) currentBarColor = barColors.danger;
                        else if (percentage > 70) currentBarColor = barColors.warning;

                        return (
                            <motion.div
                                key={cat._id}
                                layout
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                className="relative rounded-2xl border border-white/5 bg-card/45 backdrop-blur-md overflow-hidden group hover:border-white/10 hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)] transition-all duration-300"
                            >
                                {/* Glow highlights based on category accent color */}
                                <div 
                                    className="absolute -top-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-[0.03] group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                                    style={{ backgroundColor: cat.color || "#6366F1" }}
                                />

                                {/* Card Header */}
                                <div className="p-5 flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div 
                                            className="p-2.5 rounded-xl border border-white/5 text-white/90"
                                            style={{ backgroundColor: `${cat.color}15`, borderColor: `${cat.color}25`, color: cat.color }}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="text-left flex flex-col min-w-0">
                                            <span className="font-bold text-white/95 truncate text-sm">{cat.name}</span>
                                            {limitVal > 0 ? (
                                                <span className="text-[10px] text-muted-foreground/80 mt-0.5">
                                                    Limit: ${limitVal.toLocaleString()}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground/60 mt-0.5 flex items-center gap-1">
                                                    <Info className="w-3 h-3 shrink-0" /> Set Limit
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Hover Controls */}
                                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleOpenEditModal(cat)}
                                            className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                                            aria-label="Edit budget"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteCategory(cat._id)}
                                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                                            aria-label="Delete budget"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Card content */}
                                <div className="px-5 pb-5 space-y-4">
                                    {/* Amounts Row */}
                                    <div className="flex justify-between items-end">
                                        <div className="text-left">
                                            <span className="text-xl font-extrabold text-white">${spent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mt-0.5">Spent Overall</span>
                                        </div>
                                        
                                        {limitVal > 0 && (
                                            <div className="text-right">
                                                <span className={cn(
                                                    "text-xs font-semibold block",
                                                    isOver ? "text-destructive" : "text-success"
                                                )}>
                                                    {isOver ? "-" : ""}${Math.abs(remaining).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </span>
                                                <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider block mt-0.5">
                                                    {isOver ? "Over Budget" : "Remaining"}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Animated Progress indicator */}
                                    {limitVal > 0 && (
                                        <div className="space-y-1.5">
                                            <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                                                    className={cn("h-full rounded-full", currentBarColor)}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center text-[9px] text-muted-foreground font-bold">
                                                <span>{percentage.toFixed(0)}% Used</span>
                                                {isOver && <span className="text-destructive animate-pulse">Exceeded!</span>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Add/Edit Budget Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCategory ? "Update Budget Settings" : "Configure Category Budget"}
                description="Set individual expenditure controls with category branding."
            >
                <form onSubmit={handleModalSubmit} className="space-y-5">
                    {/* Category Name */}
                    <Input
                        label="Category Name"
                        placeholder="e.g. Health & Fitness"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={formErrors.name}
                    />

                    {/* Limit */}
                    <Input
                        label="Monthly Budget Limit ($)"
                        placeholder="0.00"
                        type="number"
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
                        error={formErrors.limit}
                    />

                    {/* Preset Color Swatches */}
                    <div className="flex flex-col space-y-2 text-left">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Theme Color</span>
                        <div className="grid grid-cols-8 gap-2.5">
                            {COLOR_PRESETS.map((color) => (
                                <button
                                    key={color.name}
                                    type="button"
                                    onClick={() => setSelectedColor(color.value)}
                                    className={cn(
                                        "h-9 w-full rounded-xl border border-transparent transition-all cursor-pointer relative flex items-center justify-center hover:scale-105 active:scale-95",
                                        selectedColor === color.value && "border-white border-2 shadow-lg"
                                    )}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                >
                                    {selectedColor === color.value && (
                                        <span className="h-1.5 w-1.5 bg-white rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preset Icons Selection grid (12 Icons) */}
                    <div className="flex flex-col space-y-2 text-left">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Icon Swatch</span>
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
                                            "h-10 rounded-xl border border-white/5 bg-secondary/15 flex items-center justify-center text-muted-foreground hover:text-white hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer relative hover:scale-105 active:scale-95",
                                            isSelected && "border-primary bg-primary/10 text-primary hover:text-primary hover:bg-primary/10"
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
                    <div className="mt-8 border-t border-white/5 pt-4 flex items-center justify-end gap-3 shrink-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            isLoading={modalSubmitting}
                            className="px-6"
                        >
                            {editingCategory ? "Update Budget" : "Create Budget"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

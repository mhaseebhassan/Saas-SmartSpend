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
    AlertCircle,
    Info,
    ChevronLeft,
    ChevronRight,
    PieChart
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

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

const COLOR_PRESETS = [
    { name: "Slate", value: "#64748B" },
    { name: "Zinc", value: "#71717A" },
    { name: "Neutral", value: "#737373" },
    { name: "Stone", value: "#78716C" },
    { name: "Blue", value: "#3B82F6" },
    { name: "Indigo", value: "#6366F1" },
    { name: "Violet", value: "#64748b" },
    { name: "Emerald", value: "#10B981" }
];

export default function BudgetsPageClient() {
    const [categories, setCategories] = React.useState([]);
    const [expenses, setExpenses] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    
    const [selectedDate, setSelectedDate] = React.useState(() => new Date());
    
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingCategory, setEditingCategory] = React.useState(null);
    const [modalSubmitting, setModalSubmitting] = React.useState(false);

    const [name, setName] = React.useState("");
    const [limit, setLimit] = React.useState("");
    const [selectedColor, setSelectedColor] = React.useState(COLOR_PRESETS[0].value);
    const [selectedIcon, setSelectedIcon] = React.useState("other");
    const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

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

    const getSpentForCategory = (catId) => {
        return expenses
            .filter(exp => exp.categoryId?._id === catId || exp.categoryId === catId)
            .reduce((sum, curr) => sum + curr.amount, 0);
    };

    const totalSpent = expenses.reduce((sum, curr) => sum + curr.amount, 0);
    const totalBudget = categories.reduce((sum, curr) => sum + (curr.monthlyLimit || 0), 0);
    const budgetPercentage = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;

    const handleOpenAddModal = () => {
        setEditingCategory(null);
        setName("");
        setLimit("");
        setSelectedColor(COLOR_PRESETS[0].value);
        setSelectedIcon("other");
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (cat) => {
        setEditingCategory(cat);
        setName(cat.name);
        setLimit(cat.monthlyLimit ? cat.monthlyLimit.toString() : "");
        setSelectedColor(cat.color || COLOR_PRESETS[0].value);
        setSelectedIcon(cat.icon || "other");
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleDeleteCategory = async (id) => {
        if (!confirm("Are you sure you want to delete this category budget?")) return;

        try {
            const res = await fetch(`/api/categories/${id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                fetchData();
            }
        } catch (err) {
            console.error("Error deleting category:", err);
        }
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        
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
                res = await fetch(`/api/categories/${editingCategory._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            } else {
                res = await fetch("/api/categories", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            }

            if (res.ok) {
                setIsModalOpen(false);
                fetchData();
            }
        } catch (err) {
            console.error("Error saving category:", err);
        } finally {
            setModalSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 text-left select-none pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-white tracking-tight">Budgets</h1>
                    <p className="text-sm text-white/50 mt-1">Manage and track your monthly category allocations.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-[#0A0A0A] border border-white/[0.08] rounded-lg p-1">
                        <Button
                            variant="ghost" size="icon" onClick={handlePrevMonth}
                            className="h-7 w-7 text-white/50 hover:text-white"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-xs font-medium text-white px-2 min-w-[100px] text-center">
                            {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                        </span>
                        <Button
                            variant="ghost" size="icon" onClick={handleNextMonth}
                            className="h-7 w-7 text-white/50 hover:text-white"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>

                    <Button 
                        onClick={handleOpenAddModal}
                        className="bg-white text-black hover:bg-white/90 h-9 font-medium px-4"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Budget
                    </Button>
                </div>
            </div>

            {/* Overall Progress */}
            {!loading && categories.length > 0 && (
                <div className="p-6 rounded-xl border border-white/[0.08] bg-[#0A0A0A] shadow-sm">
                    <div className="flex justify-between items-end mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/[0.02] border border-white/[0.08] rounded-lg">
                                <PieChart className="w-5 h-5 text-white/70" />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-white">Total Budget</h3>
                                <p className="text-xs text-white/50">Overall allocation usage</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-xl font-semibold text-white">
                                ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                            <span className="text-sm text-white/40"> / ${totalBudget.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${budgetPercentage}%` }}
                                transition={{ duration: 1 }}
                                className="h-full bg-white rounded-full"
                            />
                        </div>
                        <div className="text-right text-xs text-white/40">
                            {budgetPercentage.toFixed(1)}% Used
                        </div>
                    </div>
                </div>
            )}

            {/* Budget Grid */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="h-40 w-full rounded-xl bg-[#0A0A0A] border border-white/[0.08] animate-pulse" />
                    ))
                ) : categories.length === 0 ? (
                    <div className="col-span-full py-16 flex flex-col items-center justify-center text-white/40 text-sm border border-white/[0.08] rounded-xl bg-[#0A0A0A]">
                        <AlertCircle className="w-8 h-8 mb-3 opacity-50" />
                        <span>No monthly budgets established.</span>
                    </div>
                ) : (
                    <AnimatePresence>
                        {categories.map((cat) => {
                            const spent = getSpentForCategory(cat._id);
                            const limitVal = cat.monthlyLimit || 0;
                            const percentage = limitVal > 0 ? (spent / limitVal) * 100 : 0;
                            const progressWidth = Math.min(100, percentage);
                            const remaining = limitVal - spent;
                            const isOver = spent > limitVal;
                            const Icon = ICON_MAP[cat.icon || "other"] || HelpCircle;

                            return (
                                <motion.div
                                    key={cat._id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="rounded-xl border border-white/[0.08] bg-[#0A0A0A] p-5 shadow-sm group"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/[0.02] border border-white/[0.08]"
                                            >
                                                <Icon className="w-4 h-4 text-white/70" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-white text-sm">{cat.name}</h3>
                                                <p className="text-xs text-white/40 mt-0.5">Limit: ${limitVal.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenEditModal(cat)} className="p-1.5 text-white/40 hover:text-white rounded-md hover:bg-white/[0.04]">
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => handleDeleteCategory(cat._id)} className="p-1.5 text-white/40 hover:text-red-400 rounded-md hover:bg-white/[0.04]">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <div className="text-xl font-semibold text-white tracking-tight">
                                                    ${spent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                </div>
                                                <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">Spent</div>
                                            </div>
                                            {limitVal > 0 && (
                                                <div className="text-right">
                                                    <div className={cn("text-sm font-medium", isOver ? "text-red-400" : "text-white/70")}>
                                                        {isOver ? "-" : ""}${Math.abs(remaining).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                    </div>
                                                    <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">
                                                        {isOver ? "Over" : "Left"}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {limitVal > 0 && (
                                            <div className="space-y-1.5">
                                                <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progressWidth}%` }}
                                                        className={cn("h-full rounded-full", isOver ? "bg-red-400" : "bg-white/80")}
                                                    />
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

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCategory ? "Edit Budget" : "New Budget"}
                description="Set your category limits."
            >
                <form onSubmit={handleModalSubmit} className="space-y-4">
                    <Input
                        label="Category Name"
                        placeholder="e.g. Groceries"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={formErrors.name}
                        className="bg-transparent border-white/[0.08]"
                    />

                    <Input
                        label="Monthly Limit ($)"
                        placeholder="0.00"
                        type="number"
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
                        error={formErrors.limit}
                        className="bg-transparent border-white/[0.08]"
                    />

                    <div className="flex flex-col space-y-2">
                        <span className="text-xs font-medium text-white/60">Icon</span>
                        <div className="grid grid-cols-6 gap-2">
                            {Object.keys(ICON_MAP).map((iconKey) => {
                                const IconComp = ICON_MAP[iconKey];
                                const isSelected = selectedIcon === iconKey;
                                return (
                                    <button
                                        key={iconKey}
                                        type="button"
                                        onClick={() => setSelectedIcon(iconKey)}
                                        className={cn(
                                            "h-10 rounded-lg border flex items-center justify-center transition-colors",
                                            isSelected ? "border-white text-white bg-white/[0.05]" : "border-white/[0.08] text-white/40 hover:text-white/80 bg-transparent"
                                        )}
                                    >
                                        <IconComp className="w-4 h-4" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/[0.08] flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" isLoading={modalSubmitting} className="bg-white text-black hover:bg-white/90">
                            {editingCategory ? "Save" : "Create"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

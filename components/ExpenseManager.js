"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ExpenseForm from "./ExpenseForm";
import { Trash2, Edit2, Filter, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

export default function ExpenseManager({ initialExpenses, currentMonth }) {
    const [expenses, setExpenses] = useState(initialExpenses);
    const [filterMonth, setFilterMonth] = useState(currentMonth);
    const [filterCategory, setFilterCategory] = useState("All");
    const [editingExpense, setEditingExpense] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const router = useRouter();

    const handleMonthChange = (e) => {
        const newMonth = e.target.value;
        setFilterMonth(newMonth);
        router.push(`/dashboard/expenses?month=${newMonth}`);
    };

    if (initialExpenses !== expenses) {
        setExpenses(initialExpenses);
    }

    const handleDelete = async (id) => {
        if (!confirm("Delete this expense?")) return;

        try {
            const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
            if (res.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredExpenses = expenses.filter(expense =>
        filterCategory === "All" || expense.category === filterCategory
    );

    return (
        <div className="space-y-6">

            <div className="flex flex-col md:flex-row justify-between gap-4">
                {/* Filters */}
                <div className="flex items-center gap-4 bg-card border border-border p-2 rounded-lg shadow-sm">
                    <Filter className="text-muted-foreground w-4 h-4 ml-2" />
                    <input
                        type="month"
                        value={filterMonth}
                        onChange={handleMonthChange}
                        className="bg-transparent border-none focus:ring-0 text-sm font-medium"
                    />
                    <div className="h-4 w-[1px] bg-border mx-1" />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-transparent border-none focus:ring-0 text-sm font-medium outline-none"
                    >
                        <option value="All">All Categories</option>
                        <option value="Food">Food</option>
                        <option value="Transport">Transport</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Bills">Bills</option>
                    </select>
                </div>

                <Button onClick={() => { setEditingExpense(null); setShowAddForm(!showAddForm); }}>
                    <Plus className="w-4 h-4 mr-2" /> Add Expense
                </Button>
            </div>

            <AnimatePresence>
                {(showAddForm || editingExpense) && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle>{editingExpense ? "Edit Expense" : "New Expense"}</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => { setShowAddForm(false); setEditingExpense(null); }}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <ExpenseForm
                                    existingExpense={editingExpense}
                                    onClose={() => { setShowAddForm(false); setEditingExpense(null); }}
                                    onSuccess={() => { setShowAddForm(false); setEditingExpense(null); }}
                                />
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/50 text-muted-foreground text-sm font-medium">
                            <tr>
                                <th className="p-4 rounded-tl-lg">Date</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Note</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4 text-right rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-muted-foreground">
                                        No expenses found.
                                    </td>
                                </tr>
                            ) : (
                                filteredExpenses.map((expense) => {
                                    const dateObj = new Date(expense.date);
                                    return (
                                        <tr key={expense._id} className="group hover:bg-muted/30 transition-colors">
                                            <td className="p-4 text-sm font-medium">{dateObj.toLocaleDateString()}</td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                    {expense.category}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-muted-foreground max-w-[200px] truncate">{expense.note}</td>
                                            <td className="p-4 text-sm font-bold">${expense.amount.toFixed(2)}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => { setEditingExpense(expense); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                                    >
                                                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(expense._id)}
                                                        className="text-destructive hover:text-destructive"
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
            </Card>
        </div>
    );
}

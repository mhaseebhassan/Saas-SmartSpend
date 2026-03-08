"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function ExpenseForm({ existingExpense, onClose, onSuccess }) {
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [note, setNote] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (existingExpense) {
            setAmount(existingExpense.amount);
            setCategory(existingExpense.category);
            setDate(new Date(existingExpense.date).toISOString().slice(0, 10));
            setNote(existingExpense.note || "");
        }
    }, [existingExpense]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = { amount: Number(amount), category, date, note };

        try {
            let res;
            if (existingExpense) {
                res = await fetch(`/api/expenses/${existingExpense._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
            } else {
                res = await fetch("/api/expenses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
            }

            if (res.ok) {
                if (!existingExpense) {
                    setAmount("");
                    setCategory("");
                    setNote("");
                    setDate(new Date().toISOString().slice(0, 10));
                }
                router.refresh();
                if (onSuccess) onSuccess();
                if (onClose) onClose();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={inputClass}
                        required
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <input
                        type="text"
                        list="expense-categories"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={inputClass}
                        placeholder="Select or Type..."
                        required
                    />
                    <datalist id="expense-categories">
                        <option value="Food" />
                        <option value="Transport" />
                        <option value="Entertainment" />
                        <option value="Bills" />
                        <option value="Rent" />
                        <option value="Shopping" />
                    </datalist>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium mb-2">Amount ($)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className={inputClass}
                        placeholder="0.00"
                        step="0.01"
                        required
                    />
                </div>
                <div className="flex-[2]">
                    <label className="block text-sm font-medium mb-2">Note (Optional)</label>
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className={inputClass}
                        placeholder="Details..."
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
                {onClose && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                )}
                <Button>{existingExpense ? "Update Expense" : "Add Expense"}</Button>
            </div>
        </form>
    );
}

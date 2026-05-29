"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Plus } from "lucide-react";

export default function BudgetForm() {
    const [category, setCategory] = useState("");
    const [limit, setLimit] = useState("");
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!category || !limit || !month) return;

        try {
            const res = await fetch("/api/budgets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ category, limit: Number(limit), month }),
            });

            if (res.ok) {
                setCategory("");
                setLimit("");
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const inputClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Set Monthly Budget</CardTitle>
                <CardDescription>Define spending limits for categories or overall budget.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-auto">
                        <label className="block text-sm font-medium mb-2">Month</label>
                        <input
                            type="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium mb-2">Category</label>
                        <input
                            type="text"
                            placeholder="e.g. Food, Travel, All"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className={inputClass}
                            list="budgets-categories"
                        />
                        <datalist id="budgets-categories">
                            <option value="All">Overall Limit</option>
                            <option value="Food" />
                            <option value="Transport" />
                            <option value="Entertainment" />
                            <option value="Bills" />
                        </datalist>
                    </div>
                    <div className="w-full md:w-40">
                        <label className="block text-sm font-medium mb-2">Limit ($)</label>
                        <input
                            type="number"
                            placeholder="500"
                            value={limit}
                            onChange={(e) => setLimit(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                    <Button className="w-full md:w-auto">
                        <Plus className="w-4 h-4 mr-2" /> Set Budget
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

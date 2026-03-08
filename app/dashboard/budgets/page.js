import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Budget from "@/models/Budget";
import Expense from "@/models/Expense";
import BudgetForm from "@/components/BudgetForm";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

async function getData() {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    await connectDB();
    const userId = session.user.id;
    const currentMonthStr = new Date().toISOString().slice(0, 7);

    const budgets = await Budget.find({ userId, month: currentMonthStr });

    const startOfMonth = new Date(`${currentMonthStr}-01`);
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);

    const expenses = await Expense.aggregate([
        {
            $match: {
                userId: new Object(userId),
                date: { $gte: startOfMonth, $lte: endOfMonth }
            }
        },
        {
            $group: {
                _id: "$category",
                total: { $sum: "$amount" }
            }
        }
    ]);

    const expenseMap = {};
    let totalExpenses = 0;
    expenses.forEach(e => {
        expenseMap[e._id] = e.total;
        totalExpenses += e.total;
    });

    expenseMap["All"] = totalExpenses;

    return { budgets, expenseMap };
}

export default async function BudgetsPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const data = await getData();
    if (!data) return <div>Loading...</div>;

    const { budgets, expenseMap } = data;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
                <p className="text-muted-foreground mt-1">Manage your monthly spending limits.</p>
            </div>

            <BudgetForm />

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {budgets.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No budgets set for this month. Start by adding one above!
                    </div>
                ) : (
                    budgets.map(budget => {
                        const spent = expenseMap[budget.category] || 0;
                        const percentage = Math.min(100, Math.round((spent / budget.limit) * 100));
                        const isOver = spent > budget.limit;

                        // Color calculation based on usage
                        let progressColor = "bg-primary";
                        if (percentage > 80) progressColor = "bg-yellow-500";
                        if (percentage >= 100) progressColor = "bg-destructive";

                        return (
                            <Card key={budget._id} className="overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="font-semibold text-lg">{budget.category === "All" ? "Total Budget" : budget.category}</CardTitle>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${isOver ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'}`}>
                                        {percentage}%
                                    </span>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-baseline mb-2">
                                        <span className="text-2xl font-bold">${spent.toLocaleString()}</span>
                                        <span className="text-sm text-muted-foreground">of ${budget.limit.toLocaleString()}</span>
                                    </div>

                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor}`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>

                                    {isOver && (
                                        <p className="text-xs text-destructive mt-2 font-medium">
                                            You've exceeded your limit!
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Expense from "@/models/Expense";
import Budget from "@/models/Budget";
import { SpendingChart, CategoryPieChart } from "@/components/Charts";
import { DollarSign, TrendingDown, Wallet, ArrowUpRight } from "lucide-react";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

async function getData() {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    await connectDB();
    const userId = session.user.id;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const [expenses, budgets] = await Promise.all([
        Expense.find({ userId, date: { $gte: startOfMonth, $lte: endOfMonth } }),
        Budget.find({ userId, month: currentMonthStr })
    ]);

    return { expenses, budgets };
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const data = await getData();
    if (!data) return <div>Loading...</div>;

    const { expenses, budgets } = data;

    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const totalBudget = budgets.reduce((acc, curr) => acc + curr.limit, 0);
    const remaining = totalBudget - totalExpenses;
    const budgetProgress = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

    // Chart Data Preparation
    const expensesByDate = expenses.reduce((acc, curr) => {
        const date = new Date(curr.date).toLocaleDateString("en-US", { day: 'numeric', month: 'short' });
        acc[date] = (acc[date] || 0) + curr.amount;
        return acc;
    }, {});

    const barChartData = Object.keys(expensesByDate).map(date => ({
        date,
        amount: expensesByDate[date]
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    const expensesByCategory = expenses.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
    }, {});

    const pieChartData = Object.keys(expensesByCategory).map(name => ({
        name,
        value: expensesByCategory[name]
    }));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Overview of your finances for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Budget"
                    value={`$${totalBudget.toLocaleString()}`}
                    icon={<Wallet className="w-5 h-5 text-blue-500" />}
                    description="Monthly limit"
                />
                <StatsCard
                    title="Total Expenses"
                    value={`$${totalExpenses.toLocaleString()}`}
                    icon={<TrendingDown className="w-5 h-5 text-red-500" />}
                    description={`${budgetProgress.toFixed(1)}% of budget used`}
                />
                <StatsCard
                    title="Remaining"
                    value={`$${remaining.toLocaleString()}`}
                    icon={<DollarSign className="w-5 h-5 text-green-500" />}
                    description="Available to spend"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Spending Overview</CardTitle>
                        <CardDescription>Daily spending for the current month.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <SpendingChart data={barChartData} />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Categories</CardTitle>
                        <CardDescription>Where your money went.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CategoryPieChart data={pieChartData} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Internal Stats Card Component
function StatsCard({ title, value, icon, description }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="h-9 w-9 bg-accent/50 rounded-lg flex items-center justify-center">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center">
                    {description}
                </p>
            </CardContent>
        </Card>
    )
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Expense from "@/models/Expense";
import { SpendingChart, CategoryPieChart } from "@/components/Charts";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

async function getData() {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    await connectDB();
    const userId = session.user.id;

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const expenses = await Expense.find({
        userId,
        date: { $gte: sixMonthsAgo },
    });

    return expenses;
}

export default async function ReportsPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const expenses = await getData();
    if (!expenses) return <div>Loading...</div>;

    const monthlyData = expenses.reduce((acc, curr) => {
        const date = new Date(curr.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        acc[key] = (acc[key] || 0) + curr.amount;
        return acc;
    }, {});

    const trendData = Object.keys(monthlyData).sort().map(key => ({
        date: key,
        amount: monthlyData[key]
    }));

    const categoryData = expenses.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
    }, {});

    const pieData = Object.keys(categoryData).map(name => ({
        name,
        value: categoryData[name]
    }));

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Financial Reports</h1>
                <p className="text-muted-foreground mt-1">Deep dive into your spending habits over the last 6 months.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Spending Trend</CardTitle>
                        <CardDescription>Monthly expenses for the past 6 months.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <SpendingChart data={trendData} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Category Distribution</CardTitle>
                        <CardDescription>Where your money goes (All time in range).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CategoryPieChart data={pieData} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

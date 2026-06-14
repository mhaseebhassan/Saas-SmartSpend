import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Expense from "@/models/Expense";
import Category from "@/models/Category";
import { SpendingChart, CategoryPieChart } from "@/components/Charts";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { TrendingUp, PieChart as PieChartIcon } from "lucide-react";

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
    }).populate({ path: "categoryId", select: "name color icon", model: Category });

    return expenses;
}

export default async function ReportsPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const expenses = await getData();
    if (!expenses) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400" />
            </div>
        );
    }

    const monthlyData = expenses.reduce((acc, curr) => {
        const date = new Date(curr.date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        acc[key] = (acc[key] || 0) + curr.amount;
        return acc;
    }, {} as Record<string, number>);

    const trendData = Object.keys(monthlyData).sort().map(key => ({
        date: key,
        amount: monthlyData[key]
    }));

    const categoryData = expenses.reduce((acc, curr) => {
        const category = curr.categoryId as unknown as { name?: string } | null;
        const categoryName = category?.name || "Uncategorized";
        acc[categoryName] = (acc[categoryName] || 0) + curr.amount;
        return acc;
    }, {} as Record<string, number>);

    const pieData = Object.keys(categoryData).map(name => ({
        name,
        value: categoryData[name]
    }));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Reports Page Header Section */}
            <div className="relative p-6 rounded-3xl border border-white/[0.06] bg-[#111827]/40 backdrop-blur-xl overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.03)]">
                {/* Visual mesh accent */}
                <div className="absolute top-0 right-0 w-[30%] h-[150%] rounded-full bg-gradient-to-br from-cyan-500/10 via-cyan-600/5 to-transparent blur-3xl pointer-events-none -z-10" />
                
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-400 tracking-tight">
                    Financial Reports
                </h1>
                <p className="text-[#94A3B8] text-sm mt-1 max-w-xl leading-relaxed">
                    Deep dive into your spending habits and monthly category distributions over the last 6 months.
                </p>
            </div>

            {/* Server-Rendered Charts in Glass Panel wraps */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-[#111827]/60 backdrop-blur-xl border-white/[0.06] hover:border-cyan-400/20 hover:shadow-[0_0_35px_rgba(6,182,212,0.08)] transition-all duration-500 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-white/[0.06] pb-4 mb-4">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-cyan-400" />
                                Spending Trend
                            </CardTitle>
                            <CardDescription className="text-xs text-[#94A3B8]">
                                Monthly expenses for the past 6 months
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="pl-0 pr-4 pt-2">
                        {trendData.length > 0 ? (
                            <SpendingChart data={trendData} />
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-xs text-[#64748B]">
                                No spending data available for this range
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-[#111827]/60 backdrop-blur-xl border-white/[0.06] hover:border-cyan-400/20 hover:shadow-[0_0_35px_rgba(6,182,212,0.08)] transition-all duration-500 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-white/[0.06] pb-4 mb-4">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                <PieChartIcon className="w-5 h-5 text-slate-400" />
                                Category Distribution
                            </CardTitle>
                            <CardDescription className="text-xs text-[#94A3B8]">
                                Where your money goes (All time in range)
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        {pieData.length > 0 ? (
                            <CategoryPieChart data={pieData} />
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-xs text-[#64748B]">
                                No expense categories logged yet
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

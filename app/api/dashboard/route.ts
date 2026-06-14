import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Expense from "@/models/Expense";
import Budget from "@/models/Budget";
import Category from "@/models/Category";

const serialize = (obj: any) => JSON.parse(JSON.stringify(obj));

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await connectDB();
        const userId = session.user.id;
        const now = new Date();
        
        // Dates for current month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

        // Dates for previous month
        const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        const prevMonthStr = `${prevStart.getFullYear()}-${String(prevStart.getMonth() + 1).padStart(2, "0")}`;

        const [
            expenses,
            budgets,
            recentExpenses,
            prevExpenses,
            prevBudgets
        ] = await Promise.all([
            Expense.find({ userId, date: { $gte: startOfMonth, $lte: endOfMonth } })
                .populate({ path: "categoryId", select: "name color icon", model: Category })
                .lean(),
            Budget.find({ userId, month: currentMonthStr }).lean(),
            Expense.find({ userId })
                .sort({ date: -1 })
                .limit(10)
                .populate({ path: "categoryId", select: "name color icon", model: Category })
                .lean(),
            Expense.find({ userId, date: { $gte: prevStart, $lte: prevEnd } }).lean(),
            Budget.find({ userId, month: prevMonthStr }).lean()
        ]);

        return NextResponse.json({
            expenses: serialize(expenses),
            budgets: serialize(budgets),
            recentExpenses: serialize(recentExpenses),
            prevExpenses: serialize(prevExpenses),
            prevBudgets: serialize(prevBudgets)
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
    }
}

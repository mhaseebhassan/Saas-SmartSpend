import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Expense from "@/models/Expense";
import Budget from "@/models/Budget";
import Category from "@/models/Category";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";

// Helper to sanitize Mongoose output for React Client components
const serialize = (obj) => JSON.parse(JSON.stringify(obj));

async function getDashboardData(userId) {
    await connectDB();

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
        // Expenses in current month populated with category names
        Expense.find({ userId, date: { $gte: startOfMonth, $lte: endOfMonth } })
            .populate({ path: "categoryId", select: "name color icon", model: Category })
            .lean(),
        
        // Budgets in current month
        Budget.find({ userId, month: currentMonthStr }).lean(),
        
        // Last 10 expenses for Recent Transactions card
        Expense.find({ userId })
            .sort({ date: -1 })
            .limit(10)
            .populate({ path: "categoryId", select: "name color icon", model: Category })
            .lean(),
        
        // Expenses in previous month
        Expense.find({ userId, date: { $gte: prevStart, $lte: prevEnd } }).lean(),
        
        // Budgets in previous month
        Budget.find({ userId, month: prevMonthStr }).lean()
    ]);

    return {
        expenses: serialize(expenses),
        budgets: serialize(budgets),
        recentExpenses: serialize(recentExpenses),
        prevExpenses: serialize(prevExpenses),
        prevBudgets: serialize(prevBudgets)
    };
}

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");

    const initialData = await getDashboardData(session.user.id);

    return <DashboardClient initialData={initialData} />;
}

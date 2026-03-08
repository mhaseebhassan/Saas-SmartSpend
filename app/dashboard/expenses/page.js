import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Expense from "@/models/Expense";
import ExpenseManager from "@/components/ExpenseManager";
import { redirect } from "next/navigation";

async function getData(month) {
    const session = await getServerSession(authOptions);
    if (!session) return null;

    await connectDB();
    const userId = session.user.id;

    // Calculate start/end of month
    // month comes as YYYY-MM
    const dateParts = month.split("-");
    const year = parseInt(dateParts[0]);
    const queryMonth = parseInt(dateParts[1]) - 1; // 0-indexed

    const startOfMonth = new Date(year, queryMonth, 1);
    const endOfMonth = new Date(year, queryMonth + 1, 0);

    const expenses = await Expense.find({
        userId,
        date: { $gte: startOfMonth, $lte: endOfMonth },
    }).sort({ date: -1 });

    // Convert to plain objects (serialization issue with Dates sometimes in Client Components)
    // Mongoose documents need to be serialized.
    return JSON.parse(JSON.stringify(expenses));
}

export default async function ExpensesPage({ searchParams }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/login");
    }

    const month = searchParams.month || new Date().toISOString().slice(0, 7);
    const expenses = await getData(month);

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Expenses</h1>
            <ExpenseManager initialExpenses={expenses} currentMonth={month} />
        </div>
    );
}

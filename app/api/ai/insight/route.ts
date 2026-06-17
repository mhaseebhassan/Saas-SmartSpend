import connectDB from "@/lib/mongodb";
import Expense from "@/models/Expense";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter } from "@/lib/openrouter";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // @ts-ignore
    const expenses = await Expense.find({
      userId: session.user.id,
      date: { $gte: thirtyDaysAgo },
    });

    if (!expenses || expenses.length === 0) {
      return NextResponse.json({ insight: "No expenses in the last 30 days. Add some to get AI insights." });
    }

    const totalSpend = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const categoryTotals: Record<string, number> = {};

    expenses.forEach((expense) => {
      // In case Category is referenced by ID or name
      // Usually category is a string if stored directly, or an ID if referenced.
      // Based on the ExpenseForm, `category` is a string.
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const sortedCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amount]) => `${cat} $${amount.toFixed(2)}`);

    const summaryString = `Total: $${totalSpend.toFixed(2)} across ${expenses.length} transactions. Top categories: ${sortedCategories.join(", ")}.`;

    const systemPrompt = "You are a personal finance advisor. Write exactly 3 short sentences: 1) what the user spent most on, 2) one observation about their pattern, 3) one specific actionable saving tip. No bullet points. Be direct and friendly.";
    
    const insight = await callOpenRouter(summaryString, systemPrompt, 150);

    return NextResponse.json({ insight });

  } catch (error) {
    console.error("AI insight error:", error);
    return NextResponse.json({ insight: "Could not generate insight right now." });
  }
}

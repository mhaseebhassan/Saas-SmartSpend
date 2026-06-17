import connectDB from "@/lib/mongodb";
import Expense from "@/models/Expense";
import Category from "@/models/Category";
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
    // Ensure Category model is loaded for population
    if (!Category) {
      console.warn("Category model not loaded");
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // @ts-ignore
    const expenses = await Expense.find({
      userId: session.user.id,
      date: { $gte: thirtyDaysAgo },
    }).populate("categoryId");

    if (!expenses || expenses.length === 0) {
      return NextResponse.json({ insight: "No expenses in the last 30 days. Add some to get AI insights." });
    }

    // Pass actual data to AI (RAG-like context)
    const recentExpenses = [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 40);

    const contextList = recentExpenses.map(
      (e) => {
        const catName = e.categoryId?.name || "Uncategorized";
        return `- ${new Date(e.date).toLocaleDateString()}: $${e.amount} at ${e.description || 'Unknown'} (${catName})`;
      }
    );

    const totalSpend = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    const summaryString = `Total 30-day Spend: $${totalSpend.toFixed(2)}.\nRecent Expenses Context:\n${contextList.join('\n')}`;

    const systemPrompt = "You are a personal finance advisor. Read the user's recent expenses data below. Write exactly 3 short sentences: 1) what the user spent most on, 2) one observation about their specific pattern or frequent purchases based on the data, 3) one specific actionable saving tip. No bullet points. Be direct and friendly.";
    
    const insight = await callOpenRouter(summaryString, systemPrompt, 150);

    return NextResponse.json({ insight });

  } catch (error) {
    console.error("AI insight error:", error);
    return NextResponse.json({ insight: "Could not generate insight right now." });
  }
}

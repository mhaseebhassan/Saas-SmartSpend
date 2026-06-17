import connectDB from "@/lib/mongodb";
import Expense from "@/models/Expense";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const now = new Date();
    const twentyEightDaysAgo = new Date();
    twentyEightDaysAgo.setDate(now.getDate() - 28);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // @ts-ignore
    const expenses = await Expense.find({
      userId: session.user.id,
      date: { $gte: twentyEightDaysAgo },
    });

    const thisWeekTotals: Record<string, number> = {};
    const prevWeeksTotals: Record<string, number> = {};

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.date);
      // Fallback for missing categories
      const cat = expense.category || "Uncategorized";
      if (expenseDate >= sevenDaysAgo) {
        thisWeekTotals[cat] = (thisWeekTotals[cat] || 0) + expense.amount;
      } else {
        prevWeeksTotals[cat] = (prevWeeksTotals[cat] || 0) + expense.amount;
      }
    });

    const anomalies: Array<{ category: string; thisWeek: number; average: number; spike: number }> = [];

    const allCategories = new Set([...Object.keys(thisWeekTotals), ...Object.keys(prevWeeksTotals)]);

    for (const cat of allCategories) {
      const thisWeekTotal = thisWeekTotals[cat] || 0;
      const prevTotal = prevWeeksTotals[cat] || 0;
      const weeklyAvg = prevTotal / 3;

      if (weeklyAvg > 0 && thisWeekTotal > weeklyAvg * 1.5) {
        const spike = Math.round(((thisWeekTotal - weeklyAvg) / weeklyAvg) * 100);
        anomalies.push({
          category: cat,
          thisWeek: thisWeekTotal,
          average: weeklyAvg,
          spike,
        });
      }
    }

    return NextResponse.json({ anomalies });
  } catch (error) {
    console.error("AI anomalies error:", error);
    return NextResponse.json({ anomalies: [] });
  }
}

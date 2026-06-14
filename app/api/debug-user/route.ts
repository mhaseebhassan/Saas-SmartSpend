import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import Expense from "@/models/Expense";
import connectDB from "@/lib/mongodb";

export async function GET() {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "No session" });
    
    const userId = session.user?.id;
    const expenses = await Expense.countDocuments({ userId });
    
    return NextResponse.json({
        userId,
        email: session.user?.email,
        expenseCount: expenses
    });
}

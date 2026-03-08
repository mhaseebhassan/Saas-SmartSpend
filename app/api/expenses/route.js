import connectDB from "@/lib/mongodb";
import Expense from "@/models/Expense";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { amount, category, date, note } = await req.json();
        await connectDB();

        const expense = await Expense.create({
            userId: session.user.id,
            amount,
            category,
            date,
            note,
        });

        return NextResponse.json(expense, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error creating expense", error: error.message },
            { status: 500 }
        );
    }
}

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month"); // Format: YYYY-MM
    const category = searchParams.get("category");

    try {
        await connectDB();

        let query = { userId: session.user.id };

        if (month) {
            const startOfMonth = new Date(`${month}-01`);
            const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);
            query.date = {
                $gte: startOfMonth,
                $lte: endOfMonth,
            };
        }

        if (category && category !== "All") {
            query.category = category;
        }

        const expenses = await Expense.find(query).sort({ date: -1 });

        return NextResponse.json(expenses, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error fetching expenses", error: error.message },
            { status: 500 }
        );
    }
}

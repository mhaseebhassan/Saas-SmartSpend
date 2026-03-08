import connectDB from "@/lib/mongodb";
import Budget from "@/models/Budget";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { category, limit, month } = await req.json();
        await connectDB();

        // Upsert budget
        const budget = await Budget.findOneAndUpdate(
            { userId: session.user.id, category, month },
            { limit },
            { new: true, upsert: true }
        );

        return NextResponse.json(budget, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error setting budget", error: error.message },
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

    if (!month) {
        return NextResponse.json({ message: "Month is required" }, { status: 400 });
    }

    try {
        await connectDB();
        const budgets = await Budget.find({ userId: session.user.id, month });
        return NextResponse.json(budgets, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error fetching budgets", error: error.message },
            { status: 500 }
        );
    }
}

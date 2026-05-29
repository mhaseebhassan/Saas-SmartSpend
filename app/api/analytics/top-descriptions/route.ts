import connectDB from "@/lib/mongodb";
import Expense from "@/models/Expense";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // 1. Check Pro status and constrain dates
        const user = await User.findById(session.user.id);
        const isPro = user?.isPro || false;

        const { searchParams } = new URL(req.url);
        const dateFrom = searchParams.get("dateFrom");
        const dateTo = searchParams.get("dateTo");

        let matchQuery: any = { userId: new mongoose.Types.ObjectId(session.user.id) };

        if (!isPro) {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            matchQuery.date = { $gte: startOfMonth, $lte: endOfMonth };
        } else {
            if (dateFrom || dateTo) {
                matchQuery.date = {};
                if (dateFrom) matchQuery.date.$gte = new Date(dateFrom);
                if (dateTo) matchQuery.date.$lte = new Date(dateTo);
            }
        }

        // 2. Aggregate by description
        const topDescriptions = await Expense.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: { $trim: { input: { $toLower: "$description" } } },
                    rawDescription: { $first: "$description" },
                    totalSpent: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 10 },
        ]);

        return NextResponse.json({
            isPro,
            topDescriptions,
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error loading top descriptions analytics", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

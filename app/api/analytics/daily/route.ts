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
                if (dateTo) {
                    const to = new Date(dateTo);
                    to.setUTCHours(23, 59, 59, 999);
                    matchQuery.date.$lte = to;
                }
            }
        }

        // 2. Aggregate by day
        const dailyData = await Expense.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    amount: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const formattedDaily = dailyData.map(item => ({
            date: item._id,
            amount: item.amount,
            count: item.count,
        }));

        return NextResponse.json({
            isPro,
            daily: formattedDaily,
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error loading daily analytics", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

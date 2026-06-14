import connectDB from "@/lib/mongodb";
import Expense from "@/models/Expense";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

const DAY_NAMES = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
];

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

        // 2. Group by day of week
        // Note: $dayOfWeek returns values from 1 (Sunday) to 7 (Saturday)
        const dayOfWeekData = await Expense.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: { $dayOfWeek: "$date" },
                    amount: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        // Initialize day map
        const dayMap: Record<number, { dayIndex: number; dayName: string; amount: number; count: number }> = {};
        for (let i = 1; i <= 7; i++) {
            dayMap[i] = {
                dayIndex: i,
                dayName: DAY_NAMES[i - 1],
                amount: 0,
                count: 0,
            };
        }

        // Populate actuals
        dayOfWeekData.forEach(item => {
            if (dayMap[item._id]) {
                dayMap[item._id].amount = item.amount;
                dayMap[item._id].count = item.count;
            }
        });

        const formattedDays = Object.values(dayMap);

        return NextResponse.json({
            isPro,
            byDayOfWeek: formattedDays,
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error loading day of week analytics", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

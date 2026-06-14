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

        // 2. Perform aggregate summary
        const summaryData = await Expense.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalSpent: { $sum: "$amount" },
                    count: { $sum: 1 },
                    avgSpent: { $avg: "$amount" },
                },
            },
        ]);

        const summary = summaryData[0] || { totalSpent: 0, count: 0, avgSpent: 0 };

        // 3. Category Breakdown Aggregation
        const categoryData = await Expense.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: "$categoryId",
                    amount: { $sum: "$amount" },
                    count: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "categoryDetails",
                },
            },
            { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    amount: 1,
                    count: 1,
                    name: { $ifNull: ["$categoryDetails.name", "Uncategorized"] },
                    color: { $ifNull: ["$categoryDetails.color", "#cccccc"] },
                    icon: { $ifNull: ["$categoryDetails.icon", ""] },
                },
            },
            { $sort: { amount: -1 } },
        ]);

        // Calculate percentages
        const total = summary.totalSpent || 1;
        const categoryBreakdown = categoryData.map(item => ({
            ...item,
            percentage: Math.round((item.amount / total) * 10000) / 100,
        }));

        return NextResponse.json({
            isPro,
            totalSpent: summary.totalSpent,
            count: summary.count,
            avgSpent: Math.round(summary.avgSpent * 100) / 100,
            categoryBreakdown,
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error loading summary analytics", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

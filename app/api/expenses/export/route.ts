import connectDB from "@/lib/mongodb";
import Expense from "@/models/Expense";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // 1. Verify if user is Pro
        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (!user.isPro) {
            return NextResponse.json(
                { message: "CSV export is a Pro only feature. Please upgrade to Pro to access this." },
                { status: 403 }
            );
        }

        // 2. Fetch all expenses with identical filtering as GET /api/expenses (no pagination)
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search");
        const categoryId = searchParams.get("categoryId");
        const dateFrom = searchParams.get("dateFrom");
        const dateTo = searchParams.get("dateTo");
        const minAmount = searchParams.get("minAmount");
        const maxAmount = searchParams.get("maxAmount");
        const sortBy = searchParams.get("sortBy") || "date";
        const sortOrder = searchParams.get("sortOrder") || "desc";

        let query: any = { userId: session.user.id };

        if (search) {
            query.$or = [
                { description: { $regex: search, $options: "i" } },
                { note: { $regex: search, $options: "i" } },
            ];
        }

        if (categoryId) {
            query.categoryId = categoryId;
        }

        if (dateFrom || dateTo) {
            query.date = {};
            if (dateFrom) {
                query.date.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                query.date.$lte = new Date(dateTo);
            }
        }

        if (minAmount || maxAmount) {
            query.amount = {};
            if (minAmount) {
                query.amount.$gte = parseFloat(minAmount);
            }
            if (maxAmount) {
                query.amount.$lte = parseFloat(maxAmount);
            }
        }

        const expenses = await Expense.find(query)
            .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
            .populate("categoryId", "name");

        // 3. Generate CSV content
        const headers = ["Date", "Description", "Category", "Amount", "Note", "Recurring", "Interval"];
        const rows = expenses.map(e => [
            e.date.toISOString().split("T")[0],
            `"${(e.description || "").replace(/"/g, '""')}"`,
            `"${(e.categoryId?.name || "Uncategorized").replace(/"/g, '""')}"`,
            e.amount,
            `"${(e.note || "").replace(/"/g, '""')}"`,
            e.isRecurring ? "Yes" : "No",
            e.recurrenceInterval || "N/A",
        ]);

        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": "attachment; filename=expenses.csv",
            },
        });
    } catch (error) {
        return NextResponse.json(
            { message: "Error exporting CSV", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

import connectDB from "@/lib/mongodb";
import Expense from "@/models/Expense";
import User from "@/models/User";
import Category from "@/models/Category";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// Helper function to process recurring expenses
async function processRecurringExpenses(userId: string) {
    const now = new Date();
    // Fetch all active recurring expenses for this user
    const recurringExpenses = await Expense.find({
        userId,
        isRecurring: true,
        recurrenceInterval: { $in: ["weekly", "monthly"] },
        isPaused: { $ne: true },
    });

    for (const parent of recurringExpenses) {
        let baseDate = parent.lastProcessedAt || parent.date;
        let nextDate = new Date(baseDate);
        let createdAny = false;

        while (true) {
            const nextOccurrence = new Date(nextDate);
            if (parent.recurrenceInterval === "weekly") {
                nextOccurrence.setDate(nextOccurrence.getDate() + 7);
            } else if (parent.recurrenceInterval === "monthly") {
                nextOccurrence.setMonth(nextOccurrence.getMonth() + 1);
            }

            // If the next occurrence is in the future, stop creating
            if (nextOccurrence > now) {
                break;
            }

            // Create recurring occurrence
            await Expense.create({
                userId: parent.userId,
                categoryId: parent.categoryId,
                description: parent.description,
                amount: parent.amount,
                date: nextOccurrence,
                note: parent.note ? `Recurring: ${parent.note}` : "Recurring occurrence",
                isRecurring: false,
                recurrenceInterval: null,
                parentExpenseId: parent._id,
            });

            nextDate = nextOccurrence;
            createdAny = true;
        }

        if (createdAny) {
            parent.lastProcessedAt = nextDate;
            await parent.save();
        }
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Automatically run the recurring expense processor for this user
        await processRecurringExpenses(session.user.id);

        const { searchParams } = new URL(req.url);
        const page = searchParams.get("page") || "1";
        const limit = searchParams.get("limit") || "20";
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

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const skip = (pageNum - 1) * limitNum;

        const totalExpenses = await Expense.countDocuments(query);
        const expenses = await Expense.find(query)
            .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
            .skip(skip)
            .limit(limitNum)
            .populate("categoryId", "name color icon");

        return NextResponse.json({
            expenses,
            pagination: {
                total: totalExpenses,
                page: pageNum,
                limit: limitNum,
                pages: Math.ceil(totalExpenses / limitNum),
            },
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error fetching expenses", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

interface CreateExpenseBody {
    amount: number | string;
    categoryId: string;
    description: string;
    date?: string | Date;
    note?: string;
    isRecurring?: boolean;
    recurrenceInterval?: string | null;
    isPaused?: boolean;
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const {
            amount,
            categoryId,
            description,
            date,
            note,
            isRecurring,
            recurrenceInterval,
            isPaused,
        } = await req.json() as CreateExpenseBody;

        if (!categoryId || !description || amount === undefined) {
            return NextResponse.json(
                { message: "CategoryId, description, and amount are required" },
                { status: 400 }
            );
        }

        if (parseFloat(amount) < 0) {
            return NextResponse.json(
                { message: "Amount must be positive" },
                { status: 400 }
            );
        }

        await connectDB();

        // Verify the category exists and belongs to the user
        const categoryExists = await Category.findOne({ _id: categoryId, userId: session.user.id });
        if (!categoryExists) {
            return NextResponse.json(
                { message: "Invalid categoryId or unauthorized" },
                { status: 400 }
            );
        }

        const expense = await Expense.create({
            userId: session.user.id,
            categoryId,
            description,
            amount: parseFloat(amount),
            date: date ? new Date(date) : new Date(),
            note: note || "",
            isRecurring: isRecurring || false,
            recurrenceInterval: isRecurring ? (recurrenceInterval || "monthly") : null,
            isPaused: isPaused || false,
        });

        // Trigger budget alerting system
        try {
            const user = await User.findById(session.user.id);
            if (user && categoryExists.monthlyLimit > 0) {
                const expenseDate = expense.date || new Date();
                const startOfMonth = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), 1);
                const endOfMonth = new Date(expenseDate.getFullYear(), expenseDate.getMonth() + 1, 0, 23, 59, 59, 999);

                const totalExpenses = await Expense.aggregate([
                    {
                        $match: {
                            userId: user._id,
                            categoryId: categoryExists._id,
                            date: { $gte: startOfMonth, $lte: endOfMonth },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$amount" },
                        },
                    },
                ]);

                const totalAmount = totalExpenses[0]?.total || 0;
                const limit = categoryExists.monthlyLimit;
                const percentUsed = (totalAmount / limit) * 100;

                if (percentUsed >= 80) {
                    const lastAlert = categoryExists.lastAlertSentAt;
                    const alreadySent = lastAlert &&
                        lastAlert.getFullYear() === expenseDate.getFullYear() &&
                        lastAlert.getMonth() === expenseDate.getMonth();

                    if (!alreadySent) {
                        // Mark category alert sent to prevent duplicate calls
                        categoryExists.lastAlertSentAt = new Date();
                        await categoryExists.save();

                        // Create in-app budget alert notification
                        const Notification = (await import("@/models/Notification")).default;
                        await Notification.create({
                            userId: user._id,
                            title: "Budget Warning: 80% Exceeded",
                            message: `You have spent ${percentUsed.toFixed(0)}% of your monthly budget for ${categoryExists.name} (${new Intl.NumberFormat('en-US', { style: 'currency', currency: user.currency || 'USD' }).format(totalAmount)} of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: user.currency || 'USD' }).format(limit)}).`,
                            type: "budget",
                            link: "/dashboard/budgets",
                        });

                        // Fire off the email asynchronously without blocking the client response (only for Pro users)
                        if (user.isPro) {
                            const { sendBudgetAlert } = await import("@/lib/email");
                            sendBudgetAlert({
                                to: user.email,
                                categoryName: categoryExists.name,
                                percentUsed: percentUsed,
                                amountSpent: totalAmount,
                                budgetLimit: limit,
                                currency: user.currency || "$",
                            }).catch((err) => {
                                console.error("Resend budget alert mail delivery failed:", err);
                            });
                        }
                    }
                }
            }
        } catch (alertError) {
            console.error("Failed executing budget alert logic:", alertError);
        }

        return NextResponse.json(expense, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error creating expense", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

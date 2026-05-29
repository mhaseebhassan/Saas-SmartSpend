import connectDB from "@/lib/mongodb";
import Expense from "@/models/Expense";
import User from "@/models/User";
import Category from "@/models/Category";
import Notification from "@/models/Notification";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const authHeader = req.headers.get("Authorization");
        const cronSecret = process.env.CRON_SECRET;
        const isAuthorized = !cronSecret || authHeader === `Bearer ${cronSecret}`;
        
        if (!isAuthorized) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const now = new Date();
        const recurringExpenses = await Expense.find({
            isRecurring: true,
            recurrenceInterval: { $in: ["weekly", "monthly"] },
        });

        let processedCount = 0;
        let duplicatedCount = 0;

        for (const parent of recurringExpenses) {
            let baseDate = parent.lastProcessedAt || parent.date;
            let nextDate = new Date(baseDate);
            let createdAny = false;
            let occurrencesCreated = [];

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
                const newExpense = await Expense.create({
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

                occurrencesCreated.push(newExpense);
                nextDate = nextOccurrence;
                createdAny = true;
                duplicatedCount++;
            }

            if (createdAny) {
                parent.lastProcessedAt = nextDate;
                await parent.save();

                // Trigger in-app notification for the processed recurring expense
                const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parent.amount);
                const occurrencesCount = occurrencesCreated.length;

                await Notification.create({
                    userId: parent.userId,
                    title: "Recurring Expense Processed",
                    message: `Processed ${occurrencesCount} occurrence(s) for "${parent.description}" (${formattedAmount} each).`,
                    type: "recurring",
                    link: "/dashboard/expenses",
                });

                // Also run budget check for this user and category
                try {
                    const user = await User.findById(parent.userId);
                    const categoryExists = await Category.findById(parent.categoryId);
                    if (user && categoryExists && categoryExists.monthlyLimit > 0) {
                        const expenseDate = nextDate;
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
                                categoryExists.lastAlertSentAt = new Date();
                                await categoryExists.save();

                                // Create budget alert notification
                                await Notification.create({
                                    userId: user._id,
                                    title: "Budget Warning: 80% Exceeded",
                                    message: `You have spent ${percentUsed.toFixed(0)}% of your monthly budget for ${categoryExists.name} (${new Intl.NumberFormat('en-US', { style: 'currency', currency: user.currency || 'USD' }).format(totalAmount)} of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: user.currency || 'USD' }).format(limit)}).`,
                                    type: "budget",
                                    link: "/dashboard/budgets",
                                });

                                // Fire off email
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
                } catch (budgetErr) {
                    console.error("Failed running budget alert for recurring expense:", budgetErr);
                }
            }
            processedCount++;
        }

        return NextResponse.json({
            message: "Recurring expenses processed successfully",
            processedCount,
            duplicatedCount,
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json(
            { message: "Error processing recurring expenses", error: error.message },
            { status: 500 }
        );
    }
}

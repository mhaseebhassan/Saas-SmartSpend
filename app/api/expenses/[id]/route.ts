import connectDB from "@/lib/mongodb";
import Expense from "@/models/Expense";
import Category from "@/models/Category";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await connectDB();

        const expense = await Expense.findOne({ _id: id, userId: session.user.id })
            .populate("categoryId", "name color icon");

        if (!expense) {
            return NextResponse.json({ message: "Expense not found" }, { status: 404 });
        }

        return NextResponse.json(expense, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error fetching expense", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

interface UpdateExpenseBody {
    amount?: number | string;
    categoryId?: string;
    description?: string;
    date?: string | Date;
    note?: string;
    isRecurring?: boolean;
    recurrenceInterval?: string | null;
    isPaused?: boolean;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const {
            amount,
            categoryId,
            description,
            date,
            note,
            isRecurring,
            recurrenceInterval,
            isPaused,
        } = await req.json() as UpdateExpenseBody;

        await connectDB();

        const expense = await Expense.findOne({ _id: id, userId: session.user.id });
        if (!expense) {
            return NextResponse.json({ message: "Expense not found" }, { status: 404 });
        }

        if (categoryId !== undefined) {
            // Verify category belongs to user
            const categoryExists = await Category.findOne({ _id: categoryId, userId: session.user.id });
            if (!categoryExists) {
                return NextResponse.json({ message: "Invalid categoryId or unauthorized" }, { status: 400 });
            }
            expense.categoryId = categoryId;
        }

        if (description !== undefined) {
            if (!description.trim()) {
                return NextResponse.json({ message: "Description cannot be empty" }, { status: 400 });
            }
            expense.description = description;
        }

        if (amount !== undefined) {
            const parsedAmount = typeof amount === "string" ? parseFloat(amount) : amount;
            if (parsedAmount < 0) {
                return NextResponse.json({ message: "Amount must be positive" }, { status: 400 });
            }
            expense.amount = parsedAmount;
        }

        if (date !== undefined) expense.date = new Date(date);
        if (note !== undefined) expense.note = note;

        if (isRecurring !== undefined) expense.isRecurring = isRecurring;
        if (recurrenceInterval !== undefined) {
            expense.recurrenceInterval = isRecurring ? recurrenceInterval : null;
        } else if (isRecurring === false) {
            expense.recurrenceInterval = null;
        }
        if (isPaused !== undefined) expense.isPaused = isPaused;

        await expense.save();

        const updatedExpense = await Expense.findById(expense._id).populate("categoryId", "name color icon");
        return NextResponse.json(updatedExpense, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error updating expense", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;

        await connectDB();
        const result = await Expense.deleteOne({ _id: id, userId: session.user.id });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: "Expense not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Expense deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error deleting expense", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

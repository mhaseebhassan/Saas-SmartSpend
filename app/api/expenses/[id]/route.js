import connectDB from "@/lib/mongodb";
import Expense from "@/models/Expense";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    try {
        const { amount, category, date, note } = await req.json();
        await connectDB();

        const expense = await Expense.findOne({ _id: id, userId: session.user.id });

        if (!expense) {
            return NextResponse.json({ message: "Expense not found" }, { status: 404 });
        }

        expense.amount = amount;
        expense.category = category;
        expense.date = date;
        expense.note = note;

        await expense.save();

        return NextResponse.json(expense, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error updating expense", error: error.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    try {
        await connectDB();
        const result = await Expense.deleteOne({ _id: id, userId: session.user.id });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: "Expense not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Expense deleted" }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error deleting expense", error: error.message },
            { status: 500 }
        );
    }
}

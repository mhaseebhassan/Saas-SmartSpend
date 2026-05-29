import connectDB from "@/lib/mongodb";
import Expense from "@/models/Expense";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { ids } = await req.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { message: "An array of ids is required" },
                { status: 400 }
            );
        }

        await connectDB();

        // Perform bulk delete, ensuring all matching IDs belong to the user
        const result = await Expense.deleteMany({
            _id: { $in: ids },
            userId: session.user.id,
        });

        return NextResponse.json({
            message: `${result.deletedCount} expenses deleted successfully`,
            deletedCount: result.deletedCount,
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error performing bulk delete", error: error.message },
            { status: 500 }
        );
    }
}

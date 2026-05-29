import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;

        await connectDB();
        const category = await Category.findOne({ _id: id, userId: session.user.id });
        if (!category) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 });
        }

        return NextResponse.json(category, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error fetching category", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

interface UpdateCategoryBody {
    name?: string;
    color?: string;
    icon?: string;
    monthlyLimit?: number;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;
        const { name, color, icon, monthlyLimit } = await req.json() as UpdateCategoryBody;

        await connectDB();
        const category = await Category.findOne({ _id: id, userId: session.user.id });
        if (!category) {
            return NextResponse.json({ message: "Category not found or unauthorized" }, { status: 404 });
        }

        if (name !== undefined) category.name = name;
        if (color !== undefined) category.color = color;
        if (icon !== undefined) category.icon = icon;
        if (monthlyLimit !== undefined) category.monthlyLimit = monthlyLimit;

        await category.save();

        return NextResponse.json(category, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error updating category", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;

        await connectDB();
        const category = await Category.findOneAndDelete({ _id: id, userId: session.user.id });
        if (!category) {
            return NextResponse.json({ message: "Category not found or unauthorized" }, { status: 404 });
        }

        // If the user had this category as defaultCategory, update the user to clear it
        await User.updateOne(
            { _id: session.user.id, defaultCategory: id },
            { $unset: { defaultCategory: "" } }
        );

        return NextResponse.json({ message: "Category deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error deleting category", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

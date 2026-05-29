import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
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
        const categories = await Category.find({ userId: session.user.id }).sort({ name: 1 });
        return NextResponse.json(categories, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error fetching categories", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

interface CreateCategoryBody {
    name: string;
    color: string;
    icon?: string;
    monthlyLimit?: number;
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { name, color, icon, monthlyLimit } = await req.json() as CreateCategoryBody;

        if (!name || !color) {
            return NextResponse.json(
                { message: "Name and color are required fields" },
                { status: 400 }
            );
        }

        await connectDB();

        // Check if the user is Pro
        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (!user.isPro) {
            // Count existing categories for free users
            const categoryCount = await Category.countDocuments({ userId: session.user.id });
            if (categoryCount >= 3) {
                return NextResponse.json(
                    { message: "Free tier users are limited to 3 categories. Please upgrade to Pro for unlimited categories." },
                    { status: 403 }
                );
            }
        }

        const category = await Category.create({
            userId: session.user.id,
            name,
            color,
            icon: icon || "",
            monthlyLimit: monthlyLimit || 0,
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error creating category", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

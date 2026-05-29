import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Category from "@/models/Category";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await User.findById(session.user.id)
            .populate("defaultCategory", "name color icon");

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            currency: user.currency || "USD",
            dateFormat: user.dateFormat || "MM/DD/YYYY",
            defaultCategory: user.defaultCategory || null,
            onboardingComplete: user.onboardingComplete || false,
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error fetching preferences", error: error.message },
            { status: 500 }
        );
    }
}

export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { currency, dateFormat, defaultCategory, onboardingComplete } = await req.json();

        await connectDB();
        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (currency !== undefined) {
            user.currency = currency;
        }

        if (dateFormat !== undefined) {
            user.dateFormat = dateFormat;
        }

        if (onboardingComplete !== undefined) {
            user.onboardingComplete = onboardingComplete;
        }

        if (defaultCategory !== undefined) {
            if (defaultCategory) {
                // Verify the category belongs to the user
                const categoryExists = await Category.findOne({ _id: defaultCategory, userId: session.user.id });
                if (!categoryExists) {
                    return NextResponse.json(
                        { message: "Invalid defaultCategory or unauthorized" },
                        { status: 400 }
                    );
                }
                user.defaultCategory = defaultCategory;
            } else {
                user.defaultCategory = null;
            }
        }

        await user.save();

        const updatedUser = await User.findById(user._id)
            .populate("defaultCategory", "name color icon");

        return NextResponse.json({
            currency: updatedUser.currency,
            dateFormat: updatedUser.dateFormat,
            defaultCategory: updatedUser.defaultCategory,
            onboardingComplete: updatedUser.onboardingComplete || false,
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error updating preferences", error: error.message },
            { status: 500 }
        );
    }
}

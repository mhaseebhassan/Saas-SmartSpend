import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            { isPro: true, proSince: new Date() },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Upgraded to Pro successfully", isPro: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error upgrading to Pro", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        
        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            { isPro: true },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(
            { success: true, message: "User upgraded successfully" },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: "Error upgrading user", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !(session.user as any)?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const userId = (session.user as any).id;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { isPro: true },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Upgraded to Pro successfully", isPro: true }, { status: 200 });
    } catch (error) {
        console.error("Demo upgrade error:", error);
        return NextResponse.json(
            { message: "Error upgrading to Pro", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

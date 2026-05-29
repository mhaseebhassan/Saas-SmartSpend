import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Soft delete the user by setting deletedAt
        user.deletedAt = new Date();
        await user.save();

        return NextResponse.json({ message: "Account deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error deleting user account", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { name } = await req.json();

        if (!name || name.trim().length === 0) {
            return NextResponse.json({ message: "Name is required" }, { status: 400 });
        }

        await connectDB();
        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        user.name = name.trim();
        await user.save();

        return NextResponse.json({ 
            message: "Profile updated successfully",
            user: { name: user.name, email: user.email }
        }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error updating profile", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

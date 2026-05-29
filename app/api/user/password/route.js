import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { currentPassword, newPassword } = await req.json();

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json(
                { message: "New password must be at least 6 characters long" },
                { status: 400 }
            );
        }

        await connectDB();
        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // If the user has a password set (i.e. did not register solely with Google)
        if (user.password) {
            if (!currentPassword) {
                return NextResponse.json(
                    { message: "Current password is required to change password" },
                    { status: 400 }
                );
            }

            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return NextResponse.json(
                    { message: "Incorrect current password" },
                    { status: 400 }
                );
            }
        }

        // Hash and save new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        
        // If they had no credentials provider set, update provider to credentials
        if (user.provider === "google" && !user.password) {
            user.provider = "credentials";
        }

        await user.save();

        return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error updating password", error: error.message },
            { status: 500 }
        );
    }
}

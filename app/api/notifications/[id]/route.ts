import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;
        await connectDB();

        // Mark specific notification as read if it belongs to current user
        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId: session.user.id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return NextResponse.json({ message: "Notification not found" }, { status: 404 });
        }

        return NextResponse.json(notification, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error updating notification status", error: error.message },
            { status: 500 }
        );
    }
}

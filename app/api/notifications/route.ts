import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
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

        // Get notifications for user, sorted by date
        const notifications = await Notification.find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({
            userId: session.user.id,
            isRead: false,
        });

        return NextResponse.json({ notifications, unreadCount }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error fetching notifications", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // Mark all as read for user
        await Notification.updateMany(
            { userId: session.user.id, isRead: false },
            { isRead: true }
        );

        return NextResponse.json({ message: "All notifications marked as read" }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error marking all notifications as read", error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: [true, "Please provide a title"],
        },
        message: {
            type: String,
            required: [true, "Please provide a message"],
        },
        type: {
            type: String,
            enum: ["budget", "recurring", "subscription", "info", "general"],
            default: "general",
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        link: {
            type: String,
        },
    },
    { timestamps: true }
);

// Index for fast retrieval of unread notifications per user
NotificationSchema.index({ userId: 1, isRead: 1 });

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

import mongoose from "mongoose";

export interface INotification extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: "budget" | "recurring" | "subscription" | "info" | "general";
    isRead: boolean;
    link?: string;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new mongoose.Schema<INotification>(
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
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Index for fast retrieval of unread notifications per user
NotificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;

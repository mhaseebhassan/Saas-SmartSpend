import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: [true, "Please provide a category name"],
            trim: true,
        },
        color: {
            type: String,
            required: [true, "Please provide a color"],
        },
        icon: {
            type: String,
        },
        monthlyLimit: {
            type: Number,
            default: 0,
        },
        lastAlertSentAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Category || mongoose.model("Category", CategorySchema);

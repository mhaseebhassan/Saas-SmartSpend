import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        amount: {
            type: Number,
            required: [true, "Please provide an amount"],
        },
        category: {
            type: String,
            required: [true, "Please provide a category"],
        },
        date: {
            type: Date,
            required: [true, "Please provide a date"],
            default: Date.now,
        },
        note: {
            type: String,
            trim: true,
            maxlength: 100,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);

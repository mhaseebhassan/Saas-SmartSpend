import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Please provide a category"],
        },
        description: {
            type: String,
            required: [true, "Please provide a description"],
            trim: true,
        },
        amount: {
            type: Number,
            required: [true, "Please provide an amount"],
            min: [0, "Amount must be positive"],
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
        isRecurring: {
            type: Boolean,
            default: false,
        },
        recurrenceInterval: {
            type: String,
            enum: ["weekly", "monthly", null],
            default: null,
        },
        isPaused: {
            type: Boolean,
            default: false,
        },
        lastProcessedAt: {
            type: Date,
        },
        parentExpenseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Expense",
            default: null,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);

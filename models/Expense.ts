import mongoose from "mongoose";

export interface IExpense extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    categoryId: mongoose.Types.ObjectId;
    description: string;
    amount: number;
    date: Date;
    note?: string;
    isRecurring: boolean;
    recurrenceInterval?: "weekly" | "monthly" | null;
    isPaused: boolean;
    lastProcessedAt?: Date;
    parentExpenseId?: mongoose.Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}

const ExpenseSchema = new mongoose.Schema<IExpense>(
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
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ExpenseSchema.index({ userId: 1, date: -1 });
ExpenseSchema.index({ categoryId: 1 });

const Expense = mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);
export default Expense;

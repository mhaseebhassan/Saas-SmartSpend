import mongoose from "mongoose";

const BudgetSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        category: {
            type: String, // 'All' for total monthly budget, or specific 'Food', etc.
            required: true,
        },
        limit: {
            type: Number,
            required: true,
        },
        month: {
            type: String, // format: "YYYY-MM"
            required: true,
        },
    },
    { timestamps: true }
);

// Compound index to ensure one budget per category per month per user
BudgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

export default mongoose.models.Budget || mongoose.model("Budget", BudgetSchema);

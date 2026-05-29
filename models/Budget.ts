import mongoose from "mongoose";

export interface IBudget extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    category: string;
    limit: number;
    month: string;
    createdAt: Date;
    updatedAt: Date;
}

const BudgetSchema = new mongoose.Schema<IBudget>(
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
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Compound index to ensure one budget per category per month per user
BudgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

const Budget = mongoose.models.Budget || mongoose.model<IBudget>("Budget", BudgetSchema);
export default Budget;

import mongoose from "mongoose";

export interface ICategory extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    color: string;
    icon?: string;
    monthlyLimit: number;
    lastAlertSentAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema = new mongoose.Schema<ICategory>(
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

const Category = mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
export default Category;

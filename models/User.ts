import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password?: string;
    image?: string;
    provider: string;
    isPro: boolean;
    stripeCustomerId?: string;
    currency: string;
    dateFormat: string;
    defaultCategory?: mongoose.Types.ObjectId;
    onboardingComplete: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, "Please provide a name"],
        },
        email: {
            type: String,
            required: [true, "Please provide an email"],
            unique: true,
        },
        password: {
            type: String,
            // Password is optional because Google OAuth users won't have one
            required: false,
        },
        image: {
            type: String,
        },
        provider: {
            type: String,
            default: "credentials",
        },
        isPro: {
            type: Boolean,
            default: false,
        },
        stripeCustomerId: {
            type: String,
        },
        currency: {
            type: String,
            default: "USD",
        },
        dateFormat: {
            type: String,
            default: "MM/DD/YYYY",
        },
        defaultCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        },
        onboardingComplete: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
        },
    },
    { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;

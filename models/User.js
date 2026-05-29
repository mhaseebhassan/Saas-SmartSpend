import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
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
    { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
